export const ACTIONS = {
  TOGGLE_EDIT: 'TOGGLE_EDIT',
  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR',
} as const;

export const profileChangeReducer = (state: any, action: any) => {
  switch (action.type) {
    case ACTIONS.TOGGLE_EDIT:
      return { ...state, isEditMode: !state.isEditMode };
    case ACTIONS.SET_ERROR:
      return { ...state, isError: true };
    case ACTIONS.RESET_ERROR:
      return { ...state, isError: false };
  }
};
