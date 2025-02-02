//package com.jootalkpia.signaling_server.controller;
//
//import com.jootalkpia.signaling_server.dto.WebRtcSignalDto;
//import com.jootalkpia.signaling_server.service.UserSessionService;
//import com.jootalkpia.signaling_server.service.KurentoManager;
//import org.kurento.client.MediaPipeline;
//import org.kurento.client.WebRtcEndpoint;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/webrtc")
//public class WebRtcController {
//
//    private final UserSessionService userSessionService;
//    private final KurentoManager kurentoManager;
//    private final Map<String, MediaPipeline> pipelines = new HashMap<>();
//
//    public WebRtcController(UserSessionService userSessionService, KurentoManager kurentoManager) {
//        this.userSessionService = userSessionService;
//        this.kurentoManager = kurentoManager;
//    }
//
//    @PostMapping("/offer")
//    public WebRtcSignalDto handleOffer(@RequestBody WebRtcSignalDto signalDto) {
//        String userId = signalDto.getId();
//        MediaPipeline pipeline = pipelines.computeIfAbsent(userId, k -> kurentoManager.createPipeline());
//        WebRtcEndpoint webRtcEndpoint = new WebRtcEndpoint.Builder(pipeline).build();
//
//        String sdpAnswer = webRtcEndpoint.processOffer(signalDto.getSdpOffer());
//        webRtcEndpoint.gatherCandidates();
//
//        return new WebRtcSignalDto(userId, signalDto.getSdpOffer(), sdpAnswer, null);
//    }
//
//    @PostMapping("/ice")
//    public void handleIceCandidate(@RequestBody WebRtcSignalDto signalDto) {
//        String userId = signalDto.getId();
//        userSessionService.getSession(userId).getWebRtcEndpoint().addIceCandidate(
//                new org.kurento.client.IceCandidate(signalDto.getCandidate(), "", 0)
//        );
//    }
//}
