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
 * 다중 선택된 파일들의 총 크기가 1000MB를 넘지 않도록 검증하는 함수
 *
 * @param files - 업로드할 파일 배열
 * @returns 제한 초과 시 false 반환, 허용 범위 내면 true 반환
 */
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

/**
 * 주어진 동영상 파일로부터 썸네일(이미지) File 객체를 생성하는 함수
 *
 * @param file - 비디오 File 객체
 * @returns Promise. 성공 시 썸네일 File 객체, 실패 시 null
 */
export const generateVideoThumbnail = (file: File): Promise<File | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.autoplay = false;
    video.muted = true;
    video.preload = 'metadata';

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      // 영상의 중간 지점으로 이동하여 썸네일을 생성
      video.currentTime = video.duration / 2;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const aspectRatio = video.videoWidth / video.videoHeight;

      // 썸네일의 너비를 300px로 설정하고 높이는 비율에 맞게 계산
      const thumbnailWidth = 300;
      const thumbnailHeight = thumbnailWidth / aspectRatio;

      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, thumbnailWidth, thumbnailHeight);
      }

      // canvas.toBlob을 사용해 Blob 객체로 변환 후 File 객체 생성
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(videoUrl);
          if (blob) {
            // 생성된 Blob을 기반으로 File 객체 생성 (파일명은 thumbnail.jpg)
            const thumbnailFile = new File([blob], 'thumbnail.jpg', {
              type: 'image/jpeg',
            });
            resolve(thumbnailFile);
          } else {
            console.error('Error generating thumbnail blob');
            resolve(null);
          }
        },
        'image/jpeg',
        0.7,
      );
    };

    video.onerror = () => {
      console.error('Error generating video thumbnail');
      URL.revokeObjectURL(videoUrl);
      resolve(null);
    };
  });
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 포맷팅하는 함수
 *
 * @param bytes - 파일 크기 (바이트 단위)
 * @returns 포맷팅된 파일 크기 문자열 (예: '1.23 MB')
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
