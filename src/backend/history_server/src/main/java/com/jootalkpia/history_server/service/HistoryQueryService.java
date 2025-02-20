package com.jootalkpia.history_server.service;

import com.jootalkpia.history_server.domain.ChatMessage;
import com.jootalkpia.history_server.dto.ThreadDto;
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
        List<ChatMessage> chatMessageList = fetchMessagesForward(channelId, cursorId, size, userId);

        if (chatMessageList.isEmpty()) {
            return new ChatMessagePageResponse(false, null, Collections.emptyList());
        }

        List<ThreadDto> responseMessages = convertToDtoList(chatMessageList);
        boolean hasNext = determineHasNext(responseMessages, size);

        // size + 1로 조회했으므로, 초과한 1개 데이터 제거
        if (hasNext) {
            responseMessages = responseMessages.subList(0, size);
        }

        Long lastThreadId = getLastThreadId(responseMessages);

        return new ChatMessagePageResponse(hasNext, lastThreadId, responseMessages);
    }

    public ChatMessagePageResponse getChatMessagesBackward(Long channelId, Long cursorId, int size, Long userId) {
        List<ChatMessage> chatMessageList = fetchMessagesBackward(channelId, cursorId, size, userId);

        if (chatMessageList.isEmpty()) {
            return new ChatMessagePageResponse(false, null, Collections.emptyList());
        }

        List<ThreadDto> responseMessages = convertToDtoList(chatMessageList);
        boolean hasNext = determineHasNext(responseMessages, size);

        // size + 1로 조회했으므로, 초과한 1개 데이터 제거
        if (hasNext) {
            responseMessages = responseMessages.subList(0, size);
        }

        Long lastThreadId = getLastThreadId(responseMessages);

        return new ChatMessagePageResponse(hasNext, lastThreadId, responseMessages);
    }


    /**
     * DB에서 채팅 메시지를 정방향으로 조회하는 메서드
     */
    private List<ChatMessage> fetchMessagesForward(Long channelId, Long cursorId, int size, Long userId) {
        if (cursorId == null) {
            Long lastReadId = userChannelRepository.findLastReadIdByUserIdAndChannelId(userId, channelId);

            if (lastReadId == null) {
                return Collections.emptyList();  // 첫 입장 시 빈 응답
            }

            return chatMessageRepository.findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(
                    channelId, lastReadId, PageRequest.of(0, size + 1));
        }

        return chatMessageRepository.findByChannelIdAndThreadIdGreaterThanOrderByThreadIdAsc(
                channelId, cursorId, PageRequest.of(0, size + 1));
    }

    /**
     * DB에서 채팅 메시지를 역방향으로 조회하는 메서드
     */
    private List<ChatMessage> fetchMessagesBackward(Long channelId, Long cursorId, int size, Long userId) {
        Long lastReadId = cursorId;



        // lastReadId 이하의 메시지를 최신순 (DESC)으로 조회
        return chatMessageRepository.findByChannelIdAndThreadIdLessThanEqualOrderByThreadIdDesc(
                channelId, lastReadId, PageRequest.of(0, size + 1));
    }

    /**
     * ChatMessage 리스트를 ChatMessageDto 리스트로 변환하는 메서드
     */
    private List<ThreadDto> convertToDtoList(List<ChatMessage> chatMessageList) {
        return chatMessageList.stream()
                .map(ThreadDto::from)
                .toList();
    }

    /**
     * hasNext(다음 페이지 여부)를 판별하는 메서드
     */
    private boolean determineHasNext(List<ThreadDto> responseMessages, int size) {
        return responseMessages.size() > size;
    }

    /**
     * 마지막 threadId를 반환하는 메서드
     */
    private Long getLastThreadId(List<ThreadDto> responseMessages) {
        if (responseMessages.isEmpty()) {
            return null;
        }
        return responseMessages.get(responseMessages.size() - 1).threadId();
    }
}
