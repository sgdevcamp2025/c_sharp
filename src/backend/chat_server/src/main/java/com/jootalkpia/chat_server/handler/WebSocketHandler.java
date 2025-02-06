package com.jootalkpia.chat_server.handler;

import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    // 모든 WebSocket 세션을 중앙에서 관리
    private static final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    // 웹 소켓 연결 시 호출
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session); // 세션 추가
    }


    // 메세지 전송 시 호출
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 텍스트 메시지 처리
        String payload = message.getPayload();
        if (payload.startsWith("chat:")) {
            // 채팅 메시지 처리
            String chatMessage = payload.substring(5); // "chat:" 이후의 내용
            broadcastTextMessage(chatMessage);
        }
    }

    // 웹 소켓 종료 시 호출
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    // 모든 클라이언트에 텍스트 메시지 브로드캐스트
    private void broadcastTextMessage(String text) {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(text));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // 외부 소스에서 텍스트 데이터를 전송 >> 외부 소스(예: Kafka Consumer, DB 이벤트 등)에서 텍스트 데이터를 받아 모든 연결된 클라이언트로 전송
    // 즉 WebSocket 핸들러 내부에서 발생하지 않은 데이터 전송
    public void sendTextDataToClients(String textData) {
        broadcastTextMessage(textData);
    }
}
