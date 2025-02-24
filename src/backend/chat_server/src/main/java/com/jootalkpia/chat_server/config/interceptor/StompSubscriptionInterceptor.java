package com.jootalkpia.chat_server.config.interceptor;

import com.jootalkpia.chat_server.domain.ChatMessage;
import com.jootalkpia.chat_server.dto.RedisKeys;
import com.jootalkpia.chat_server.repository.UserChannelRepository;
import com.jootalkpia.chat_server.repository.mongo.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompSubscriptionInterceptor implements ChannelInterceptor {
    private static final String CHANNEL_ID_DELIMITER = "\\.";
    private static final long SESSION_EXPIRY_HOURS = 4;
    private static final String DEFAULT_CHANNEL = "none";
    private static final Long DEFAULT_ID = 1L;
    private static final String SUBSCRIBE_CHAT_PREFIX = "/subscribe/chat.";

    private final RedisTemplate<String, String> stringOperRedisTemplate;
    private final RedisTemplate<String, Object> objectOperRedisTemplate;

    private final ChatMessageRepository chatMessageRepository;
    private final UserChannelRepository userChannelRepository;

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        if (!isValidMessage(sent, ex)) {
            // todo: 예외 처리 로직 추가, Valid Method 분리
            return;
        }

        handleStompCommand(StompHeaderAccessor.wrap(message));
    }

    public void handleChatUnsubscription(StompHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        String userId = getUserIdFromSessionId(sessionId);
        String channelId = getChannelIdFromSessionId(sessionId);

        if (userId != null && !userId.trim().isEmpty() && !channelId.equals(DEFAULT_CHANNEL)) {
            updateChannelFromSession(sessionId);
            removeTabFromChannel(channelId, userId, sessionId);
            userChannelRepository.updateLastReadId(
                    userId,
                    channelId,
                    chatMessageRepository.findFirstByChannelIdOrderByThreadIdDesc(Long.valueOf(channelId))
                            .map(ChatMessage::getThreadId)
                            .orElse(DEFAULT_ID));
        }
    }

    private boolean isValidMessage(boolean sent, Exception ex) {
        return !hasException(ex) && sent;
    }

    private boolean hasException(Exception ex) {
        return ex != null;
    }

    private void handleStompCommand(StompHeaderAccessor accessor) {
        handleSubscription(accessor);
        handleUnsubscription(accessor);
    }

    private void handleSubscription(StompHeaderAccessor accessor) {
        if (!StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            return;
        }

        if (accessor.getDestination().startsWith(SUBSCRIBE_CHAT_PREFIX)) {
            handleChatSubscription(accessor);
        }
    }

    private void handleUnsubscription(StompHeaderAccessor accessor) {
        if (!StompCommand.UNSUBSCRIBE.equals(accessor.getCommand())) {
            return;
        }

        handleChatUnsubscription(accessor);
    }

    private void handleChatSubscription(StompHeaderAccessor accessor) {
        String channelId = extractChannelId(accessor.getDestination());
        String sessionId = accessor.getSessionId();
        String userId = getUserIdFromSessionId(sessionId);

        if (userId != null && !userId.trim().isEmpty()) {
            updateSessionChannel(channelId, sessionId);
            updateChannelActiveUsers(channelId, userId, sessionId);
        }
    }

    private String extractChannelId(String destination) {
        return destination.split(CHANNEL_ID_DELIMITER)[1];
    }

    private void updateSessionChannel(String channelId, String sessionId) {
        stringOperRedisTemplate.opsForValue().set(
                RedisKeys.sessionChannel(sessionId),
                channelId,
                SESSION_EXPIRY_HOURS,
                TimeUnit.HOURS
        );
    }

    private void updateChannelActiveUsers(String channelId, String userId, String sessionId) {
        Set<String> userTabs = getUserTabs(channelId, userId);
        addTabToUser(userTabs, sessionId);
        saveUserTabs(channelId, userId, userTabs);
    }

    @SuppressWarnings("unchecked")
    private Set<String> getUserTabs(String channelId, String userId) {
        Object storedValue = objectOperRedisTemplate.opsForHash()
                .get(RedisKeys.channelActive(channelId), userId);

        return convertToSet(storedValue);
    }

    @SuppressWarnings("unchecked")
    private Set<String> convertToSet(Object storedValue) {
        if (storedValue instanceof Set) {
            return (Set<String>) storedValue;
        } else if (storedValue instanceof List) {
            return new HashSet<>((List<String>) storedValue);
        } else {
            return new HashSet<>();
        }
    }

    private void addTabToUser(Set<String> userTabs, String sessionId) {
        userTabs.add(sessionId);
    }

    private void saveUserTabs(String channelId, String userId, Set<String> userTabs) {
        objectOperRedisTemplate.opsForHash().put(
                RedisKeys.channelActive(channelId),
                userId,
                userTabs
        );
    }

    private String getUserIdFromSessionId(String sessionId) {
        return stringOperRedisTemplate.opsForValue().get(RedisKeys.sessionUser(sessionId));
    }

    private String getChannelIdFromSessionId(String sessionId) {
        return stringOperRedisTemplate.opsForValue().get(RedisKeys.sessionChannel(sessionId));
    }

    private void updateChannelFromSession(String sessionId) {
        stringOperRedisTemplate.opsForValue().set(
                RedisKeys.sessionChannel(sessionId),
                DEFAULT_CHANNEL,
                SESSION_EXPIRY_HOURS,
                TimeUnit.HOURS
        );
    }

    private void removeTabFromChannel(String channelId, String userId, String tabId) {
        Set<String> userTabs = getUserTabs(channelId, userId);
        removeTab(userTabs, tabId);
        updateChannelUsers(channelId, userId, userTabs);
    }

    private void removeTab(Set<String> userTabs, String tabId) {
        userTabs.remove(tabId);
    }

    private void updateChannelUsers(String channelId, String userId, Set<String> userTabs) {
        if (userTabs.isEmpty()) {
            removeUserFromChannel(channelId, userId);
            return;
        }

        saveUserTabs(channelId, userId, userTabs);
    }

    private void removeUserFromChannel(String channelId, String userId) {
        objectOperRedisTemplate.opsForHash().delete(RedisKeys.channelActive(channelId), userId);
    }
}
