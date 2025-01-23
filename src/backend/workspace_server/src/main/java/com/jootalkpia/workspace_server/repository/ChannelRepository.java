package com.jootalkpia.workspace_server.repository;

import com.jootalkpia.workspace_server.entity.Channels;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelRepository extends JpaRepository<Channels, Long> {
    List<Channels> findByWorkSpaceWorkspaceId(Long workspaceId);
}
