package com.jootalkpia.history_server.repository;

import com.jootalkpia.history_server.domain.UserChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserChannelRepository extends JpaRepository<UserChannel, Long> {

    @Query("SELECT u.lastReadId FROM UserChannel u WHERE u.userId = :userId AND u.channelId = :channelId")
    Long findLastReadIdByUserIdAndChannelId(@Param("userId") Long userId, @Param("channelId") Long channelId);
}
