package com.jootalkpia.auth_server.jwt;

import com.jootalkpia.auth_server.redis.Token;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface TokenRepository extends CrudRepository<Token, Long> {

    Optional<Token> findByRefreshToken(final String refreshToken);

    Optional<Token> findById(final Long id);
}