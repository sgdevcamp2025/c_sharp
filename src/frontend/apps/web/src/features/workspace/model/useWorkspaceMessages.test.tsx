import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceMessages } from './useWorkspaceMessages';
import { QUERY_KEYS } from '@/src/shared/services';
import type { WorkspaceSubscriptionResponse } from '@/src/entities/workspace';

describe('useWorkspaceMessages', () => {
  let queryClient: QueryClient;
  const workspaceId = 123;
  const queryKey = QUERY_KEYS.workspaceMessages(workspaceId);

  // QueryClientProvider로 감싸기 위한 wrapper 컴포넌트
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('should return initial data from queryClient if present', () => {
    const dummyData: WorkspaceSubscriptionResponse = {
      workspaceId,
      createUserId: 1,
      channelId: 10,
      channelName: 'Test Channel',
      createdAt: new Date('2024-01-01T00:00:00'),
    };
    // queryKey에 해당하는 데이터를 미리 설정
    queryClient.setQueryData(queryKey, dummyData);
    const { result } = renderHook(() => useWorkspaceMessages(workspaceId), {
      wrapper,
    });
    expect(result.current.data).toEqual(dummyData);
  });

  it('should return null if no initial data is set', () => {
    // queryClient에 데이터가 없는 경우, 초기 데이터는 null이어야 함
    const { result } = renderHook(() => useWorkspaceMessages(workspaceId), {
      wrapper,
    });
    expect(result.current.data).toBeNull();
  });
});
