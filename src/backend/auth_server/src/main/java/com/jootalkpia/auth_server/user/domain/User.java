package com.jootalkpia.auth_server.user.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;
import java.time.LocalDateTime;

@Getter
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class User extends BaseTimeEntity {

    @Id
    private Long userId;

    private Long socialId;

    private String email;

    @Column("platform")
    private Platform platform;

    private String nickname;

    private String profileImage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static User of(
            final Long socialId,
            final String email,
            final Platform platform,
            final String socialNickname,
            final String profileImage
    ) {
        return User.builder()
                .socialId(socialId)
                .email(email)
                .platform(platform)
                .nickname(socialNickname)
                .profileImage(profileImage)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public void updateNickname(final String newNickname) {
        this.nickname = newNickname;
        this.updatedAt = LocalDateTime.now();
    }
}
