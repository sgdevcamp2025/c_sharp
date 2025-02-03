package com.jootalkpia.file_server.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    @Transactional
    public MessageResponseDto uploadPung(Long userId, UploadPungRequestDto uploadPungRequestDto) {
        Long placeId = uploadPungRequestDto.getPlaceId();
        MultipartFile imageWithText = uploadPungRequestDto.getImageWithText();
        MultipartFile pureImage = uploadPungRequestDto.getPureImage();
        String text = uploadPungRequestDto.getText();

        try {
            Long imageId = null;
            // 1. Image 엔티티 생성 후 저장하여 imageId 얻기
            if (imageWithText != null & !imageWithText.isEmpty() && pureImage != null && !pureImage.isEmpty())
            {
                Image image = new Image();
                imageRepository.save(image);
                imageId = image.getImageId();

                // 2. S3에 이미지 업로드
                Map<String, String> imageKeys = s3Service.uploadFile(imageWithText, pureImage, imageId, false);
                log.info("S3 업로드 완료: {}", imageKeys);

                // 3. Image 엔티티에 S3 키값 업데이트 후 저장
                image.setImageTextKey(imageKeys.get("imageTextKey"));
                image.setPureImageKey(imageKeys.get("pureImageKey"));
                imageRepository.save(image);
                log.info("Image 저장 완료, imageId: {}", image.getImageId());
            }

            // 4. Pung 엔티티 생성 후 저장
            Pung pung = new Pung();
            pung.setUserId(userId);
            pung.setPlaceId(placeId);
            pung.setImageId(imageId);
            pung.setIsReview(false);
            pung.setText(text);
            pungRepository.save(pung);
            log.info("Pung 저장 완료, pungId: {}", pung.getPungId());

            // 5. AI에 이미지 전달 (실패해도 프론트엔드에 영향 없음)
            try {
                aiService.genTags(placeId, text, "https://pinpung-s3.s3.ap-northeast-2.amazonaws.com/original-images/"+imageId, userId);
                log.info("AI 태그 생성 요청 완료");
            } catch (Exception aiException) {
                log.error("AI 태그 생성 중 오류 발생: {}", aiException.getMessage(), aiException);
            }

            return new MessageResponseDto("Pung upload success");

        } catch (Exception e) {
            log.error("이미지 업로드 및 Pung 저장 중 오류 발생: {}", e.getMessage(), e);
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.FILE_UPLOAD_FAILED, "Pung 업로드 중 오류가 발생했습니다.");
        }
    }
}
