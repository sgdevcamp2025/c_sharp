package com.jootalkpia.history_server.service;


import com.jootalkpia.history_server.domain.ChatMessage;
import com.jootalkpia.history_server.dto.ChatMessagePageResponse;
import com.jootalkpia.history_server.repository.ChatMessageRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HistoryQueryService {

    private static final int DEFAULT_PAGE_SIZE = 30;
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessagePageResponse getChatMessagesForward(Long channelId, Long cursorThreadId, int size, Long userId) {
        if (size <= 0) {
            size = DEFAULT_PAGE_SIZE;
        }

        List<ChatMessage> chatMessages;
        boolean hasNext;
        Long lastThreadId = null;

        if (cursorThreadId == null) {
            // 첫 요청: thread_id 기준 정렬하여 가져오기
            chatMessages = chatMessageRepository.findByChannelIdOrderByThreadIdAsc(channelId, PageRequest.of(0, size + 1));
        } else {
            // thread_id 이후의 메시지 조회
            chatMessages = chatMessageRepository.findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(channelId, cursorThreadId, PageRequest.of(0, size + 1));
        }

        hasNext = chatMessages.size() > size;
        if (hasNext) {
            chatMessages = chatMessages.subList(0, size);
        }

        if (!chatMessages.isEmpty()) {
            lastThreadId = chatMessages.get(chatMessages.size() - 1).getThreadId();
        }

        return new ChatMessagePageResponse(hasNext, lastThreadId, chatMessages);
    }
}
