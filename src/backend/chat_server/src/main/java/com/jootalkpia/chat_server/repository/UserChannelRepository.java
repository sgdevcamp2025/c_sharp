package com.jootalkpia.chat_server.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserChannelRepository {
    private final JdbcTemplate jdbcTemplate;

    public void updateLastAccessTime(String userId, String channelId, Long lastReadId) {
        String sql = "UPDATE user_channel SET last_read_id = ? " +
                "WHERE user_id = ? AND channel_id = ?";

        jdbcTemplate.update(sql, lastReadId, Long.valueOf(userId), Long.valueOf(channelId));
    }
}
