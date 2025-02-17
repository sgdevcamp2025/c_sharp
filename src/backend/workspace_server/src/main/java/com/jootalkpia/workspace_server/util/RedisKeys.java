package com.jootalkpia.workspace_server.util;

public class RedisKeys {
    private static final String CHANNEL_PREFIX = "channel";
    private static final String SUBSCRIBER_PREFIX = "subscribers";

    public static String channelSubscriber(String channelId) {
        return CHANNEL_PREFIX + ":" + channelId + ":" + SUBSCRIBER_PREFIX;
    }
}
