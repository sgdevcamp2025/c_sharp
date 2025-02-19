package com.jootalkpia.chat_server.config;

import com.jootalkpia.chat_server.config.interceptor.StompConnectInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class SessionEventListener {
    private final StompConnectInterceptor stompConnectInterceptor;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        stompConnectInterceptor.handleDisconnection(headerAccessor);
    }
}
