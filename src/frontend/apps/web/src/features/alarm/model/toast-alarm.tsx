'use client';

import { useEffect } from 'react';
import { webSocketEvent } from '@/src/shared/providers/stomp-websocket-provider';
import { useToast } from '@workspace/ui/hooks/Toast/use-toast';
import { ToastAction } from '@workspace/ui/components';

export type Alarm = {
  userNickname: string;
  channelName: string;
  text: string;
};

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
