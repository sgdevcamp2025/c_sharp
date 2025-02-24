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
