package com.jootalkpia.signaling_server.rtc;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component("customUserRegistry")
public class UserRegistry {

    private final ConcurrentHashMap<Long, UserSession> usersById = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, UserSession> usersBySessionId = new ConcurrentHashMap<>();


    public void register(UserSession user) {
//        UserSession user = getBySessionId(sessionId);
        usersById.put(user.getUserId(), user);
        usersBySessionId.put(user.getSessionId(), user);
    }

    public UserSession getByUserId(Long userId) {
        return usersById.get(userId);
    }

    public UserSession getBySessionId(String sessionId) {
        return usersBySessionId.get(sessionId);
    }

    public boolean exists(String name) {
        return usersById.keySet().contains(name);
    }

    public UserSession removeBySession(String sessionId) {
        final UserSession user = getBySessionId(sessionId);
        usersById.remove(user.getUserId());
        usersBySessionId.remove(sessionId);
        return user;
    }

}