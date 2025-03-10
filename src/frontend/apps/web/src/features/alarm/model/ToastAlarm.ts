'use client';

import { useEffect } from 'react';

import type { Alarm } from '@/src/entities/alarm';
import { webSocketEvent } from '@/src/shared/providers/StompWebSocketProvider';
import { useToast } from '@workspace/ui/hooks/Toast/use-toast';

export const ToastAlarm = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (message: Alarm) => {
      toast({
        title: `${message.userNickname} #${message.channelName}`,
        description: `${message.text}`,
      });
    };

    webSocketEvent.on('alarmReceived', handleMessage);

    return () => {
      webSocketEvent.off('alarmReceived', handleMessage);
    };
  }, [toast]);

  return null;
};
