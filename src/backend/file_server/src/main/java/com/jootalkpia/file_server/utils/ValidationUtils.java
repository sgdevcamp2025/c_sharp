package com.jootalkpia.file_server.utils;

import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@AllArgsConstructor
@Slf4j
public class ValidationUtils {

    public static void validateWorkSpaceId(Long workSpaceId) {
        if (workSpaceId == null || workSpaceId <= 0) {
            log.info("Validation work space id is null");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
    }

    public static void validateChannelId(Long channelId) {
        if (channelId == null || channelId <= 0) {
            log.info("Validation channel id is null");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
    }

    public static void validateFileId(Long fileId) {
        if (fileId == null || fileId <= 0) {
            log.info("Validation file id is null");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
    }

    public static void validateFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            log.info("Validation files are null");
            throw new CustomException(ErrorCode.MISSING_FILES.getCode(), ErrorCode.MISSING_FILES.getMsg());
        }
    }

    public static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.info("Validation file is null");
            throw new CustomException(ErrorCode.MISSING_FILES.getCode(), ErrorCode.MISSING_FILES.getMsg());
        }
    }

    public static void validateFileId(String fileId) {
        if (fileId == null || fileId.isEmpty() ) {
            log.info("Validation file id is null");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
    }

    public static void validateTotalChunksAndChunkIndex(Long totalChunks, Long chunkIndex) {
        if (totalChunks == null || totalChunks <= 0) {
            log.info("Validation chunk index is null");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
        if (chunkIndex == null || chunkIndex <= 0) {
            log.info("Validation chunk index is null");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
        if (chunkIndex > totalChunks) {
            log.error("chunkIndex({})가 1~{} 범위를 벗어남", chunkIndex, totalChunks);
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
    }

    public static void validateLengthOfFilesAndThumbnails(int fileLength, int thumbnailLength) {
        if (fileLength < thumbnailLength) {
            log.info("Validation length of files and thumbnails");
            throw new CustomException(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMsg());
        }
    }
}