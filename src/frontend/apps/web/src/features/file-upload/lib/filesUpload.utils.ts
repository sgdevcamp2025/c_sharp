import type { ProcessedFile } from '@/src/entities/file-upload';

import { validateFileSize } from './validateFiles.utils';

const blobUrlCache = new Map<string, string>();

export const generateVideoThumbnail = async (
  file: File,
): Promise<File | null> => {
  if (blobUrlCache.has(file.name)) {
    // console.log(`Using cached blob URL for ${file.name}`);
    return new File([blobUrlCache.get(file.name)!], 'thumbnail.webp', {
      type: 'image/webp',
    });
  }

  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.autoplay = false;
      video.muted = true;
      video.preload = 'metadata';

      const blobUrl = URL.createObjectURL(file);
      blobUrlCache.set(file.name, blobUrl);
      video.src = blobUrl;

      // console.log(`Created blob URL for video: ${blobUrl}`);

      const timeout = setTimeout(() => {
        console.error('Thumbnail generation timeout.');
        URL.revokeObjectURL(blobUrl);
        blobUrlCache.delete(file.name);
        reject(new Error('Thumbnail generation timeout'));
      }, 7000);

      let frameCaptured = false;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(
          video.duration * 0.5,
          video.duration - 0.1,
        );
      };

      video.onseeked = async () => {
        if (frameCaptured) return;
        frameCaptured = true;

        requestAnimationFrame(async () => {
          const canvas = document.createElement('canvas');
          const aspectRatio = video.videoWidth / video.videoHeight;
          const thumbnailWidth = 300;
          const thumbnailHeight = thumbnailWidth / aspectRatio;

          canvas.width = thumbnailWidth;
          canvas.height = thumbnailHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, thumbnailWidth, thumbnailHeight);
          }

          const blob = await new Promise<Blob | null>((res) => {
            canvas.toBlob(res, 'image/webp', 0.8);
          });

          clearTimeout(timeout);
          URL.revokeObjectURL(blobUrl);
          blobUrlCache.delete(file.name);

          if (blob) {
            const thumbnailFile = new File([blob], 'thumbnail.webp', {
              type: 'image/webp',
            });
            resolve(thumbnailFile);
          } else {
            reject(new Error('Blob creation failed'));
          }
        });
      };

      video.onerror = (error) => {
        console.error('Error generating video thumbnail:', error);
        URL.revokeObjectURL(blobUrl);
        blobUrlCache.delete(file.name);
        clearTimeout(timeout);
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

const processedFiles = new Map<string, ProcessedFile>();

export async function processFile(file: File): Promise<ProcessedFile | null> {
  if (!validateFileSize(file)) return null;

  if (processedFiles.has(file.name)) {
    return processedFiles.get(file.name)!;
  }

  let processedFile: ProcessedFile = { file, thumbnailFile: null };

  if (file.type.startsWith('video/')) {
    try {
      const thumbnailFile = await generateVideoThumbnail(file);
      processedFile = { file, thumbnailFile };
    } catch (err) {
      console.error('Failed to generate video thumbnail:', err);
      // 썸네일 실패 시 null
    }
  }
  // 이미지 파일이면 thumbnailFile은 null 그대로

  processedFiles.set(file.name, processedFile);
  return processedFile;
}
