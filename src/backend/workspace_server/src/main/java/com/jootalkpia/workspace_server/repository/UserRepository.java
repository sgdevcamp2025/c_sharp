package com.jootalkpia.workspace_server.repository;

import com.jootalkpia.workspace_server.entity.UserChannel;
import com.jootalkpia.workspace_server.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
}
