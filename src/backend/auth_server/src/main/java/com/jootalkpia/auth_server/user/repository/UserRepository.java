package com.jootalkpia.auth_server.user.repository;

import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.user.domain.Platform;
import com.jootalkpia.auth_server.user.domain.User;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {

    @Query("SELECT u FROM User u WHERE u.socialId = :socialId AND u.platform = :platform")
    Optional<User> findUserByPlatformAndSocialId(@Param("socialId") Long socialId,
                                                   @Param("platform") Platform platform);

    Optional<User> findByUserId(Long userId);

    default User findByUserIdOrThrow(Long id) {
        return findByUserId(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    boolean existsByNickname(String nickname);
}