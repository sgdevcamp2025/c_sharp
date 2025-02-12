package com.jootalkpia.chat_server.repository;

import com.jootalkpia.chat_server.domain.Files;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<Files, Long> {

}