// package com.jootalkpia.signaling_server.config;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.kurento.client.KurentoClient;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.socket.config.annotation.EnableWebSocket;
// import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
// import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
// import com.jootalkpia.signaling_server.rtc.KurentoHandler;

// @Configuration
// @EnableWebSocket
// @RequiredArgsConstructor
// @Slf4j
// public class WebRtcConfig implements WebSocketConfigurer {

//     private final KurentoHandler kurentoHandler;

//     @Override
//     public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//         registry.addHandler(kurentoHandler, "/signal").setAllowedOrigins("*");
//     }
// }
