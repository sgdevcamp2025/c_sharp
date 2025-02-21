package com.jootalkpia.chat_server.controller;

import com.jootalkpia.chat_server.dto.messgaeDto.ChatMessageRequest;
import com.jootalkpia.chat_server.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.{channelId}")
    public void sendMessage(ChatMessageRequest request, @DestinationVariable Long channelId) {
        chatService.processChatMessage(request, channelId);
    }

    @GetMapping("/api/chat-port")
    public ResponseEntity<String> getWebSocketPort(HttpServletRequest request) {
        int port = request.getServerPort(); // 현재 서버의 포트 가져오기
        return ResponseEntity.ok(String.valueOf(port));
    }

}
