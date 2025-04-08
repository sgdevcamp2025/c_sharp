package com.jootalkpia.chat_server.config.interceptor;

import com.jootalkpia.chat_server.dto.RedisKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompConnectInterceptor implements ChannelInterceptor {
    private static final String HEADER_USER_ID = "X-User-ID";
    private static final long SESSION_EXPIRY_HOURS = 4;
    private static final String DEFAULT_CHANNEL = "none";

    private final RedisTemplate<String, String> stringOperRedisTemplate;
    private final RedisTemplate<String, Object> objectOperRedisTemplate;

    private final StompSubscriptionInterceptor stompSubscriptionInterceptor;

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        if (hasException(ex)) {
            // todo: 예외 처리 로직 추가, Valid Method 분리
            return;
        }

        handleStompCommand(StompHeaderAccessor.wrap(message));
    }

    public void handleDisconnection(StompHeaderAccessor accessor) {
        if (!StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            return;
        }

        handleUserDisconnection(accessor);
    }

    private boolean hasException(Exception ex) {
        return ex != null;
    }

    private void handleStompCommand(StompHeaderAccessor accessor) {
        handleConnection(accessor);
        handleDisconnection(accessor);
    }

    private void handleConnection(StompHeaderAccessor accessor) {
        if (!StompCommand.CONNECT.equals(accessor.getCommand())) {
            return;
        }

        handleUserConnection(accessor);
    }

    private void handleUserConnection(StompHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        String userId = accessor.getFirstNativeHeader(HEADER_USER_ID);

        initializeUserSession(userId, sessionId);
        updateUserSessions(userId, sessionId);
        initializeSessionChannel(sessionId);
    }

    private void handleUserDisconnection(StompHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        String userId = getUserIdFromSession(sessionId);

        if (userId != null && !userId.trim().isEmpty()) {
            stompSubscriptionInterceptor.handleChatUnsubscription(accessor);
            cleanupUserSession(userId, sessionId);
        }
    }

    private void initializeUserSession(String userId, String sessionId) {
        stringOperRedisTemplate.opsForValue().set(
                RedisKeys.sessionUser(sessionId),
                userId,
                SESSION_EXPIRY_HOURS,
                TimeUnit.HOURS
        );
    }

    private void updateUserSessions(String userId, String sessionId) {
        objectOperRedisTemplate.opsForSet().add(RedisKeys.userSessions(userId), sessionId);
        objectOperRedisTemplate.expire(
                RedisKeys.userSessions(userId),
                SESSION_EXPIRY_HOURS,
                TimeUnit.HOURS
        );
    }

    private void initializeSessionChannel(String sessionId) {
        stringOperRedisTemplate.opsForValue().set(
                RedisKeys.sessionChannel(sessionId),
                DEFAULT_CHANNEL,
                SESSION_EXPIRY_HOURS,
                TimeUnit.HOURS
        );
    }

    private String getUserIdFromSession(String sessionId) {
        return stringOperRedisTemplate.opsForValue().get(RedisKeys.sessionUser(sessionId));
    }

    private void cleanupUserSession(String userId, String sessionId) {
        objectOperRedisTemplate.opsForSet().remove(RedisKeys.userSessions(userId), sessionId);
        stringOperRedisTemplate.delete(RedisKeys.sessionUser(sessionId));
        stringOperRedisTemplate.delete(RedisKeys.sessionChannel(sessionId));
    }
}
