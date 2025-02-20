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

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessagePageResponse getChatMessagesForward(Long channelId, Long cursorId, int size, Long userId) {

        List<ChatMessage> chatMessageList;
        boolean hasNext;
        Long lastThreadId = null;

        if (cursorId == null) { //첫요청 이면 db의 저장된 thread id가 cursorId
            chatMessageList = chatMessageRepository.findByChannelIdOrderByThreadIdAsc(channelId, PageRequest.of(0, size + 1));
        } else {
            // thread_id 이후의 메시지 조회
            chatMessageList = chatMessageRepository.findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(channelId, cursorId, PageRequest.of(0, size + 1));
        }

        hasNext = chatMessageList.size() > size;
        if (hasNext) {
            chatMessageList = chatMessageList.subList(0, size);
        }

        if (!chatMessageList.isEmpty()) {
            lastThreadId = chatMessageList.get(chatMessageList.size() - 1).getThreadId();
        }

        return new ChatMessagePageResponse(hasNext, lastThreadId, chatMessageList);
    }
}
