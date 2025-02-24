export const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

export const validateFileSize = (file: File) => {
  console.log('File type:', file.type);

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
