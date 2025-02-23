package com.jootalkpia.signaling_server.rtc;

import com.google.gson.JsonArray;
import java.io.Closeable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.Continuation;
import org.kurento.client.EventListener;
import org.kurento.client.IceCandidate;
import org.kurento.client.IceCandidateFoundEvent;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;
import org.kurento.jsonrpc.JsonUtils;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.google.gson.JsonObject;

@Slf4j
@RequiredArgsConstructor
@Getter
public class UserSession implements Closeable {

    private final Long userId;
    private final Long channelId;
    private final String sessionId;
    private final SimpMessagingTemplate messagingTemplate;
    private final MediaPipeline pipeline;
    private final WebRtcEndpoint outgoingMedia;
    private final ConcurrentMap<Long, WebRtcEndpoint> incomingMedia = new ConcurrentHashMap<>();

    public UserSession(final Long userId, Long channelId, String sessionId,
                       MediaPipeline pipeline, SimpMessagingTemplate messagingTemplate) {

        this.pipeline = pipeline;
        this.userId = userId;
        this.sessionId = sessionId;
        this.channelId = channelId;
        this.outgoingMedia = new WebRtcEndpoint.Builder(pipeline).build();
        this.messagingTemplate = messagingTemplate;

        this.outgoingMedia.addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {

            @Override
            public void onEvent(IceCandidateFoundEvent event) {
                JsonObject response = new JsonObject();
                response.addProperty("id", "iceCandidate");
                response.addProperty("userId", userId);
                response.add("candidate", JsonUtils.toJsonObject(event.getCandidate()));

                sendMessage(response);
            }
        });
    }

    public void receiveVideoFrom(UserSession sender, String sdpOffer) {
        log.info("USER {}: connecting with {} in room {}", this.userId, sender.getUserId(), this.channelId);

        log.trace("USER {}: SdpOffer for {} is {}", this.userId, sender.getUserId(), sdpOffer);

        final String ipSdpAnswer = this.getEndpointForUser(sender).processOffer(sdpOffer);
        final JsonObject scParams = new JsonObject();
        scParams.addProperty("id", "receiveVideoAnswer");
        scParams.addProperty("senderId", sender.getUserId());
        scParams.addProperty("sdpAnswer", ipSdpAnswer);

        log.trace("USER {}: SdpAnswer for {} is {}", this.userId, sender.getUserId(), ipSdpAnswer);
        this.sendPrivateMessage(userId, scParams);
        log.debug("gather candidates");
        this.getEndpointForUser(sender).gatherCandidates();
    }

    private WebRtcEndpoint getEndpointForUser(final UserSession sender) {
        if (sender.getUserId().equals(userId)) {
            log.debug("PARTICIPANT {}: configuring loopback", this.userId);
            return outgoingMedia;
        }

        log.debug("PARTICIPANT {}: receiving video from {}", this.userId, sender.getUserId());

        WebRtcEndpoint incoming = incomingMedia.get(sender.getUserId());
        if (incoming == null) {
            log.debug("PARTICIPANT {}: creating new endpoint for {}", this.userId, sender.getUserId());
            incoming = new WebRtcEndpoint.Builder(pipeline).build();

            incoming.addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {

                @Override
                public void onEvent(IceCandidateFoundEvent event) {
                    JsonObject response = new JsonObject();
                    response.addProperty("id", "iceCandidate");
                    response.addProperty("senderId", sender.getUserId());
                    response.add("candidate", JsonUtils.toJsonObject(event.getCandidate()));
                    sendMessage(response);
                }
            });

            incomingMedia.put(sender.getUserId(), incoming);
        }

        log.debug("PARTICIPANT {}: obtained endpoint for {}", this.userId, sender.getUserId());
        sender.getOutgoingMedia().connect(incoming);

        return incoming;
    }

    public void cancelVideoFrom(final UserSession sender) {
        this.cancelVideoFrom(sender.getUserId());
    }

    public void cancelVideoFrom(final Long senderId) {
        log.debug("PARTICIPANT {}: canceling video reception from {}", this.userId, senderId);
        final WebRtcEndpoint incoming = incomingMedia.remove(senderId);

        log.debug("PARTICIPANT {}: removing endpoint for {}", this.userId, senderId);
        incoming.release(new Continuation<Void>() {
            @Override
            public void onSuccess(Void result) throws Exception {
                log.trace("PARTICIPANT {}: Released successfully incoming EP for {}",
                        UserSession.this.userId, senderId);
            }

            @Override
            public void onError(Throwable cause) throws Exception {
                log.warn("PARTICIPANT {}: Could not release incoming EP for {}", UserSession.this.userId,
                        senderId);
            }
        });
    }

    @Override
    public void close() {
        log.debug("PARTICIPANT {}: Releasing resources", this.userId);
        for (final Long remoteParticipantName : incomingMedia.keySet()) {

            log.trace("PARTICIPANT {}: Released incoming EP for {}", this.userId, remoteParticipantName);

            final WebRtcEndpoint ep = this.incomingMedia.get(remoteParticipantName);

            ep.release(new Continuation<Void>() {

                @Override
                public void onSuccess(Void result) throws Exception {
                    log.trace("PARTICIPANT {}: Released successfully incoming EP for {}",
                            UserSession.this.userId, remoteParticipantName);
                }

                @Override
                public void onError(Throwable cause) throws Exception {
                    log.warn("PARTICIPANT {}: Could not release incoming EP for {}", UserSession.this.userId,
                            remoteParticipantName);
                }
            });
        }

        outgoingMedia.release(new Continuation<Void>() {

            @Override
            public void onSuccess(Void result) throws Exception {
                log.trace("PARTICIPANT {}: Released outgoing EP", UserSession.this.userId);
            }

            @Override
            public void onError(Throwable cause) throws Exception {
                log.warn("USER {}: Could not release outgoing EP", UserSession.this.userId);
            }
        });
    }

    public void sendMessage(JsonObject message) {
        String destination = "/topic/huddle/" + channelId;
        messagingTemplate.convertAndSend(destination, message.toString());
        log.info("📡 Sent STOMP message to {}: {}", destination, message);
    }

    // 개별 사용자에게 응답 전송 (경로에 userId를 붙임)
    public void sendPrivateMessage(Long userId, JsonObject message) {
        String destination = "/queue/private/" + userId;
        messagingTemplate.convertAndSend(destination, message.toString());
        log.info("📡 Sent private STOMP message to {}: {}", destination, message);
    }


    public void sendParticipantMessage(Long userId, JsonArray participantsArray) {
        String destination = "/topic/huddle/" + channelId;

        final JsonObject existingParticipantsMsg = new JsonObject();
        existingParticipantsMsg.addProperty("id", "existingParticipants");
        existingParticipantsMsg.add("data", participantsArray);

        log.debug("PARTICIPANT {}: sending a list of {} participants", userId, participantsArray.size());

        messagingTemplate.convertAndSend(destination, existingParticipantsMsg.toString());
    }


    public void addCandidate(IceCandidate candidate, Long userId) {
        if (this.userId.compareTo(userId) == 0) {
            outgoingMedia.addIceCandidate(candidate);
        } else {
            WebRtcEndpoint webRtc = incomingMedia.get(userId);
            if (webRtc != null) {
                webRtc.addIceCandidate(candidate);
            }
        }
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {

        if (this == obj) {
            return true;
        }
        if (obj == null || !(obj instanceof UserSession)) {
            return false;
        }
        UserSession other = (UserSession) obj;
        boolean eq = userId.equals(other.userId);
        eq &= channelId.equals(other.channelId);
        return eq;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        int result = 1;
        result = 31 * result + userId.hashCode();
        result = 31 * result + channelId.hashCode();
        return result;
    }
}
