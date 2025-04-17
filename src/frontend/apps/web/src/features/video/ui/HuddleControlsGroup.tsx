'use client';
import { useReducer } from 'react';
import {
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';

import { Button, ToggleGroup } from '@workspace/ui/components';
import { HUDDLE_CONTROLS, type HuddleControl } from '@/src/entities/video';

import HuddleControlItem from './HuddleControlItem';
import { huddleControlReducer } from '../model';

export const controlIconList = {
  [HUDDLE_CONTROLS.Mic]: { on: <Mic />, off: <MicOff /> },
  [HUDDLE_CONTROLS.Video]: { on: <Video />, off: <VideoOff /> },
  [HUDDLE_CONTROLS.Screen]: { on: <ScreenShare />, off: <ScreenShareOff /> },
} as const;

const HuddleControlsGroup = () => {
  const [controlGroupState, controlGroupDispatch] = useReducer(
    huddleControlReducer,
    {
      [HUDDLE_CONTROLS.Mic]: false,
      [HUDDLE_CONTROLS.Video]: false,
      [HUDDLE_CONTROLS.Screen]: false,
    },
  );

  return (
    <div className="flex justify-center items-center">
      <ToggleGroup
        variant="default"
        type="multiple"
        size="lg"
        className="gap-3"
      >
        {Object.entries(controlIconList).map(([key, component]) => {
          const controlKey = key as HuddleControl;
          return (
            <HuddleControlItem
              key={key}
              value={controlKey}
              dispatch={controlGroupDispatch}
            >
              {component[controlGroupState[controlKey] ? 'on' : 'off']}
            </HuddleControlItem>
          );
        })}

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
