type HuddleControlsGroup = {
  mic: boolean;
  video: boolean;
  screen: boolean;
};
type HuddleControlAction = {
  type: 'mic' | 'video' | 'screen';
};

export const huddleControlReducer = (
  state: HuddleControlsGroup,
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
