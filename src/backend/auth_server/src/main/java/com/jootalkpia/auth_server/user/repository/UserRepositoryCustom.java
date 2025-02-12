package com.jootalkpia.auth_server.user.repository;

import com.jootalkpia.auth_server.user.domain.Platform;
import com.jootalkpia.auth_server.user.domain.User;
import java.util.Optional;

public interface UserRepositoryCustom {
    Optional<User> findUserByPlatformAndSocialId(final Long socialId, final Platform platform);
}
