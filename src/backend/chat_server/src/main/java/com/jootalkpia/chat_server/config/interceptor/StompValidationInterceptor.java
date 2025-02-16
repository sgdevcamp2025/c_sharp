package com.jootalkpia.chat_server.config.interceptor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompValidationInterceptor implements ChannelInterceptor {
    private static final String HEADER_USER_ID = "X-User-ID";
    private static final String SUBSCRIBE_CHAT_PREFIX = "/subscribe/chat.";

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.DISCONNECT.equals(accessor.getCommand()) ||
                StompCommand.UNSUBSCRIBE.equals(accessor.getCommand()) ||
                (StompCommand.CONNECT.equals(accessor.getCommand()) && hasValidHeaders(accessor)) ||
                (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) && isValidChatDestination(accessor.getDestination())) ||
                StompCommand.SEND.equals((accessor.getCommand())) ||
                StompCommand.MESSAGE.equals(accessor.getCommand())) {
            return message;
        }

        log.info("wrong data from client"); // todo: 예외 처리 로직 추가, Valid Method 분리
        return null;
    }

    private boolean hasValidHeaders(StompHeaderAccessor accessor) {
        String userId = accessor.getFirstNativeHeader(HEADER_USER_ID);
        return userId != null && !userId.trim().isEmpty();
    }

    private boolean isValidChatDestination(String destination) {
        return destination != null && destination.startsWith(SUBSCRIBE_CHAT_PREFIX);
    }
}
