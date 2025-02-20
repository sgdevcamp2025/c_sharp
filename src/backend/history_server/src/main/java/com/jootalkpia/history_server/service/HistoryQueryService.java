package com.jootalkpia.history_server.service;


import com.jootalkpia.history_server.domain.ChatMessage;
import com.jootalkpia.history_server.dto.ChatMessageDto;
import com.jootalkpia.history_server.dto.ChatMessagePageResponse;
import com.jootalkpia.history_server.repository.ChatMessageRepository;
import com.jootalkpia.history_server.repository.UserChannelRepository;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HistoryQueryService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserChannelRepository userChannelRepository;

    public ChatMessagePageResponse getChatMessagesForward(Long channelId, Long cursorId, int size, Long userId) {

        List<ChatMessage> chatMessageList;
        boolean hasNext;
        Long lastThreadId = null;
        if (cursorId == null) {
            // 첫 요청이면 DB에서 마지막 읽은 threadId 조회
            final Long lastReadId = userChannelRepository.findLastReadIdByUserIdAndChannelId(userId, channelId);

            // lastReadId가 null이면(첫 입장일 경우) 빈 응답 반환
            if (lastReadId == null) {
                return new ChatMessagePageResponse(false, null, Collections.emptyList());
            }

            // threadId가 존재하면 메시지 조회
            chatMessageList = chatMessageRepository.findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(channelId, lastReadId, PageRequest.of(0, size + 1));
        }
        else {
            // thread_id 이후의 메시지 조회
            chatMessageList = chatMessageRepository.findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(channelId, cursorId, PageRequest.of(0, size + 1));
        }

        List<ChatMessageDto> responseMessages = chatMessageList.stream()
                .map(ChatMessageDto::from)
                .toList();

        hasNext = responseMessages.size() > size;
        if (hasNext) {
            responseMessages = responseMessages.subList(0, size);
        }

        if (!responseMessages.isEmpty()) {
            lastThreadId = responseMessages.get(responseMessages.size() - 1).threadId();
        }

        return new ChatMessagePageResponse(hasNext, lastThreadId, responseMessages);
    }
}
