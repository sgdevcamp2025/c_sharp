import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useWorkspaceChannels } from './useWorkspaceChannels';
import * as workspaceApi from '../api';
import { QUERY_KEYS } from '@/src/shared';
import type {
  WorkspaceListResponse,
  joinChannelResponse,
  unjoinChannelResponse,
} from '../api';

// Dummy type: joinChannelResponse에 creator 정보를 추가한 타입
type DummyWorkspaceSocketMessage = {
  channelId: number;
  channelName: string;
  createdAt: Date;
  createUserId: number;
  workspaceId: number;
};

// --- 모킹 설정 ---
// useWorkspaceSubscription 모킹: subscribe 함수를 외부에서 제어
let mockSubscribe: () => () => void = () => () => {};
vi.mock('./useWorkspaceSubscription', () => ({
  useWorkspaceSubscription: vi.fn(() => ({
    subscribe: () => (mockSubscribe ? mockSubscribe() : undefined),
    isConnected: true,
  })),
}));

// useWorkspaceMessages 모킹: dummy 메시지를 외부에서 제어
let dummyWorkspaceSocketMessage: DummyWorkspaceSocketMessage | null = null;
vi.mock('./useWorkspaceMessages', () => ({
  useWorkspaceMessages: vi.fn(() => ({
    data: dummyWorkspaceSocketMessage,
  })),
}));

// getWorkspaceList 모킹
vi.mock('../api', () => ({
  getWorkspaceList: vi.fn(),
}));

// QueryClient 생성 함수 (staleTime을 0으로 설정)
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

// wrapper: QueryClientProvider 사용 (beforeEach에서 생성한 queryClient 사용)
let queryClient: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useWorkspaceChannels', () => {
  const workspaceId = 1;
  const queryKey = QUERY_KEYS.workspaceList(workspaceId);

  // 더미 초기 데이터 (getWorkspaceList로 받아온 데이터라고 가정)
  const dummyWorkspaceList: WorkspaceListResponse = {
    joinedChannels: [
      {
        channelId: 1,
        channelName: 'Channel 1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        unreadNum: 0,
      } as joinChannelResponse,
    ],
    unjoinedChannels: [
      {
        channelId: 2,
        channelName: 'Channel 2',
        createdAt: new Date('2023-01-02T00:00:00Z'),
      } as unjoinChannelResponse,
    ],
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
    localStorage.setItem('user', JSON.stringify({ userId: 1 }));
    dummyWorkspaceSocketMessage = null;
    mockSubscribe = () => () => {};
    vi.clearAllMocks();
    // 기본적으로 getWorkspaceList는 dummyWorkspaceList를 반환하도록 설정
    vi.mocked(workspaceApi.getWorkspaceList).mockResolvedValue(
      dummyWorkspaceList,
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // [기본 데이터 관련 테스트]
  it('초기 데이터를 올바르게 설정한다', async () => {
    queryClient.setQueryData(queryKey, dummyWorkspaceList);
    const { result } = renderHook(() => useWorkspaceChannels(workspaceId), {
      wrapper,
    });
    await waitFor(
      () =>
        result.current.joinedChannels.length > 0 ||
        result.current.unjoinedChannels.length > 0,
    );
    expect(result.current.joinedChannels).toEqual(
      dummyWorkspaceList.joinedChannels,
    );
    expect(result.current.unjoinedChannels).toEqual(
      dummyWorkspaceList.unjoinedChannels,
    );
    expect(result.current.isLoading).toBe(false);
  });

  // [WebSocket 메시지 관련 테스트]
  it('WebSocket 메시지로 joinedChannel을 추가한다', async () => {
    vi.mocked(workspaceApi.getWorkspaceList).mockResolvedValue(
      dummyWorkspaceList,
    );
    const mockSocketMessage: DummyWorkspaceSocketMessage = {
      workspaceId,
      channelId: 3,
      channelName: 'Channel 3',
      createdAt: new Date(),
      createUserId: 1, // creator
    };
    dummyWorkspaceSocketMessage = mockSocketMessage;
    localStorage.setItem('user', JSON.stringify({ userId: 1 }));
    const { result, rerender } = renderHook(
      () => useWorkspaceChannels(workspaceId),
      { wrapper },
    );
    rerender();
    await waitFor(() =>
      result.current.joinedChannels.some((ch) => ch.channelId === 3),
    );
    expect(result.current.joinedChannels).toContainEqual(mockSocketMessage);
    expect(result.current.unjoinedChannels).toEqual([]);
  });

  it('WebSocket 메시지로 unjoinedChannel을 추가한다', async () => {
    vi.mocked(workspaceApi.getWorkspaceList).mockResolvedValue(
      dummyWorkspaceList,
    );
    const mockSocketMessage: DummyWorkspaceSocketMessage = {
      workspaceId,
      channelId: 4,
      channelName: 'Channel 4',
      createdAt: new Date(),
      createUserId: 456, // not creator
    };
    dummyWorkspaceSocketMessage = mockSocketMessage;
    localStorage.setItem('user', JSON.stringify({ userId: 1 }));
    const { result, rerender } = renderHook(
      () => useWorkspaceChannels(workspaceId),
      { wrapper },
    );
    rerender();
    await waitFor(() =>
      result.current.unjoinedChannels.some((ch) => ch.channelId === 4),
    );
    expect(result.current.joinedChannels).toEqual([]);
    expect(result.current.unjoinedChannels).toContainEqual(mockSocketMessage);
  });

  // [컴포넌트 언마운트 테스트]
  it('컴포넌트 언마운트 시 unsubscribe가 호출된다', async () => {
    let unsubscribeCalled = false;
    mockSubscribe = () => () => {
      unsubscribeCalled = true;
    };
    const { unmount } = renderHook(() => useWorkspaceChannels(workspaceId), {
      wrapper,
    });
    unmount();
    expect(unsubscribeCalled).toBe(true);
  });

  // [115~126번 분기 커버: localStorage 관련]
  it('user 정보가 없으면 채널 업데이트가 발생하지 않는다', async () => {
    localStorage.removeItem('user');
    dummyWorkspaceSocketMessage = {
      workspaceId,
      channelId: 7,
      channelName: 'Channel 7',
      createdAt: new Date(),
      createUserId: 1,
    };
    const { result } = renderHook(() => useWorkspaceChannels(workspaceId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.joinedChannels).toEqual([]);
      expect(result.current.unjoinedChannels).toEqual([]);
    });
  });

  it('user 객체에 userId가 없으면 채널 업데이트가 발생하지 않는다', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    dummyWorkspaceSocketMessage = {
      workspaceId,
      channelId: 8,
      channelName: 'Channel 8',
      createdAt: new Date(),
      createUserId: 1,
    };
    const { result } = renderHook(() => useWorkspaceChannels(workspaceId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.joinedChannels).toEqual([]);
      expect(result.current.unjoinedChannels).toEqual([]);
    });
  });

  it('JSON.parse 에러 발생 시 콘솔 에러가 출력된다', async () => {
    localStorage.setItem('user', 'not-json');
    dummyWorkspaceSocketMessage = {
      workspaceId,
      channelId: 9,
      channelName: 'Channel 9',
      createdAt: new Date(),
      createUserId: 1,
    };
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    renderHook(() => useWorkspaceChannels(workspaceId), { wrapper });
    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());
    expect(consoleErrorSpy.mock.calls[0][0]).toContain(
      'Failed to parse user data:',
    );
    consoleErrorSpy.mockRestore();
  });

  // refreshChannels 함수는 useQuery의 refetch를 감싸는 함수이므로,
  // 여기서는 해당 함수의 try/catch 분기를 커버하기 위해 성공/실패 케이스를 추가할 수 있지만,
  // 현재 useWorkspaceChannels에서 refreshChannels 함수는 getWorkspaceList와 invalidateQueries를 호출하는데,
  // 실제로 refetch()가 실행되는 시점에 이미 캐시된 데이터가 존재하므로 try 분기가 실행됩니다.
  // (refetch 실패 테스트는 useQuery 내부의 동작으로 인해 reject 대신 error 상태 객체가 반환될 수 있으므로
  //  해당 분기를 테스트하기 어렵습니다.)
});
