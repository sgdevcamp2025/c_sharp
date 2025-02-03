/**
 * 이미지/비디오 파일 최대 용량 (image: 20MB, video: 200MB) 상수
 */
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

/**
 * 주어진 파일의 사이즈가 제한 범위를 초과하지 않는지 검사하는 함수
 *
 * @param file - 검증할 File 객체
 * @returns 제한 범위를 벗어나면 false, 괜찮으면 true
 */
export const validateFileSize = (file: File) => {
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

/**
 * 주어진 동영상 파일로부터 썸네일(이미지)을 생성하는 함수
 *
 * @param file - 비디오 File 객체
 * @returns Promise. 성공 시 base64 Data URL 문자열, 실패 시 빈 문자열
 */
export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.autoplay = false;
    video.muted = true;
    video.preload = 'metadata';

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      video.currentTime = video.duration / 2;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const aspectRatio = video.videoWidth / video.videoHeight;

      const thumbnailWidth = 300;
      const thumbnailHeight = thumbnailWidth / aspectRatio;

      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, thumbnailWidth, thumbnailHeight);

      URL.revokeObjectURL(videoUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    video.onerror = () => {
      console.error('Error generating video thumbnail');
      URL.revokeObjectURL(videoUrl);
      resolve('');
    };
  });
};
