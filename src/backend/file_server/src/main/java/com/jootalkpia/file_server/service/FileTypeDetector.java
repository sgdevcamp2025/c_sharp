package com.jootalkpia.file_server.service;

import com.jootalkpia.file_server.exception.common.CustomException;
import com.jootalkpia.file_server.exception.common.ErrorCode;
import java.io.IOException;
import java.io.InputStream;
import org.apache.tika.Tika;
import org.springframework.web.multipart.MultipartFile;

public class FileTypeDetector {

    private static final Tika tika = new Tika();

    public static String detectFileTypeFromMultipartFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            // 파일을 한 번에 메모리에 로드하지 않고 스트리밍 방식으로 MIME 타입 감지
            String mimeType = tika.detect(inputStream);

            if (mimeType.startsWith("image/")) {
                return "IMAGE";
            } else if (mimeType.startsWith("video/")) {
                return "VIDEO";
            } else {
                return "UNKNOWN";
            }
        } catch (IOException e) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE.getCode(), ErrorCode.UNSUPPORTED_FILE_TYPE.getMsg());
        }
    }
}
