package com.jootalkpia.auth_server.user.repository;

import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.user.domain.SocialType;
import com.jootalkpia.auth_server.user.domain.User;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {

    @Query("SELECT u FROM User u WHERE u.socialId = :socialId AND u.socialType = :socialType")
    Optional<User> findUserBySocialTypeAndSocialId(@Param("socialId") Long socialId,
                                                   @Param("socialType") SocialType socialType);

    Optional<User> findById(Long id);

    default User findByIdOrThrow(Long id) {
        return findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}