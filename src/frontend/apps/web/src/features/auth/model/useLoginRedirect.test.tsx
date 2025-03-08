import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLoginRedirect } from './useLoginRedirect';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/src/shared';
import { requestLogin } from '../api';
import type { User } from '@/src/entities';

// next/navigation 모듈 모킹
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

// API 모킹
vi.mock('../api', () => ({
  requestLogin: vi.fn(),
}));

// useUserStore 모킹: selector 함수를 호출하여 { setUser: mockSetUser } 반환
vi.mock('@/src/shared', () => ({
  useUserStore: vi.fn(),
}));

// useLoginRedirect 훅을 호출하는 테스트 컴포넌트
const TestComponent = () => {
  useLoginRedirect();
  return <div>Test</div>;
};

describe('useLoginRedirect', () => {
  const mockPush = vi.fn();
  const mockSetUser = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // localStorage 모킹
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    // next/navigation 모킹 설정
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    vi.mocked(useSearchParams).mockReturnValue({
      get: mockGet,
    } as any);

    // useUserStore 모킹: selector를 받아 실행하도록 구현
    vi.mocked(useUserStore).mockImplementation((selector: any) =>
      selector({ setUser: mockSetUser }),
    );

    // alert 및 console.error 모킹
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('should redirect to "/" and alert when code is missing', async () => {
    mockGet.mockReturnValue(null);
    render(<TestComponent />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        '인가 코드가 없습니다. 다시 로그인 해주세요.',
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should handle error when requestLogin returns null', async () => {
    const validCode = 'valid-code';
    mockGet.mockReturnValue(validCode);
    vi.mocked(requestLogin).mockResolvedValue(null);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<TestComponent />);

    await waitFor(() => {
      expect(requestLogin).toHaveBeenCalledWith(validCode);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '로그인 실패:',
        new Error('사용자 정보가 없습니다.'),
      );
      expect(window.alert).toHaveBeenCalledWith(
        '로그인에 실패했습니다. 다시 로그인 해주세요.',
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle error when requestLogin throws an error', async () => {
    const validCode = 'valid-code';
    mockGet.mockReturnValue(validCode);
    const mockErr = new Error('Network Error');
    vi.mocked(requestLogin).mockRejectedValue(mockErr);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<TestComponent />);

    await waitFor(() => {
      expect(requestLogin).toHaveBeenCalledWith(validCode);
      expect(consoleErrorSpy).toHaveBeenCalledWith('로그인 실패:', mockErr);
      expect(window.alert).toHaveBeenCalledWith(
        '로그인에 실패했습니다. 다시 로그인 해주세요.',
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should set user and redirect to "/stock" on successful login', async () => {
    const validCode = 'valid-code';
    const fakeUser: User = {
      userId: 1,
      nickname: 'Test',
      profileImage: 'img.png',
    };
    mockGet.mockReturnValue(validCode);
    vi.mocked(requestLogin).mockResolvedValue(fakeUser);

    render(<TestComponent />);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(fakeUser),
      );
      expect(mockSetUser).toHaveBeenCalledWith(fakeUser);
      expect(mockPush).toHaveBeenCalledWith('/stock');
    });
  });
});
