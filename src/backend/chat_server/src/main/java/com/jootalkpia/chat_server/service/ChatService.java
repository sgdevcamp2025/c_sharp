package com.jootalkpia.chat_server.service;

import com.jootalkpia.chat_server.domain.Files;
import com.jootalkpia.chat_server.domain.User;
import com.jootalkpia.chat_server.dto.ChatMessageToKafka;
import com.jootalkpia.chat_server.dto.messgaeDto.ChatMessageRequest;
import com.jootalkpia.chat_server.dto.messgaeDto.CommonResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.ImageResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.MessageResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.TextResponse;
import com.jootalkpia.chat_server.dto.messgaeDto.VideoResponse;
import com.jootalkpia.chat_server.repository.jpa.FileRepository;
import com.jootalkpia.chat_server.repository.jpa.UserRepository;
import com.jootalkpia.chat_server.util.DateTimeUtil;
import com.jootalkpia.chat_server.util.SnowflakeIdGenerator;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final KafkaProducer kafkaProducer;

    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final SnowflakeIdGenerator snowflakeIdGenerator;

    public void processChatMessage(ChatMessageRequest request, Long channelId) {
        CommonResponse commonData = createCommonData(request.userId(), channelId);
        List<MessageResponse> messageData = createMessageData(request.content(), request.attachmentList());

        ChatMessageToKafka chatMessageToKafka = new ChatMessageToKafka(commonData, messageData);
        kafkaProducer.sendChatMessage(chatMessageToKafka, channelId); // Kafka 전송 (트랜잭션 영향 X)
    }

    private CommonResponse createCommonData(Long userId, Long channelId){
//        User user = userRepository.findByUserId(userId);

        Long threadId = snowflakeIdGenerator.nextId();

        LocalDateTime now = Instant.ofEpochMilli(System.currentTimeMillis())
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        return CommonResponse.builder()
                .channelId(channelId)
                .threadId(threadId)
                .threadDateTime(DateTimeUtil.formatDateTime(now))
//                .userId(user.getUserId())
//                .userNickname(user.getNickname())
//                .userProfileImage(user.getProfileImage())
                .build();
    }

    private List<MessageResponse> createMessageData(String content, List<Long> attachmentList) {
        List<MessageResponse> response = new ArrayList<>();
        if (content != null && !content.isEmpty()) {
            response.add(createTextMessage(content));
        }
        response.addAll(createAttachmentList(attachmentList));
        return response;
    }

    private TextResponse createTextMessage(String content) {
        return TextResponse.builder()
                .text(content)
                .build();
    }

    private List<MessageResponse> createAttachmentList(List<Long> attachmentList) {
        List<MessageResponse> list = new ArrayList<>();
        if (attachmentList != null && !attachmentList.isEmpty()) {
            for (Long fileId : attachmentList) {
                Files file = fileRepository.findById(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("File not found for fileId: " + fileId));   // todo:예외처리 추가
                list.add(createAttachmentData(file));
            }
        }
        return list;
    }

    private MessageResponse createAttachmentData(Files file) {
        return switch (file.getFileType()) {
            case "IMAGE" -> ImageResponse.builder()
                                        .imageId(file.getFileId())
                                        .imageUrl(file.getUrl())
                                        .build();
            case "VIDEO" -> VideoResponse.builder()
                                        .videoId(file.getFileId())
                                        .videoUrl(file.getUrl())
                                        .thumbnailUrl(file.getUrlThumbnail())
                                        .build();
            default -> throw new IllegalArgumentException("Unsupported file type: " + file.getFileId()); // todo:예외처리 추가
        };
    }
}
