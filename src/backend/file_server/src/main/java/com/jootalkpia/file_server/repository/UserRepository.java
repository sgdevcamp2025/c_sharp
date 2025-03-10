package com.jootalkpia.file_server.repository;

import com.jootalkpia.file_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
