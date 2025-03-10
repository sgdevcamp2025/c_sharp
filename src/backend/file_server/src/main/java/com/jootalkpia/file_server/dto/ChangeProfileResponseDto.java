package com.jootalkpia.file_server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChangeProfileResponseDto {
    private Long userId;
    private String nickname;
    private String profileImage;
}
