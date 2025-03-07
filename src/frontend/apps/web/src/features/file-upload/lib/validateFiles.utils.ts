import { formatFileSize } from './formatFileSize.util';

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

export const validateFileSize = (file: File) => {
  // console.log('File type:', file.type);

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    alert('Only image and video files are supported');
    return false;
  }

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

const FORBIDDEN_IMAGE_TYPES = ['image/svg+xml', 'image/heic', 'image/heif'];

export const validateFileType = (file: File): boolean => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    alert('Only image and video files are supported');
    return false;
  }

  if (FORBIDDEN_IMAGE_TYPES.includes(file.type)) {
    alert('SVG, HEIC, HEIF files are not supported');
    return false;
  }

  return true;
};

export const MAX_TOTAL_FILE_SIZE = 1000 * 1024 * 1024; // 1000MB

export const validateTotalFileSize = (files: File[]) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  if (totalSize > MAX_TOTAL_FILE_SIZE) {
    alert(
      `총 파일 크기가 1000MB를 초과할 수 없습니다. (현재: ${formatFileSize(totalSize)})`,
    );
    return false;
  }
  return true;
};
