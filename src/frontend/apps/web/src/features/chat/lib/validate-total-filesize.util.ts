import { formatFileSize } from './format-file-size.util';

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
