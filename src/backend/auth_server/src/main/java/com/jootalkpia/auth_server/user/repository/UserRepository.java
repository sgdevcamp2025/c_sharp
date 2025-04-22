package com.jootalkpia.auth_server.user.repository;

import com.jootalkpia.auth_server.exception.CustomException;
import com.jootalkpia.auth_server.response.ErrorCode;
import com.jootalkpia.auth_server.user.domain.Platform;
import com.jootalkpia.auth_server.user.domain.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveCrudRepository<User, Long> {

    Mono<User> findByUserId(Long userId); // JPA가 아님 → 직접 커스텀 쿼리 필요 시 @Query 필요

    Mono<Boolean> existsByNickname(String nickname);

    Mono<User> findBySocialIdAndPlatform(Long socialId, Platform platform);

    default Mono<User> findByUserIdOrThrow(Long id) {
        return findByUserId(id)
                .switchIfEmpty(Mono.error(new CustomException(ErrorCode.USER_NOT_FOUND)));
    }
}
