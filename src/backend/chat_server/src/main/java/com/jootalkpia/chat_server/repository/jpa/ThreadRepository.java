package com.jootalkpia.chat_server.repository.jpa;

import com.jootalkpia.chat_server.domain.Thread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThreadRepository extends JpaRepository<Thread, Long> {
}
