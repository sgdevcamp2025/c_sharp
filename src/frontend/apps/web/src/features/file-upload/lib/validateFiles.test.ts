import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateFileSize,
  validateFileType,
  validateTotalFileSize,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_TOTAL_FILE_SIZE,
} from './validateFiles.utils';
import { formatFileSize } from './formatFileSize.util';

// Mock the alert function
global.alert = vi.fn();

// Mock formatFileSize function
vi.mock('./formatFileSize.util', () => ({
  formatFileSize: vi.fn((size) => `${(size / (1024 * 1024)).toFixed(2)}MB`),
}));

describe('File Validation Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('validateFileSize', () => {
    it('should return true for image files under 20MB', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 });

      expect(validateFileSize(file)).toBe(true);
      expect(global.alert).not.toHaveBeenCalled();
    });

    it('should return false for image files over 20MB', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 });

      expect(validateFileSize(file)).toBe(false);
      expect(global.alert).toHaveBeenCalledWith(
        'Image size should not exceed 20MB',
      );
    });

    it('should return true for video files under 200MB', () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 100 * 1024 * 1024 });

      expect(validateFileSize(file)).toBe(true);
      expect(global.alert).not.toHaveBeenCalled();
    });

    it('should return false for video files over 200MB', () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 250 * 1024 * 1024 });

      expect(validateFileSize(file)).toBe(false);
      expect(global.alert).toHaveBeenCalledWith(
        'Video size should not exceed 200MB',
      );
    });

    it('should return false for non-image and non-video files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });

      expect(validateFileSize(file)).toBe(false);
      expect(global.alert).toHaveBeenCalledWith(
        'Only image and video files are supported',
      );
    });

    it('should validate against the correct size constants', () => {
      expect(MAX_IMAGE_SIZE).toBe(20 * 1024 * 1024);
      expect(MAX_VIDEO_SIZE).toBe(200 * 1024 * 1024);
    });
  });

  describe('validateFileType', () => {
    it('should return true for supported image types', () => {
      const supportedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      supportedTypes.forEach((type) => {
        const file = new File([''], `test.${type.split('/')[1]}`, { type });
        expect(validateFileType(file)).toBe(true);
        expect(global.alert).not.toHaveBeenCalled();
      });
    });

    it('should return false for forbidden image types', () => {
      const forbiddenTypes = ['image/svg+xml', 'image/heic', 'image/heif'];

      forbiddenTypes.forEach((type) => {
        const file = new File([''], `test.${type.split('/')[1]}`, { type });
        vi.clearAllMocks(); // Clear mocks between iterations

        expect(validateFileType(file)).toBe(false);
        expect(global.alert).toHaveBeenCalledWith(
          'SVG, HEIC, HEIF files are not supported',
        );
      });
    });

    it('should return true for video files', () => {
      const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

      videoTypes.forEach((type) => {
        const file = new File([''], `test.${type.split('/')[1]}`, { type });
        vi.clearAllMocks(); // Clear mocks between iterations

        expect(validateFileType(file)).toBe(true);
        expect(global.alert).not.toHaveBeenCalled();
      });
    });

    it('should return false for non-image and non-video files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });

      expect(validateFileType(file)).toBe(false);
      expect(global.alert).toHaveBeenCalledWith(
        'Only image and video files are supported',
      );
    });
  });

  describe('validateTotalFileSize', () => {
    it('should return true when total file size is under 1000MB', () => {
      const files = [
        createFileMock('image/jpeg', 300 * 1024 * 1024),
        createFileMock('video/mp4', 400 * 1024 * 1024),
      ];

      expect(validateTotalFileSize(files)).toBe(true);
      expect(global.alert).not.toHaveBeenCalled();
    });

    it('should return false when total file size exceeds 1000MB', () => {
      const files = [
        createFileMock('image/jpeg', 300 * 1024 * 1024),
        createFileMock('video/mp4', 800 * 1024 * 1024),
      ];

      expect(validateTotalFileSize(files)).toBe(false);
      expect(formatFileSize).toHaveBeenCalledWith(1100 * 1024 * 1024);
      expect(global.alert).toHaveBeenCalledWith(
        '총 파일 크기가 1000MB를 초과할 수 없습니다. (현재: 1100.00MB)',
      );
    });

    it('should validate against the correct MAX_TOTAL_FILE_SIZE constant', () => {
      expect(MAX_TOTAL_FILE_SIZE).toBe(1000 * 1024 * 1024);
    });

    it('should handle empty file array', () => {
      expect(validateTotalFileSize([])).toBe(true);
      expect(global.alert).not.toHaveBeenCalled();
    });
  });
});

// Helper function to create file mocks with custom size
function createFileMock(type: string, size: number): File {
  const file = new File([''], `test.${type.split('/')[1]}`, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}
