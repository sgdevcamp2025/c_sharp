package com.jootalkpia.chat_server.dto;

public class RedisKeys {
    private static final String SESSION_PREFIX = "sessions";
    private static final String USER_PREFIX = "user";
    private static final String CHANNEL_PREFIX = "channel";
    private static final String SUBSCRIBERS_PREFIX = "subscribers:";
    private static final String ACTIVE_PREFIX = "active";

    public static String sessionChannel(String sessionId) {
        return SESSION_PREFIX + ":" + sessionId + ":" + CHANNEL_PREFIX;
    }

    public static String sessionUser(String sessionId) {
        return SESSION_PREFIX + ":" + sessionId + ":" + USER_PREFIX;
    }

    public static String userSessions(String userId) {
        return USER_PREFIX + ":" + userId + ":" + SESSION_PREFIX;
    }

    public static String channelActive(String channelId) {
        return CHANNEL_PREFIX + ":" + channelId + ":" + ACTIVE_PREFIX;
    }

    public static String channelSubscribers(String channelId) {
        return CHANNEL_PREFIX + channelId + SUBSCRIBERS_PREFIX;
    }
}
