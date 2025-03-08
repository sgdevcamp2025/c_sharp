import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateVideoThumbnail,
  processFile,
  blobUrlCache,
  processedFiles,
} from './filesUpload.utils';
import { validateFileSize } from './validateFiles.utils';

// 모킹 설정
vi.mock('./validateFiles.utils', () => ({
  validateFileSize: vi.fn(),
}));

const mockURL = {
  createObjectURL: vi.fn(() => 'mock-blob-url'),
  revokeObjectURL: vi.fn(),
};

describe('filesUpload.utils.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blobUrlCache.clear();
    processedFiles.clear();

    // URL 모킹
    global.URL = mockURL as any;

    // requestAnimationFrame 모킹
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0); // 즉시 실행
      return 0;
    });

    // console.error 모킹
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // DOM 요소 모킹
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'video') {
        const video = {
          autoplay: false,
          muted: true,
          preload: 'metadata',
          _src: '',
          get src() {
            return this._src;
          },
          set src(value) {
            this._src = value;
            setTimeout(() => {
              if (this.onloadedmetadata) this.onloadedmetadata();
              if (this.onseeked) this.onseeked();
            }, 0);
          },
          currentTime: 0,
          duration: 10,
          videoWidth: 1920,
          videoHeight: 1080,
          onloadedmetadata: null,
          onseeked: null,
          onerror: null,
          addEventListener: vi.fn(function (event, handler) {
            if (event === 'loadedmetadata') this.onloadedmetadata = handler;
            if (event === 'seeked') this.onseeked = handler;
            if (event === 'error') this.onerror = handler;
          }),
        } as any;
        return video;
      }
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            drawImage: vi.fn(),
          })),
          toBlob: vi.fn((callback) => {
            callback(new Blob([''], { type: 'image/webp' }));
          }),
        } as any;
      }
      return {} as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete global.URL;
  });

  describe('generateVideoThumbnail', () => {
    it('비디오 파일의 썸네일을 성공적으로 생성한다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      const thumbnail = await generateVideoThumbnail(file);

      expect(thumbnail).toBeInstanceOf(File);
      expect(thumbnail?.name).toBe('thumbnail.webp');
      expect(thumbnail?.type).toBe('image/webp');
      expect(blobUrlCache.has(file.name)).toBe(false);
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(file);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
    });

    it('캐시된 Blob URL을 사용하여 썸네일을 반환한다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      blobUrlCache.set(file.name, 'cached-blob-url');

      const thumbnail = await generateVideoThumbnail(file);

      expect(thumbnail).toBeInstanceOf(File);
      expect(thumbnail?.name).toBe('thumbnail.webp');
      expect(thumbnail?.type).toBe('image/webp');
      expect(mockURL.createObjectURL).not.toHaveBeenCalled();
    });

    it('타임아웃 발생 시 에러를 반환한다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      vi.useFakeTimers();
      vi.spyOn(document, 'createElement').mockImplementationOnce(
        () =>
          ({
            autoplay: false,
            muted: true,
            preload: 'metadata',
            src: '',
            addEventListener: vi.fn(),
          }) as any,
      );

      const promise = generateVideoThumbnail(file);
      vi.advanceTimersByTime(7000);

      await expect(promise).rejects.toThrow('Thumbnail generation timeout');
      expect(console.error).toHaveBeenCalledWith(
        'Thumbnail generation timeout.',
      );
      expect(blobUrlCache.has(file.name)).toBe(false);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
      vi.useRealTimers();
    });

    // it('비디오 로드 실패 시 에러를 반환한다', async () => {
    //   const file = new File([''], 'test.mp4', { type: 'video/mp4' });
    //   vi.spyOn(document, 'createElement').mockImplementationOnce(
    //     () =>
    //       ({
    //         autoplay: false,
    //         muted: true,
    //         preload: 'metadata',
    //         src: '',
    //         addEventListener: vi.fn((event, handler) => {
    //           if (event === 'error') handler(new Error('Video load error'));
    //         }),
    //       }) as any,
    //   );

    //   await expect(generateVideoThumbnail(file)).rejects.toThrow(
    //     'Video load error',
    //   );
    //   expect(console.error).toHaveBeenCalledWith(
    //     'Error generating video thumbnail:',
    //     expect.any(Error),
    //   );
    //   expect(blobUrlCache.has(file.name)).toBe(false);
    //   expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
    // });

    // it('Blob 생성 실패 시 에러를 반환한다', async () => {
    //   const file = new File([''], 'test.mp4', { type: 'video/mp4' });
    //   vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    //     if (tagName === 'canvas') {
    //       return {
    //         width: 0,
    //         height: 0,
    //         getContext: vi.fn(() => ({
    //           drawImage: vi.fn(),
    //         })),
    //         toBlob: vi.fn((callback) => callback(null)), // Blob 생성 실패
    //       } as any;
    //     }
    //     return document.createElement(tagName as any);
    //   });

    //   await expect(generateVideoThumbnail(file)).rejects.toThrow(
    //     'Blob creation failed',
    //   );
    //   expect(blobUrlCache.has(file.name)).toBe(false);
    //   expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
    // });
  });

  describe('processFile', () => {
    it('파일 크기가 유효하지 않으면 null을 반환한다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      vi.mocked(validateFileSize).mockReturnValue(false);

      const result = await processFile(file);

      expect(result).toBe(null);
      expect(processedFiles.has(file.name)).toBe(false);
    });

    it('비디오 파일을 처리하고 썸네일을 생성한다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      vi.mocked(validateFileSize).mockReturnValue(true);

      const result = await processFile(file);

      expect(result).toHaveProperty('file', file);
      expect(result?.thumbnailFile).toBeInstanceOf(File);
      expect(result?.thumbnailFile?.name).toBe('thumbnail.webp');
      expect(processedFiles.has(file.name)).toBe(true);
      expect(processedFiles.get(file.name)).toEqual(result);
    });

    it('썸네일 생성 실패 시 thumbnailFile은 null로 설정되고 에러가 로그된다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      vi.mocked(validateFileSize).mockReturnValue(true);
      vi.spyOn(document, 'createElement').mockImplementationOnce(
        () =>
          ({
            autoplay: false,
            muted: true,
            preload: 'metadata',
            src: '',
            addEventListener: vi.fn((event, handler) => {
              if (event === 'error') handler(new Error('Video load error'));
            }),
          }) as any,
      );

      const result = await processFile(file);

      expect(result).toHaveProperty('file', file);
      expect(result?.thumbnailFile).toBe(null);
      expect(processedFiles.has(file.name)).toBe(true);
      expect(processedFiles.get(file.name)).toEqual(result);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to generate video thumbnail:',
        expect.any(Error),
      );
    });

    it('이미지 파일을 처리하면 thumbnailFile은 null이고 캐시에 저장된다', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(validateFileSize).mockReturnValue(true);

      const result = await processFile(file);

      expect(result).toHaveProperty('file', file);
      expect(result?.thumbnailFile).toBe(null);
      expect(processedFiles.has(file.name)).toBe(true);
      expect(processedFiles.get(file.name)).toEqual(result);
    });

    it('캐시된 파일을 반환한다', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      const cachedResult = { file, thumbnailFile: null };
      processedFiles.set(file.name, cachedResult);
      vi.mocked(validateFileSize).mockReturnValue(true);

      const result = await processFile(file);

      expect(result).toBe(cachedResult);
      expect(document.createElement).not.toHaveBeenCalledWith('video');
    });
  });
});
