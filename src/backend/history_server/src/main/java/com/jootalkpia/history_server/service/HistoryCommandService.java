package com.jootalkpia.history_server.service;

import com.jootalkpia.history_server.domain.ChatMessage;
import com.jootalkpia.history_server.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HistoryCommandService {

    private final ChatMessageRepository chatMessageRepository;

    public void saveChatMessage(ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
    }

}
