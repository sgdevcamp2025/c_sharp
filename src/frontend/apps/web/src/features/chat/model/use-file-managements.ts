import type { FileData } from './file-data.type';
import {
  validateFileSize,
  generateVideoThumbnail,
  validateTotalFileSize,
} from '../lib/file.utils';
import { useState } from 'react';
import { uploadFiles } from '../api/uploadFile.api';

type ProcessedFile = {
  file: File;
  thumbnailFile: File | null;
};

export const useFileManagements = (workspaceId: number, channelId: number) => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processFile = async (file: File): Promise<ProcessedFile | null> => {
    if (!validateFileSize(file)) return null;

    if (file.type.startsWith('image/')) {
      // 이미지 파일: thumbnailFile은 null 처리
      return { file, thumbnailFile: null };
    }

    if (file.type.startsWith('video/')) {
      try {
        const thumbnailFile = await generateVideoThumbnail(file);
        return { file, thumbnailFile };
      } catch (err) {
        console.error('Failed to generate thumbnail:', err);
        return { file, thumbnailFile: null };
      }
    }

    return null;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const files = Array.from(event.target.files || []);
      // 파일 재선택을 위해 input 초기화
      event.target.value = '';

      if (!validateTotalFileSize(files)) {
        setIsLoading(false);
        return;
      }

      selectedFiles.forEach((fileData) => {
        fileData.file.forEach((file) => {
          if (file instanceof File && file.type.startsWith('video/')) {
            URL.revokeObjectURL(file.name);
          }
        });
      });

      // 선택한 파일들을 순서대로 전처리
      const processedResults = await Promise.all(files.map(processFile));
      const processedFiles = processedResults.filter(
        (f): f is ProcessedFile => f !== null,
      );

      // 원래 선택 순서를 유지하여 파일 배열과 썸네일 배열 구성
      const fileArray = processedFiles.map((item) => item.file);
      const thumbnailArray = processedFiles.map((item) => item.thumbnailFile);

      // 백엔드 API 호출을 위한 payload 구성
      // API 함수 uploadFiles는 채널, 워크스페이스 ID를 number로 받으므로 변환합니다.
      const payload = {
        channelId: Number(channelId),
        workspaceId: Number(workspaceId),
        files: fileArray,
        thumbnails: thumbnailArray,
      };
      // console.log('Payload:', payload);

      const response = await uploadFiles(payload);
      console.log('Upload response:', response);

      // 미리보기 상태(FileData) 생성 및 추가
      const newFileData: FileData = {
        workspaceId: workspaceId.toString(),
        channelId: channelId.toString(),
        file: fileArray,
        thumbnailUrl: thumbnailArray.filter(
          (thumb): thumb is File => thumb !== null,
        ),
      };

      setSelectedFiles((prev) => [...prev, newFileData]);
    } catch (err) {
      console.error('Error during file processing/upload:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return {
    handleFileChange,
    handleRemoveFile,
    selectedFiles,
    setSelectedFiles,
    isLoading,
    error,
  };
};
