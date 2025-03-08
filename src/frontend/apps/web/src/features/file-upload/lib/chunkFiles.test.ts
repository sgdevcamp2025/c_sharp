import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as api from '../api';

// 모킹 설정
vi.mock('../api', () => ({
  getPing: vi.fn(),
}));

describe('chunkFiles.utils.ts', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // 캐시 초기화
    const { resetCache } = await import('./chunkFiles.utils');
    resetCache();
    // performance.now 모킹
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDynamicChunkSize', () => {
    it('네트워크 지연 시간이 500ms 이하일 때 기본 청크 크기를 반환한다', async () => {
      const { getDynamicChunkSize, DEFAULT_CHUNK_SIZE } = await import(
        './chunkFiles.utils'
      );
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(400); // 400ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const chunkSize = await getDynamicChunkSize();
      expect(chunkSize).toBe(DEFAULT_CHUNK_SIZE); // 200MB
      expect(api.getPing).toHaveBeenCalled();
    });

    it('네트워크 지연 시간이 500ms 초과 1000ms 이하일 때 100MB를 반환한다', async () => {
      const { getDynamicChunkSize } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(700); // 700ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const chunkSize = await getDynamicChunkSize();
      expect(chunkSize).toBe(100 * 1024 * 1024); // 100MB
    });

    it('네트워크 지연 시간이 1000ms 초과일 때 10MB를 반환한다', async () => {
      const { getDynamicChunkSize } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1500); // 1500ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const chunkSize = await getDynamicChunkSize();
      expect(chunkSize).toBe(10 * 1024 * 1024); // 10MB
    });

    it('네트워크 테스트 실패 시 기본 청크 크기를 반환한다', async () => {
      const { getDynamicChunkSize, DEFAULT_CHUNK_SIZE } = await import(
        './chunkFiles.utils'
      );
      vi.mocked(api.getPing).mockRejectedValue(new Error('Network error'));
      const chunkSize = await getDynamicChunkSize();
      expect(chunkSize).toBe(DEFAULT_CHUNK_SIZE);
    });

    it('캐시된 청크 크기를 반환한다', async () => {
      const { getDynamicChunkSize, DEFAULT_CHUNK_SIZE } = await import(
        './chunkFiles.utils'
      );
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(400);
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      await getDynamicChunkSize(); // 캐시에 저장
      vi.mocked(api.getPing).mockClear(); // 호출 횟수 초기화
      const cachedChunkSizeResult = await getDynamicChunkSize();
      expect(cachedChunkSizeResult).toBe(DEFAULT_CHUNK_SIZE);
      expect(api.getPing).not.toHaveBeenCalled(); // 두 번째 호출에서는 호출되지 않음
    });
  });

  describe('getUploadConcurrency', () => {
    it('네트워크 지연 시간이 500ms 이하일 때 동시성 5를 반환한다', async () => {
      const { getUploadConcurrency } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(300); // 300ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const concurrency = await getUploadConcurrency();
      expect(concurrency).toBe(5);
      expect(api.getPing).toHaveBeenCalled();
    });

    it('네트워크 지연 시간이 500ms 초과 1000ms 이하일 때 동시성 3을 반환한다', async () => {
      const { getUploadConcurrency } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(700); // 700ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const concurrency = await getUploadConcurrency();
      expect(concurrency).toBe(3);
    });

    it('네트워크 지연 시간이 1000ms 초과일 때 동시성 1을 반환한다', async () => {
      const { getUploadConcurrency } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1200); // 1200ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const concurrency = await getUploadConcurrency();
      expect(concurrency).toBe(1);
    });

    it('네트워크 테스트 실패 시 기본 동시성 3을 반환한다', async () => {
      const { getUploadConcurrency } = await import('./chunkFiles.utils');
      vi.mocked(api.getPing).mockRejectedValue(new Error('Network error'));
      const concurrency = await getUploadConcurrency();
      expect(concurrency).toBe(3);
    });

    it('캐시된 동시성을 반환한다', async () => {
      const { getUploadConcurrency } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(300);
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      await getUploadConcurrency(); // 캐시에 저장
      vi.mocked(api.getPing).mockClear(); // 호출 횟수 초기화
      const cachedConcurrency = await getUploadConcurrency();
      expect(cachedConcurrency).toBe(5);
      expect(api.getPing).not.toHaveBeenCalled(); // 두 번째 호출에서는 호출되지 않음
    });
  });

  describe('createChunks', () => {
    it('파일을 청크로 나눈다', async () => {
      const { createChunks } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(400); // 400ms 지연
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 450 * 1024 * 1024 }); // 450MB
      vi.spyOn(file, 'slice').mockImplementation((start, end) => {
        const size = Math.min(end, file.size) - start;
        const blob = new Blob([''], { type: 'video/mp4' });
        Object.defineProperty(blob, 'size', {
          value: size,
          configurable: true,
        });
        return blob;
      });
      const chunks = await createChunks(file);
      expect(chunks.length).toBe(3); // 200MB 청크 2개 + 나머지 50MB
      expect(chunks[0].size).toBe(200 * 1024 * 1024);
      expect(chunks[1].size).toBe(200 * 1024 * 1024);
      expect(chunks[2].size).toBe(50 * 1024 * 1024);
    });

    it('파일 크기가 청크 크기보다 작을 때 단일 청크를 반환한다', async () => {
      const { createChunks } = await import('./chunkFiles.utils');
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(400);
      vi.mocked(api.getPing).mockResolvedValue(undefined);
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 150 * 1024 * 1024 }); // 150MB
      vi.spyOn(file, 'slice').mockImplementation((start, end) => {
        const size = Math.min(end, file.size) - start;
        const blob = new Blob([''], { type: 'video/mp4' });
        Object.defineProperty(blob, 'size', {
          value: size,
          configurable: true,
        });
        return blob;
      });
      const chunks = await createChunks(file);
      expect(chunks.length).toBe(1);
      expect(chunks[0].size).toBe(150 * 1024 * 1024);
    });
  });

  describe('generateTempFileIdentifier', () => {
    it('고유한 파일 식별자를 생성한다', async () => {
      const { generateTempFileIdentifier } = await import('./chunkFiles.utils');
      const userId = 123;
      const timestamp = 1698765432100; // 예: 2023-10-31T12:34:32.100Z
      const fileIndex = 1;
      const identifier = generateTempFileIdentifier(
        userId,
        timestamp,
        fileIndex,
      );
      expect(identifier).toBe('123-1698765432.100000-1');
    });

    it('다른 입력값에 대해 고유한 식별자를 생성한다', async () => {
      const { generateTempFileIdentifier } = await import('./chunkFiles.utils');
      const id1 = generateTempFileIdentifier(123, 1698765432100, 1);
      const id2 = generateTempFileIdentifier(124, 1698765432100, 1);
      const id3 = generateTempFileIdentifier(123, 1698765432200, 1);
      const id4 = generateTempFileIdentifier(123, 1698765432100, 2);
      expect(id1).not.toBe(id2);
      expect(id1).not.toBe(id3);
      expect(id1).not.toBe(id4);
    });
  });
});
