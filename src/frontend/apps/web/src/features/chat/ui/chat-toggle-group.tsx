'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@workspace/ui/components';

export type FileData = {
  id: string;
  file: File;
  preview: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
};

type ChatImagePickerProps = {
  label: string;
  name: string;
  onSend?: () => void; // Send 버튼용 prop 추가
};

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

const ChatToggleGroup = ({ name, onSend }: ChatImagePickerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const validateFileSize = (file: File) => {
    if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
      alert('Image size should not exceed 20MB');
      return false;
    }
    if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
      alert('Video size should not exceed 200MB');
      return false;
    }
    return true;
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // 비디오 엘리먼트 생성
      const video = document.createElement('video');
      // 비디오 속성 설정
      video.autoplay = false;
      video.muted = true;
      video.preload = 'metadata';

      // 비디오 URL 생성
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;

      // 메타데이터 로드 완료 시
      video.onloadedmetadata = () => {
        // 비디오 duration의 중간 지점으로 이동
        video.currentTime = video.duration / 2;
      };

      // 특정 시간으로 이동 완료 후
      video.onseeked = () => {
        // 캔버스 생성
        const canvas = document.createElement('canvas');
        const aspectRatio = video.videoWidth / video.videoHeight;

        // 썸네일 크기 설정 (너비 300px 기준)
        const thumbnailWidth = 300;
        const thumbnailHeight = thumbnailWidth / aspectRatio;

        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;

        // 썸네일 생성
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, thumbnailWidth, thumbnailHeight);

        // URL 정리
        URL.revokeObjectURL(videoUrl);

        // 썸네일 URL 반환
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      // 에러 처리
      video.onerror = () => {
        console.error('Error generating video thumbnail');
        URL.revokeObjectURL(videoUrl);
        resolve(''); // 실패 시 빈 문자열 반환
      };
    });
  };

  // handleFileChange 함수도 수정
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    for (const file of files) {
      if (!validateFileSize(file)) continue;

      try {
        const fileData: FileData = {
          id: Math.random().toString(36).substring(7),
          file,
          preview: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video',
        };

        if (fileData.type === 'video') {
          // 썸네일 생성 시도
          try {
            const thumbnailUrl = await generateVideoThumbnail(file);
            if (thumbnailUrl) {
              fileData.thumbnailUrl = thumbnailUrl;
            }
          } catch (error) {
            console.error('Failed to generate thumbnail:', error);
          }
        }

        setSelectedFiles((prev) => [...prev, fileData]);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((file) => file.id !== id);
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col justify-between gap-2">
        {selectedFiles.length > 0 && (
          <div className="overflow-x-auto w-full">
            <div className="flex gap-2 pb-2 w-max">
              {selectedFiles.map((fileData) => (
                <div
                  key={fileData.id}
                  className="relative group flex-shrink-0"
                >
                  <div className="w-20 h-20 rounded-lg relative">
                    {fileData.type === 'image' ? (
                      <Image
                        src={fileData.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={fileData.thumbnailUrl || ''}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-row justify-between">
          <div className="flex items-center gap-2">
            <input
              className="hidden"
              type="file"
              id={name}
              accept="image/*, video/*"
              name={name}
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handlePickFile}
            >
              +
            </Button>
            <span className="text-xs text-gray-500">
              Images (max 20MB) or Videos (max 200MB)
            </span>
          </div>
          {onSend && (
            <Button
              onClick={onSend}
              size="sm"
            >
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatToggleGroup;
