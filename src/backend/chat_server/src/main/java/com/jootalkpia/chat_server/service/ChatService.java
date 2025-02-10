package com.jootalkpia.chat_server.service;

import com.jootalkpia.chat_server.domain.Files;
import com.jootalkpia.chat_server.domain.User;
import com.jootalkpia.chat_server.dto.messgaeDto.ChatMessageRequest;
import com.jootalkpia.chat_server.dto.messgaeDto.CommonResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.ImageResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.MessageResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.TextResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.VideoResponse;
import com.jootalkpia.chat_server.repository.FileRepository;
import com.jootalkpia.chat_server.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    public List<MessageResponse> createMessage(ChatMessageRequest request) {
        List<MessageResponse> response = new ArrayList<>();

        User user = userRepository.findByUserId(request.userId());
        response.add(new CommonResponse(user.getUserId(), user.getNickname(), user.getProfileImage()));

        String content = request.content();
        if (content != null && !content.isEmpty()) {
            response.add(new TextResponse(content));
        }

        List<Long> attachmentList = request.attachmentList();
        if (attachmentList != null && !attachmentList.isEmpty()) {
            for (Long fileId : attachmentList) {
                Files file = fileRepository.findById(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("File not found for fileId: " + fileId)); // todo : 예외 처리 추가
                switch (file.getFileType()) {
                    case "IMAGE" -> response.add(new ImageResponse(file.getUrl()));
                    case "VIDEO" -> response.add(new VideoResponse(file.getUrlThumbnail(),file.getUrl()));
                    default -> throw new IllegalArgumentException("Unsupported file type: " + file.getFileType()); // todo : 예외 처리 추가
                }
            }
        }

        return response;
    }
}
