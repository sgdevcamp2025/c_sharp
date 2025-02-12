import { type HuddleControl } from './huddle-control.type';

export type HuddleControlsState = {
  [HuddleControl.Mic]: boolean;
  [HuddleControl.Video]: boolean;
  [HuddleControl.Screen]: boolean;
};

export type HuddleControlAction = {
  type: HuddleControl;
};

export const huddleControlReducer = (
  state: HuddleControlsState,
  action: HuddleControlAction,
) => ({ ...state, [action.type]: !state[action.type] });
