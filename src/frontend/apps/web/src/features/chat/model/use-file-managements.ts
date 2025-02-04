import type { FileData } from './file-data.type';
import { validateFileSize, generateVideoThumbnail } from '../lib/file.utils';
import { useState, useEffect } from 'react';

/**
 * 파일 관리를 위한 커스텀 훅
 * @returns {Object} 파일 관리 관련 메서드와 상태
 * - selectedFiles: 선택된 파일 목록
 * - handleFileChange: 파일 선택 이벤트 핸들러
 * - handleRemoveFile: 파일 제거 메서드
 * - setSelectedFiles: 파일 목록 설정 함수
 */
export const useFileManagements = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  const processFile = async (file: File): Promise<FileData | null> => {
    if (!validateFileSize(file)) return null;

    const fileData: FileData = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
    };

    if (fileData.type === 'video') {
      try {
        fileData.thumbnailUrl = await generateVideoThumbnail(file);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }

    return fileData;
  };

  /**
   * 파일 선택 이벤트 핸들러
   * @param event - 파일 input 이벤트
   */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const files = Array.from(event.target.files || []);
      event.target.value = '';

      const processedFiles = await Promise.all(files.map(processFile));

      setSelectedFiles((prev) => [...prev, ...processedFiles.filter(Boolean)]);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentFiles = selectedFiles;

    return () => {
      currentFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [selectedFiles]);

  /**
   * 파일 제거 메서드
   * @param id - 제거할 파일의 ID
   */
  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((file) => file.id !== id);
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
