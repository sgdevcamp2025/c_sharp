package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class FileTypeDetector {

    private final Tika tika = new Tika();

    public String detectFileTypeFromMultipartFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            return detectFileType(inputStream);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), ErrorCode.UNSUPPORTED_FILE_TYPE.getMsg());
        }
    }

    public String detectFileTypeFromFile(File file) {
        try {
            return detectFileType(file);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), ErrorCode.UNSUPPORTED_FILE_TYPE.getMsg());
        }
    }

    public String detectFileType(Object file) throws IOException {
        String mimeType = detectMimeType(file);

        if (mimeType.startsWith("image/")) {
            return "IMAGE";
        } else if (mimeType.startsWith("video/")) {
            return "VIDEO";
        } else {
            return "UNKNOWN";
        }
    }

    public String detectMimeType(Object file) {
        try {
            String mimeType;
            if (file instanceof InputStream) {
                mimeType = tika.detect((InputStream) file);
            } else if (file instanceof File) {
                mimeType = tika.detect((File) file);
            } else {
                throw new IllegalArgumentException("Unsupported file type for detection");
            }

            log.info("파일 MIME 타입: {}", mimeType);
            return mimeType;
        } catch (IOException e) {
            log.warn("MIME 타입 감지 실패, 기본값 사용: binary/octet-stream", e);
            throw new CustomException(ErrorCode.MIMETYPE_DETECTION_FAILED.getCode(), ErrorCode.MIMETYPE_DETECTION_FAILED.getMsg());
        }
    }


    public File convertMultipartToFile(MultipartFile multipartFile) {
        try {
            File tempFile = File.createTempFile("temp_", multipartFile.getOriginalFilename());
            multipartFile.transferTo(tempFile);
            return tempFile;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}