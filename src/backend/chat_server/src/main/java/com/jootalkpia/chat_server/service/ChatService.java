package com.jootalkpia.chat_server.service;

import com.jootalkpia.chat_server.domain.User;
import com.jootalkpia.chat_server.dto.ChatMessageResponse;
import com.jootalkpia.chat_server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final UserRepository userRepository;

    public ChatMessageResponse createMessage(Long userId, String content){
        User user = userRepository.findByUserId(userId);
        return new ChatMessageResponse(user.getNickname(),content);
    }
}
