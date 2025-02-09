package com.jootalkpia.chat_server.controller;

import com.jootalkpia.chat_server.dto.ChatMessageRequest;
import com.jootalkpia.chat_server.dto.ChatMessageResponse;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import com.jootalkpia.chat_server.service.ChatService;
import com.jootalkpia.chat_server.service.KafkaProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final KafkaProducer kafkaProducer;
    private final ChatService chatService;

    @MessageMapping("/chat.{channelId}")
    public void sendMessage(ChatMessageRequest request, @DestinationVariable Long channelId) {
        ChatMessageResponse chatMessage = chatService.createMessage(request.userId(), request.content());
        ChatMessageToKafka chatMessageToKafka = new ChatMessageToKafka(channelId, request.userId(), chatMessage.username(), chatMessage.content());
        kafkaProducer.sendChatMessage(chatMessageToKafka, channelId);
    }
}
