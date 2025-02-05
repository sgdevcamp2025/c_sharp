package com.jootalkpia.chat_server.controller;

import com.jootalkpia.chat_server.dto.ChatMessageRequest;
import com.jootalkpia.chat_server.dto.ChatMessageResponse;
import com.jootalkpia.chat_server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.{channelId}")
    @SendTo("/subscribe/chat.{channelId}")
    public ChatMessageResponse sendMessage(ChatMessageRequest request, @DestinationVariable Long channelId) {
        return chatService.createMessage(request.userId(), request.content());
    }

}
