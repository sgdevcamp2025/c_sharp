'use client';
import { Button, ToggleGroup, ToggleGroupItem } from '@workspace/ui/components';
import {
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { useReducer, useState } from 'react';
import { huddleControlReducer } from '../model/huddle-controls-reducer';

const HuddleControlsGroup = () => {
  const [controlGroupState, controlGroupDispatch] = useReducer(
    huddleControlReducer,
    {
      mic: false,
      video: false,
      screen: false,
    },
  );
  const iconStyle = 'w-16 h-16';

  return (
    <div className="flex justify-center items-center">
      <ToggleGroup
        variant="default"
        type="multiple"
        size="lg"
        className="gap-3"
      >
        <ToggleGroupItem
          value="mic"
          onClick={() => controlGroupDispatch({ type: 'mic' })}
        >
          {controlGroupState.mic ? (
            <Mic className={iconStyle} />
          ) : (
            <MicOff className={iconStyle} />
          )}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="video"
          onClick={() => controlGroupDispatch({ type: 'video' })}
        >
          {controlGroupState.video ? <Video /> : <VideoOff />}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="screen"
          onClick={() => controlGroupDispatch({ type: 'screen' })}
        >
          {controlGroupState.screen ? <ScreenShare /> : <ScreenShareOff />}
        </ToggleGroupItem>
        <Button
          variant="destructive"
          size="lg"
          className="h-12 font-bold"
        >
          나가기
        </Button>
      </ToggleGroup>
    </div>
  );
};
export default HuddleControlsGroup;
