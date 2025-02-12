package com.jootalkpia.history_server.domain;

import java.time.LocalDateTime;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

@Getter
public abstract class BaseTimeEntity {

    @CreatedDate
    private LocalDateTime createdAt; // 생성 시간

    @LastModifiedDate
    private LocalDateTime updatedAt; // 수정 시간
}
