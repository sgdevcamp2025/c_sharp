//// 허들(화상채팅방) 컨트롤러
//package com.jootalkpia.signaling_server.controller;
//
//import com.jootalkpia.signaling_server.dto.HuddleDto;
//import com.jootalkpia.signaling_server.service.HuddleService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/huddle")
//@RequiredArgsConstructor
//public class HuddleController {
//
//    private final HuddleService huddleService;
//
//    @PostMapping("/create")
//    public HuddleDto createHuddle(@RequestParam String channelId, @RequestParam String userId) {
//        return huddleService.createHuddle(channelId, userId);
//    }
//
//    @PostMapping("/join/{huddleId}")
//    public HuddleDto joinHuddle(@PathVariable String huddleId, @RequestParam String userId) {
//        return huddleService.joinHuddle(huddleId, userId);
//    }
//
//    @GetMapping("/status/{channelId}")
//    public HuddleDto getHuddleByChannel(@PathVariable String channelId) {
//        return huddleService.getHuddleByChannel(channelId);
//    }
//}