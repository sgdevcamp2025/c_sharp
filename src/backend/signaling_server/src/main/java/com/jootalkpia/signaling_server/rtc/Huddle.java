package com.jootalkpia.signaling_server.rtc;

import java.io.Closeable;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.annotation.PreDestroy;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.kurento.client.Continuation;
import org.kurento.client.MediaPipeline;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.WebSocketSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

@Slf4j
public class Huddle implements Closeable {

    @Getter
    private final Long channelId;
    private final ConcurrentMap<Long, UserSession> participants = new ConcurrentHashMap<>();
    private final MediaPipeline pipeline;
    private final SimpMessagingTemplate messagingTemplate;

    public Huddle(Long channelId, MediaPipeline pipeline, SimpMessagingTemplate messagingTemplate) {
        this.channelId = channelId;
        this.pipeline = pipeline;
        this.messagingTemplate = messagingTemplate;
        log.info("ROOM {} has been created", channelId);
    }

    @PreDestroy
    private void shutdown() {
        this.close();
    }

    public UserSession join(Long userId, String sessionId) {
        log.info("ROOM {}: adding participant {}", this.channelId, userId);
        final UserSession participant = new UserSession(userId, this.channelId, sessionId, this.pipeline, this.messagingTemplate);
        joinRoom(participant);
        participants.put(participant.getUserId(), participant);
        sendParticipantNames(participant);
        return participant;
    }

    public void leave(UserSession user) {
        log.debug("PARTICIPANT {}: Leaving room {}", user.getUserId(), this.channelId);
        this.removeParticipant(user.getUserId());
        user.close();
    }

    private Collection<Long> joinRoom(UserSession newParticipant) {
        final JsonObject newParticipantMsg = new JsonObject();
        newParticipantMsg.addProperty("id", "newParticipantArrived");
        newParticipantMsg.addProperty("name", newParticipant.getUserId());

        final List<Long> participantsList = new ArrayList<>(participants.values().size());
        log.debug("ROOM {}: notifying other participants of new participant {}", channelId,
                newParticipant.getUserId());

        for (final UserSession participant : participants.values()) {

            participant.sendMessage(newParticipantMsg);

            participantsList.add(participant.getUserId());
        }

        return participantsList;
    }

    private void removeParticipant(Long userId) {
        participants.remove(userId);

        log.debug("ROOM {}: notifying all users that {} is leaving the room", this.channelId, userId);

        final List<Long> unnotifiedParticipants = new ArrayList<>();
        final JsonObject participantLeftJson = new JsonObject();
        participantLeftJson.addProperty("id", "participantLeft");
        participantLeftJson.addProperty("name", userId);
        for (final UserSession participant : participants.values()) {
            try {
                participant.cancelVideoFrom(userId);
                participant.sendMessage(participantLeftJson);
            } catch (final IOException e) {
                unnotifiedParticipants.add(participant.getUserId());
            }
        }

        if (!unnotifiedParticipants.isEmpty()) {
            log.debug("ROOM {}: The users {} could not be notified that {} left the room", this.channelId,
                    unnotifiedParticipants, userId);
        }

    }

    public void sendParticipantNames(UserSession user) {

        final JsonArray participantsArray = new JsonArray();
        for (final UserSession participant : this.getParticipants()) {
            if (!participant.equals(user)) {
                final JsonElement participantName = new JsonPrimitive(participant.getUserId());
                participantsArray.add(participantName);
            }
        }

        final JsonObject existingParticipantsMsg = new JsonObject();
        existingParticipantsMsg.addProperty("id", "existingParticipants");
        existingParticipantsMsg.add("data", participantsArray);
        log.debug("PARTICIPANT {}: sending a list of {} participants", user.getUserId(),
                participantsArray.size());
        user.sendMessage(existingParticipantsMsg);
    }

    public Collection<UserSession> getParticipants() {
        return participants.values();
    }

    public UserSession getParticipant(String name) {
        return participants.get(name);
    }

    @Override
    public void close() {
        for (final UserSession user : participants.values()) {
            user.close();
        }

        participants.clear();

        pipeline.release(new Continuation<Void>() {

            @Override
            public void onSuccess(Void result) throws Exception {
                log.trace("ROOM {}: Released Pipeline", Huddle.this.channelId);
            }

            @Override
            public void onError(Throwable cause) throws Exception {
                log.warn("PARTICIPANT {}: Could not release Pipeline", Huddle.this.channelId);
            }
        });

        log.debug("Room {} closed", this.channelId);
    }

}