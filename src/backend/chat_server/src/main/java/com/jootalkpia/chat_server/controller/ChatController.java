package com.jootalkpia.chat_server.controller;

import com.jootalkpia.chat_server.dto.messgaeDto.ChatMessageRequest;
import com.jootalkpia.chat_server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.{channelId}")
    public void sendMessage(ChatMessageRequest request, @DestinationVariable Long channelId) {
        chatService.processChatMessage(request, channelId);
    }

    @PostMapping("/chat/{channelId}")
    public void sendMessageApi(@RequestBody ChatMessageRequest request, @PathVariable Long channelId) {
        chatService.processChatMessage(request, channelId);
    }
}
