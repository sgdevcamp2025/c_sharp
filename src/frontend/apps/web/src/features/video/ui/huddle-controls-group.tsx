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
import { useReducer } from 'react';
import HuddleControlItem from './huddle-control-item';
import { huddleControlReducer } from '../model';

const controlIconList = {
  mic: { on: <Mic />, off: <MicOff /> },
  video: { on: <Video />, off: <VideoOff /> },
  screen: { on: <ScreenShare />, off: <ScreenShareOff /> },
} as const;

const HuddleControlsGroup = () => {
  const [controlGroupState, controlGroupDispatch] = useReducer(
    huddleControlReducer,
    {
      mic: false,
      video: false,
      screen: false,
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
        {Object.entries(controlIconList).map(([key, component]) => (
          <HuddleControlItem
            key={key}
            value={key as keyof typeof controlIconList}
            dispatch={controlGroupDispatch}
          >
            {component[controlGroupState[key] ? 'on' : 'off']}
          </HuddleControlItem>
        ))}

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
