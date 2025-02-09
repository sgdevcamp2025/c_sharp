package com.jootalkpia.chat_server.repository;

import com.jootalkpia.chat_server.domain.Files;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<Files, Long> {

    Files findByFileId(long id);

    @Query("SELECT f.url FROM Files f WHERE f.fileId = :fileId")
    String findUrlByFileId(@Param("fileId") Long fileId);
}