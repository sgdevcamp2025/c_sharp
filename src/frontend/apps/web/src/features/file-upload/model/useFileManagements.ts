import { useState } from 'react';

import type { FilePreview } from './filePreview.type';
import {
  validateFileType,
  validateTotalFileSize,
  processFile,
  createChunks,
  generateTempFileIdentifier,
} from '../lib';
import { uploadChunksQueue, uploadSmallFiles, uploadThumbnail } from '../api';

export function useFileManagements(
  workspaceId: number,
  channelId: number,
  userId: number,
) {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isFinalLoading, setIsFinalLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedFileIds, setUploadedFileIds] = useState<number[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setError(null);
    setIsFinalLoading(true);

    try {
      const files = Array.from(event.target.files || []);
      event.target.value = '';

      // ────────── [1] 불허 타입 체크: 하나라도 불허면 전체 중단 ──────────
      for (const file of files) {
        if (!validateFileType(file)) {
          setIsFinalLoading(false);
          return;
        }
      }

      // ────────── [2] 파일 전체 사이즈 검사 ──────────
      const allFiles = [...filePreviews.map((fp) => fp.file), ...files];
      if (!validateTotalFileSize(allFiles)) {
        setIsFinalLoading(false);
        return;
      }

      // ────────── [3] 미리보기 데이터 생성 ──────────
      const timestamp = Date.now();
      const newPreviews: FilePreview[] = files.map((file, index) => {
        const id = `${userId}-${timestamp}-${index}`;
        return {
          id,
          file,
          previewUrl: URL.createObjectURL(file),
          thumbnailUrl: undefined,
          isLoading: true,
        };
      });

      setFilePreviews((prev) => [...prev, ...newPreviews]);

      // ────────── [4] 썸네일 생성 (비디오면) ──────────
      for (const file of files) {
        const processed = await processFile(file);
        if (processed?.thumbnailFile) {
          const thumbUrl = URL.createObjectURL(processed.thumbnailFile);
          setFilePreviews((prev) =>
            prev.map((fp) =>
              fp.file.name === file.name
                ? { ...fp, thumbnailUrl: thumbUrl }
                : fp,
            ),
          );
        }
      }

      // ────────── [5] 업로드 로직 ──────────
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // (A) 10MB 이하 소형 파일
          if (file.size <= 10 * 1024 * 1024) {
            const smallUploadRes = await uploadSmallFiles({
              channelId,
              workspaceId,
              file,
            });
            if (smallUploadRes.code === '200' && smallUploadRes.fileId) {
              // 비디오인 경우 썸네일 업로드
              if (file.type.startsWith('video/')) {
                const processed = await processFile(file);
                if (processed?.thumbnailFile) {
                  await uploadThumbnail({
                    fileId: smallUploadRes.fileId,
                    thumbnail: processed.thumbnailFile,
                  });
                }
              }
              setUploadedFileIds((prev) => [...prev, smallUploadRes.fileId]);
            }
          } else {
            // (B) 10MB 초과 -> 청크 업로드
            const chunks = await createChunks(file);
            const totalSize = file.size;
            const tempFileIdentifier = generateTempFileIdentifier(
              userId,
              timestamp,
              i + 1,
            );
            const uploadResponses = await uploadChunksQueue(
              chunks,
              channelId,
              workspaceId,
              tempFileIdentifier,
              totalSize,
            );

            // 청크 업로드 응답에서 fileId를 찾고, 비디오 썸네일 업로드
            for (const res of uploadResponses) {
              if (res.code === '200' && res.fileId && res.fileType) {
                const finalFileId = res.fileId;
                if (file.type.startsWith('video/')) {
                  const processed = await processFile(file);
                  if (processed?.thumbnailFile) {
                    await uploadThumbnail({
                      fileId: finalFileId,
                      thumbnail: processed.thumbnailFile,
                    });
                  }
                }
                setUploadedFileIds((prev) => [...prev, finalFileId]);
              }
            }
          }
        } finally {
          setFilePreviews((prev) =>
            prev.map((fp) =>
              fp.file.name === file.name ? { ...fp, isLoading: false } : fp,
            ),
          );
        }
      }
    } catch (err) {
      console.error('Error during file processing/upload:', err);
      setError(err as Error);
    } finally {
      setIsFinalLoading(false);
    }
  };

  // 선택한 파일 삭제 처리
  const handleRemoveFile = (index: number) => {
    setFilePreviews((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return {
    handleFileChange,
    handleRemoveFile,
    filePreviews,
    setFilePreviews,
    isFinalLoading,
    error,
    uploadedFileIds,
    setUploadedFileIds,
  };
}
