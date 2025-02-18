package com.jootalkpia.state_server.entity;

public class RedisKeys {
    private static final String SESSION_PREFIX = "sessions";
    private static final String USER_PREFIX = "user";
    private static final String CHANNEL_PREFIX = "channel";
    private static final String SUBSCRIBERS_PREFIX = "subscribers";
    private static final String ACTIVE_PREFIX = "active";

    public static String userSessions(String userId) {
        return USER_PREFIX + ":" + userId + ":" + SESSION_PREFIX;
    }

    public static String channelActive(String channelId) {
        return CHANNEL_PREFIX + ":" + channelId + ":" + ACTIVE_PREFIX;
    }

    public static String channelSubscribers(String channelId) {
        return CHANNEL_PREFIX + ":" + channelId + ":" + SUBSCRIBERS_PREFIX;
    }
}
