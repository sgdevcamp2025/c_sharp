package com.jootalkpia.file_server.service;

import java.io.IOException;
import org.apache.tika.Tika;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.mime.MimeTypes;
import org.springframework.web.multipart.MultipartFile;

public class FileTypeDetector {

    private static final Tika tika = new Tika();

    public static String detectFileType(byte[] fileBytes) {
        try {
            // 파일의 MIME 타입 추출
            String mimeType = tika.detect(fileBytes);

            if (mimeType.startsWith("image/")) {
                return "IMAGE";
            } else if (mimeType.startsWith("video/")) {
                return "VIDEO";
            } else {
                return "UNKNOWN";
            }
        } catch (Exception e) {
            throw new RuntimeException("파일 타입 분석 중 오류 발생: " + e.getMessage(), e);
        }
    }

    public static String detectFileTypeFromMultipartFile(MultipartFile file) {
        try {
            // MultipartFile로부터 바이트 배열 추출
            return detectFileType(file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("파일 분석 중 오류 발생: " + e.getMessage(), e);
        }
    }
}

