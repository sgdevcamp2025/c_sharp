'use client';
import { Button, ToggleGroup } from '@workspace/ui/components';
import {
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { useReducer } from 'react';
import HuddleControlItem from './huddle-control-item';
import { HuddleControl, huddleControlReducer } from '../model';

export const controlIconList = {
  [HuddleControl.Mic]: { on: <Mic />, off: <MicOff /> },
  [HuddleControl.Video]: { on: <Video />, off: <VideoOff /> },
  [HuddleControl.Screen]: { on: <ScreenShare />, off: <ScreenShareOff /> },
} as const;

const HuddleControlsGroup = () => {
  const [controlGroupState, controlGroupDispatch] = useReducer(
    huddleControlReducer,
    {
      [HuddleControl.Mic]: false,
      [HuddleControl.Video]: false,
      [HuddleControl.Screen]: false,
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
