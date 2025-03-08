import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { useFileManagements } from './useFileManagements';

vi.mock('../lib', () => ({
  validateFileType: vi.fn(),
  validateTotalFileSize: vi.fn(),
  processFile: vi.fn(),
  createChunks: vi.fn(),
  generateTempFileIdentifier: vi.fn(),
}));
vi.mock('../api', () => ({
  uploadSmallFiles: vi.fn(),
  uploadChunksQueue: vi.fn(),
  uploadThumbnail: vi.fn(),
}));

// 모킹한 함수들을 import (각각 vi.Mock 으로 타입 단언)
import {
  validateFileType,
  validateTotalFileSize,
  processFile,
  createChunks,
  generateTempFileIdentifier,
} from '../lib';
import { uploadSmallFiles, uploadChunksQueue, uploadThumbnail } from '../api';

// --- URL API 모킹 ---
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
beforeEach(() => {
  URL.createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

// --- document.createElement 모킹 (미리보기 생성에 사용) ---
const originalCreateElement = document.createElement;
beforeEach(() => {
  document.createElement = (tagName: string) => {
    if (tagName === 'video') {
      const video: Partial<HTMLVideoElement> & {
        trigger?: (event: string) => void;
      } = {
        autoplay: false,
        muted: true,
        preload: 'metadata',
        currentTime: 0,
        duration: 10,
        videoWidth: 1920,
        videoHeight: 1080,
        onloadedmetadata: null,
        onseeked: null,
        onerror: null,
        src: '',
      };
      video.trigger = () => {
        if (video.onloadedmetadata) {
          (video as HTMLVideoElement).onloadedmetadata({} as Event);
        }
        if (video.onseeked) {
          (video as HTMLVideoElement).onseeked({} as Event);
        }
      };
      return video as HTMLVideoElement;
    }
    return originalCreateElement.call(document, tagName);
  };
});
afterEach(() => {
  document.createElement = originalCreateElement;
});

// --- 내부 캐시 초기화 ---
import { blobUrlCache, processedFiles } from '../lib/filesUpload.utils';
const clearCaches = () => {
  blobUrlCache.clear();
  processedFiles.clear();
};

// 테스트에서 사용될 wrapper (필요시 Context Provider 등을 추가)
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

describe('useFileManagements', () => {
  const workspaceId = 1;
  const channelId = 101;
  const userId = 123;

  beforeEach(() => {
    // 기본 모킹 설정
    (validateFileType as unknown as Mock).mockReturnValue(true);
    (validateTotalFileSize as unknown as Mock).mockReturnValue(true);
    (processFile as unknown as Mock).mockImplementation(async (file: File) => {
      // 이미지 파일은 그대로 반환, 비디오 파일은 썸네일 생성 성공
      if (file.type.startsWith('video/')) {
        return {
          file,
          thumbnailFile: new File(['thumb'], 'thumbnail.webp', {
            type: 'image/webp',
          }),
        };
      }
      return { file, thumbnailFile: undefined };
    });
    (createChunks as unknown as Mock).mockResolvedValue([]);
    (generateTempFileIdentifier as unknown as Mock).mockReturnValue(
      'temp-identifier',
    );
    (uploadSmallFiles as unknown as Mock).mockResolvedValue({
      code: '200',
      fileId: 1001,
      status: 'success',
    });
    (uploadChunksQueue as unknown as Mock).mockResolvedValue([]);
    (uploadThumbnail as unknown as Mock).mockResolvedValue({
      code: '200',
      status: 'success',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('파일 선택 시, 불허 파일 타입이 있으면 처리를 중단한다', async () => {
    (validateFileType as unknown as Mock).mockReturnValueOnce(false);
    const { result } = renderHook(
      () => useFileManagements(workspaceId, channelId, userId),
      { wrapper },
    );
    const file = new File(['dummy'], 'invalid.txt', { type: 'text/plain' });
    const event = {
      target: { files: [file], value: 'initial' },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await act(async () => {
      await result.current.handleFileChange(event);
    });
    expect(result.current.filePreviews).toEqual([]);
    expect(result.current.isFinalLoading).toBe(false);
  });

  it('파일 전체 사이즈 검증 실패 시 처리를 중단한다', async () => {
    (validateTotalFileSize as unknown as Mock).mockReturnValueOnce(false);
    const { result } = renderHook(
      () => useFileManagements(workspaceId, channelId, userId),
      { wrapper },
    );
    const file = new File(['dummy'], 'image.png', { type: 'image/png' });
    const event = {
      target: { files: [file], value: 'initial' },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await act(async () => {
      await result.current.handleFileChange(event);
    });
    expect(result.current.filePreviews).toEqual([]);
    expect(result.current.isFinalLoading).toBe(false);
  });

  it('파일 선택 시 미리보기 데이터를 생성하고, thumbnail URL이 업데이트된다 (비디오 파일의 경우)', async () => {
    // 이미지와 비디오 파일 두 개를 선택하는 경우로 테스트
    const { result } = renderHook(
      () => useFileManagements(workspaceId, channelId, userId),
      { wrapper },
    );
    const imageFile = new File(['image content'], 'photo.png', {
      type: 'image/png',
      lastModified: Date.now(),
    });
    const videoFile = new File(['video content'], 'video.mp4', {
      type: 'video/mp4',
      lastModified: Date.now(),
    });
    const event = {
      target: { files: [imageFile, videoFile], value: 'initial' },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(event);
    });

    await waitFor(() => {
      expect(result.current.filePreviews.length).toBe(2);
    });
    const previews = result.current.filePreviews;
    // 이미지 파일의 미리보기 URL
    expect(
      previews.find((fp) => fp.file.name === imageFile.name)?.previewUrl,
    ).toBe(`blob:${imageFile.name}`);
    // 비디오 파일의 미리보기 URL
    expect(
      previews.find((fp) => fp.file.name === videoFile.name)?.previewUrl,
    ).toBe(`blob:${videoFile.name}`);
    // processFile 모킹에 따라, 비디오 파일에 대한 thumbnail URL이 업데이트되어야 함
    await waitFor(() => {
      expect(
        previews.find((fp) => fp.file.name === videoFile.name)?.thumbnailUrl,
      ).toBeDefined();
    });
  });

  it('업로드 로직: 10MB 이하 파일의 경우 uploadSmallFiles 및 (비디오일 경우) uploadThumbnail을 호출하고, uploadedFileIds를 업데이트한다', async () => {
    const smallFile = new File([new Uint8Array(5 * 1024 * 1024)], 'small.png', {
      type: 'image/png',
    });
    // 이미지 파일은 processFile가 thumbnail 없이 반환하도록 모킹
    (processFile as unknown as Mock).mockResolvedValue({
      file: smallFile,
      thumbnailFile: undefined,
    });
    const { result } = renderHook(
      () => useFileManagements(workspaceId, channelId, userId),
      { wrapper },
    );
    const event = {
      target: { files: [smallFile], value: 'initial' },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await act(async () => {
      await result.current.handleFileChange(event);
    });
    expect(uploadSmallFiles).toHaveBeenCalled();
    expect(result.current.uploadedFileIds).toContain(1001);
  });

  it('handleRemoveFile: 파일 미리보기를 제거한다', async () => {
    const { result } = renderHook(
      () => useFileManagements(workspaceId, channelId, userId),
      { wrapper },
    );
    act(() => {
      result.current.setFilePreviews([
        {
          id: '1',
          file: new File(['dummy'], 'a.png'),
          previewUrl: 'url-a',
          isLoading: false,
        },
        {
          id: '2',
          file: new File(['dummy'], 'b.png'),
          previewUrl: 'url-b',
          isLoading: false,
        },
      ]);
    });
    act(() => {
      result.current.handleRemoveFile(0);
    });
    expect(result.current.filePreviews.length).toBe(1);
    expect(result.current.filePreviews[0].id).toBe('2');
  });

  it('에러 발생 시, catch 블록이 실행되어 error 상태가 설정되고 isFinalLoading이 false가 된다', async () => {
    (processFile as unknown as Mock).mockRejectedValue(new Error('Test error'));
    const { result } = renderHook(
      () => useFileManagements(workspaceId, channelId, userId),
      { wrapper },
    );
    const file = new File(['dummy'], 'error.mp4', { type: 'video/mp4' });
    const event = {
      target: { files: [file], value: 'initial' },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await act(async () => {
      await result.current.handleFileChange(event);
    });
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.isFinalLoading).toBe(false);
  });
});
