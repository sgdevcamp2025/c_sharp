package com.jootalkpia.file_server.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long file_id;

    private String url;
    private String url_thumbnail;
    private String file_type;
    private Long file_size;
    private String mime_type;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
