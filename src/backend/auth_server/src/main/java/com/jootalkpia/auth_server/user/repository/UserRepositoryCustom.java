package com.jootalkpia.auth_server.user.repository;

import com.jootalkpia.auth_server.user.domain.SocialType;
import com.jootalkpia.auth_server.user.domain.User;
import java.util.Optional;

public interface UserRepositoryCustom {
    Optional<User> findUserBySocialTypeAndSocialId(final Long socialId, final SocialType socialType);
}
