package com.jootalkpia.chat_server.config;

import com.jootalkpia.chat_server.config.interceptor.StompConnectInterceptor;
import com.jootalkpia.chat_server.config.interceptor.StompSubscriptionInterceptor;
import com.jootalkpia.chat_server.config.interceptor.StompValidationInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompConnectInterceptor stompConnectInterceptor;
    private final StompSubscriptionInterceptor stompSubscriptionInterceptor;
    private final StompValidationInterceptor stompValidationInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.setApplicationDestinationPrefixes("/publish"); // STOMP 메시지 발행 prefix
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-connect") // STOMP WebSocket 엔드포인트
                .setAllowedOriginPatterns("*") // CORS 허용
                .withSockJS(); // SockJS 활성화
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompValidationInterceptor);
        registration.interceptors(stompConnectInterceptor);
        registration.interceptors(stompSubscriptionInterceptor);
    }
}
