package com.jootalkpia.chat_server.service;

import com.jootalkpia.chat_server.domain.Files;
import com.jootalkpia.chat_server.domain.Thread;
import com.jootalkpia.chat_server.domain.User;
import com.jootalkpia.chat_server.dto.messgaeDto.CommonResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.ImageResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.MessageResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.TextResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.VideoResponse;
import com.jootalkpia.chat_server.repository.FileRepository;
import com.jootalkpia.chat_server.repository.ThreadRepository;
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
    private final ThreadRepository threadRepository;

    public CommonResponse createCommonData(Long userId, Long channelId){
        User user = userRepository.findByUserId(userId);
        Thread thread = new Thread();   // todo:transaction처리 , 예외처리 필요
        threadRepository.save(thread);

        return new CommonResponse(
                channelId,
                user.getUserId(),
                thread.getThreadId(),
                user.getNickname(),
                user.getProfileImage());
    }

    public List<MessageResponse> createMessageData(String content,  List<Long> attachmentList) {
        List<MessageResponse> response = new ArrayList<>();

        if (content != null && !content.isEmpty()) {
            response.add(new TextResponse(content));
        }

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
