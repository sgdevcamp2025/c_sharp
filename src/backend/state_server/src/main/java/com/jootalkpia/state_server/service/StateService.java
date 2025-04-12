package com.jootalkpia.state_server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.jootalkpia.state_server.dto.ChannelInfo;
import com.jootalkpia.state_server.dto.CommonData;
import com.jootalkpia.state_server.dto.PushMessageToKafka;
import com.jootalkpia.state_server.entity.common.RedisKeys;
import com.jootalkpia.state_server.repository.ChannelRepository;
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

    private final ChannelRepository channelRepository;

    public PushMessageToKafka createPushMessage(JsonNode commonNode, JsonNode messagesNode, String sessionId) {
        CommonData commonData = CommonData.from(commonNode);
        ChannelInfo channelInfo = channelRepository.findChannelFromId(Long.valueOf(commonData.channelId()));

        return PushMessageToKafka.from(sessionId, commonData, messagesNode, channelInfo);
    }

    public Set<String> findNotificationTargets(String channelId, String userId) {
        return stringOperRedisTemplate.opsForSet().members("user:sessions");

//        Set<String> subscriber = findSubscribers(channelId);
//        Set<String> onlineSessions = findOnlineSessions(userId, subscriber);
//        Set<String> activeSessions = findActiveSessions(channelId, subscriber, userId);
//
//        log.info("[Notification Targets] Channel: {}", channelId);
//        log.info("├── Online Sessions: {}", onlineSessions);
//        log.info("├── Active Sessions: {}", activeSessions);
//
//        onlineSessions.removeAll(activeSessions);
//        log.info("└── Target Sessions: {}", onlineSessions);
//
//        return onlineSessions;
    }

    private Set<String> findSubscribers(String channelId) {
        return stringOperRedisTemplate.opsForSet().members(RedisKeys.channelSubscribers(channelId));
    }

    private Set<String> findOnlineSessions(String messagePublisher, Set<String> subscribers) {
        Set<String> onlineSessions = new HashSet<>();

        for (String userId : subscribers) {
            if (isNotPublisher(userId, messagePublisher)) {
                addUserSessions(userId, onlineSessions);
            }
        }

        return onlineSessions;
    }

    private boolean isNotPublisher(String userId, String messagePublisher) {
        return !userId.equals(messagePublisher);
    }

    private void addUserSessions(String userId, Set<String> onlineSessions) {
        Set<String> userSessions = findUserSessions(userId);

        if (userSessions != null) {
            onlineSessions.addAll(userSessions);
        }
    }

    private Set<String> findUserSessions(String userId) {
        return stringOperRedisTemplate.opsForSet()
                .members(RedisKeys.userSessions(userId));
    }

    private Set<String> findActiveSessions(String channelId, Set<String> subscribers, String messagePublisher) {
        Set<String> activeSessions = new HashSet<>();

        for (String userId : subscribers) {
            if (isNotPublisher(userId, messagePublisher)) {
                addActiveSessionsForUser(channelId, userId, activeSessions);
            }
        }

        return activeSessions;
    }

    private void addActiveSessionsForUser(String channelId, String userId, Set<String> activeSessions) {
        Object userActiveSessions = getUserActiveSessions(channelId, userId);

        if (userActiveSessions != null) {
            Set<String> sessions = convertToSet(userActiveSessions);
            addQuotedSessions(sessions, activeSessions);
        }
    }

    private Object getUserActiveSessions(String channelId, String userId) {
        return objectOperRedisTemplate.opsForHash()
                .get(RedisKeys.channelActive(channelId), userId);
    }

    private void addQuotedSessions(Set<String> sessions, Set<String> activeSessions) {
        for (String session : sessions) {
            activeSessions.add(formatSessionWithQuotes(session));
        }
    }

    private String formatSessionWithQuotes(String session) {
        return "\"" + session + "\"";
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
