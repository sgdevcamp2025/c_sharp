import { type HuddleControl } from './huddle-control.type';

export type HuddleControlAction = {
  type: HuddleControl;
};

export const huddleControlReducer = (
  state: Record<HuddleControl, boolean>,
  action: HuddleControlAction,
) => {
  switch (action.type) {
    case 'mic':
      return { ...state, mic: !state.mic };
    case 'video':
      return { ...state, video: !state.video };
    case 'screen':
      return { ...state, screen: !state.screen };
  }
};
