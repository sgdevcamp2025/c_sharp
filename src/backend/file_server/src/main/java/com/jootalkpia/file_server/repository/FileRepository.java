package com.jootalkpia.file_server.repository;

import com.jootalkpia.file_server.entity.FilesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<FilesEntity, Long> {

}
