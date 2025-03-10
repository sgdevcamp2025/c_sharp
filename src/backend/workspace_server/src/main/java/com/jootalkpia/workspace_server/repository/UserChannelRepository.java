package com.jootalkpia.workspace_server.repository;

import com.jootalkpia.workspace_server.entity.UserChannel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserChannelRepository extends JpaRepository<UserChannel, Long> {
    Optional<UserChannel> findByUsersUserIdAndChannelsChannelId(Long userId, Long channelId);
}
