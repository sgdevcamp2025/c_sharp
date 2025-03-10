import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRouter } from 'next/navigation';

import { useUserStore } from '@/src/shared';

import { useLogout } from './useLogout';

// next/navigation과 useUserStore 모킹
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));
vi.mock('@/src/shared', () => ({
  useUserStore: vi.fn(),
}));

describe('useLogout', () => {
  const mockPush = vi.fn();
  const mockSetUser = vi.fn();

  let localStorageRemoveItem: ReturnType<typeof vi.fn>;
  let cookieValue = '';

  beforeEach(() => {
    vi.clearAllMocks();

    // next/navigation 모킹 설정
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    // useUserStore 모킹: selector 함수를 실행하여 { setUser: mockSetUser } 반환
    vi.mocked(useUserStore).mockImplementation((selector: any) =>
      selector({ setUser: mockSetUser }),
    );

    // localStorage 모킹: removeItem 메서드 모킹
    localStorageRemoveItem = vi.fn();
    vi.stubGlobal('localStorage', {
      removeItem: localStorageRemoveItem,
    });

    // document.cookie 모킹: setter를 재정의하여 할당된 문자열을 누적
    cookieValue = '';
    Object.defineProperty(document, 'cookie', {
      get: () => cookieValue,
      set: (val: string) => {
        cookieValue += val;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('should remove user, chat, clear cookies, reset user store and redirect to "/"', async () => {
    // TestComponent: useLogout 훅을 호출하고, logout 함수를 버튼 클릭 시 실행
    const TestComponent = () => {
      const logout = useLogout();
      return <button onClick={logout}>Logout</button>;
    };

    const { getByText } = render(<TestComponent />);
    const button = getByText('Logout');
    fireEvent.click(button);

    // localStorage에서 'user'와 'chat' 삭제 확인
    expect(localStorageRemoveItem).toHaveBeenCalledWith('user');
    expect(localStorageRemoveItem).toHaveBeenCalledWith('chat');

    // useUserStore의 setUser가 null로 호출되었는지 확인
    expect(mockSetUser).toHaveBeenCalledWith(null);

    // document.cookie에 쿠키 초기화 문자열이 포함되어 있는지 확인
    expect(cookieValue).toContain(
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
    );
    expect(cookieValue).toContain(
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
    );
    expect(cookieValue).toContain(
      'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
    );

    // useRouter의 push가 '/'로 호출되었는지 확인
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
