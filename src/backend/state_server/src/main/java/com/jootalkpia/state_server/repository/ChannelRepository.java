package com.jootalkpia.state_server.repository;

import com.jootalkpia.state_server.dto.ChannelInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChannelRepository {
    private final JdbcTemplate jdbcTemplate;

    public ChannelInfo findChannelFromId(Long channelId) {
        String sql = "SELECT c.workspace_id, c.name FROM channels c WHERE c.channel_id = ?";

        return jdbcTemplate.queryForObject(sql,
                (rs, rowNum) -> new ChannelInfo(
                        rs.getLong("workspace_id"),
                        rs.getString("name")
                ),
                channelId
        );
    }
}
