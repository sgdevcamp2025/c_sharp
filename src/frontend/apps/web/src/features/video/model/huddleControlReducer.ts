import { HUDDLE_CONTROLS, type HuddleControl } from '@/src/entities/video';

export type HuddleControlsState = {
  [HUDDLE_CONTROLS.Mic]: boolean;
  [HUDDLE_CONTROLS.Video]: boolean;
  [HUDDLE_CONTROLS.Screen]: boolean;
};

export type HuddleControlAction = {
  type: HuddleControl;
};

export const huddleControlReducer = (
  state: HuddleControlsState,
  action: HuddleControlAction,
) => ({ ...state, [action.type]: !state[action.type] });
