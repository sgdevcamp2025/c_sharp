import { RefObject } from 'react';

export type HuddleProps = {
  userId: number;
  setUserId: (value: number) => void;

  channelId: number;
  setChannelId: (value: number) => void;

  isSetupConfirmed: boolean;
  setIsSetupConfirmed: (value: boolean) => void;

  joinRoom: () => void;
  leaveRoom: () => void;

  localVideoRef: RefObject<HTMLVideoElement>;
  videoRefs: RefObject<{ [key: string]: HTMLVideoElement | null }>;
};
