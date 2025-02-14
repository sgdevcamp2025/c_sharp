package com.jootalkpia.chat_server.controller;

import com.jootalkpia.chat_server.dto.messgaeDto.ChatMessageRequest;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import com.jootalkpia.chat_server.dto.messgaeDto.CommonResponse;
import com.jootalkpia.chat_server.service.ChatService;
import com.jootalkpia.chat_server.service.KafkaProducer;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.{channelId}")
    public void sendMessage(ChatMessageRequest request, @DestinationVariable Long channelId) {
        chatService.processChatMessage(request, channelId);
    }
}
