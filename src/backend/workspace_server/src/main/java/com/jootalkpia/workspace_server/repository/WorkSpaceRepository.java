package com.jootalkpia.workspace_server.repository;

import com.jootalkpia.workspace_server.entity.WorkSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkSpaceRepository extends JpaRepository<WorkSpace, Long> {
}

