package com.jootalkpia.auth_server.user.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Getter
@Table(name = "users")
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    private Long socialId;

    private String email;

    @Enumerated(EnumType.STRING)
    private SocialType socialType;

    private String nickname;

    public static User of(
            final Long socialId,
            final String email,
            final SocialType socialType,
            final String socialNickname
    ) {
        return User.builder()
                .socialId(socialId)
                .email(email)
                .socialType(socialType)
                .nickname(socialNickname)
                .build();
    }
}
