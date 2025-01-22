package com.jootalkpia.workspace_server.util;

import com.jootalkpia.workspace_server.exception.common.CustomException;
import com.jootalkpia.workspace_server.exception.common.ErrorCode;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ValidationUtils {

    public static void validateWorkSpaceId(Long workSpaceId) {
        if (workSpaceId == null || workSpaceId <= 0) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER);
        }
    }
}