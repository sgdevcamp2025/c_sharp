import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';

import { webSocketEvent } from '@/src/shared/providers/StompWebSocketProvider';

import { ToastAlarm } from './ToastAlarm';

vi.mock('@/src/shared/providers/StompWebSocketProvider', () => ({
  webSocketEvent: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

const toastMock = vi.fn();
vi.mock('@workspace/ui/hooks/Toast/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

const onMock = webSocketEvent.on as unknown as Mock;
const offMock = webSocketEvent.off as unknown as Mock;

describe('ToastAlarm', () => {
  it('should register and unregister the alarm event handler', () => {
    const { unmount } = render(<ToastAlarm />);
    expect(onMock).toHaveBeenCalledWith('alarmReceived', expect.any(Function));
    const handler = onMock.mock.calls[0][1];
    unmount();
    expect(offMock).toHaveBeenCalledWith('alarmReceived', handler);
  });

  it('should call toast when an alarm message is received', () => {
    render(<ToastAlarm />);
    expect(onMock).toHaveBeenCalledWith('alarmReceived', expect.any(Function));
    const handler = onMock.mock.calls[0][1];
    const dummyAlarm = {
      userNickname: 'Alice',
      channelName: 'general',
      text: 'Test alarm',
    };
    handler(dummyAlarm);
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Alice #general',
      description: 'Test alarm',
    });
  });
});
