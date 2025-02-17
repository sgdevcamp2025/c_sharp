package com.jootalkpia.state_server.service;

import com.jootalkpia.state_server.entity.RedisKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class StateService {
    private final RedisTemplate<String, String> stringOperRedisTemplate;
    private final RedisTemplate<String, Object> objectOperRedisTemplate;

    public Set<String> findNotificationTargets(String channelId) {
        Set<String> subscriber = findSubscribers(channelId);
        Set<String> onlineSessions = findOnlineSessions(subscriber);
        Set<String> activeSessions = findActiveSessions(channelId, subscriber);

        log.info("[Notification Targets] Channel: {}", channelId);
        log.info("├── Online Sessions: {}", onlineSessions);
        log.info("├── Active Sessions: {}", activeSessions);

        onlineSessions.removeAll(activeSessions);
        log.info("└── Target Sessions: {}", onlineSessions);

        return onlineSessions;
    }

    private Set<String> findSubscribers(String channelId) {
        return stringOperRedisTemplate.opsForSet().members(RedisKeys.channelSubscribers(channelId));
    }

    private Set<String> findOnlineSessions(Set<String> subscriber) {
        Set<String> onlineSessions = new HashSet<>();

        for (String userId : subscriber) {
            Set<String> userSessions = stringOperRedisTemplate.opsForSet()
                    .members(RedisKeys.userSessions(userId));
            if (userSessions != null) {
                onlineSessions.addAll(userSessions);
            }
        }

        return onlineSessions;
    }

    private Set<String> findActiveSessions(String channelId, Set<String> subscriber) {
        Set<String> activeSessions = new HashSet<>();

        for (String userId : subscriber) {
            Object userActiveSessions = objectOperRedisTemplate.opsForHash()
                    .get(RedisKeys.channelActive(channelId), userId);

            if (userActiveSessions != null) {
                Set<String> sessions = convertToSet(userActiveSessions);
                sessions.forEach(session ->
                        activeSessions.add("\"" + session + "\""));
            }
        }

        return activeSessions;
    }

    @SuppressWarnings("unchecked")
    private Set<String> convertToSet(Object storedValue) {
        if (storedValue instanceof Set) {
            return (Set<String>) storedValue;
        } else if (storedValue instanceof List) {
            return new HashSet<>((List<String>) storedValue);
        } else {
            return new HashSet<>();
        }
    }
}
