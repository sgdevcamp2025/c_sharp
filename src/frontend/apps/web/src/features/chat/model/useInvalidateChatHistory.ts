import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared';

export function useInvalidateChatHistory(channelId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;

    console.log(`🔄 채널 변경 감지: ${channelId} -> 데이터 초기화 중...`);

    // 기존 채널의 캐시 무효화
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.forwardHistory(channelId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.reverseHistory(channelId),
    });
  }, [channelId, queryClient]); // ✅ 채널 ID가 변경될 때 실행
}
