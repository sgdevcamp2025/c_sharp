// src/features/user/model/profileChangeReducer.test.ts
import { describe, it, expect } from 'vitest';
import { ACTIONS, profileChangeReducer } from './profileChangeReducer';

// 초기 상태 정의
const initialState = {
  isEditMode: false,
  isError: false,
};

// 상태와 액션 타입 정의
interface ProfileState {
  isEditMode: boolean;
  isError: boolean;
}

interface ProfileAction {
  type: keyof typeof ACTIONS;
}

describe('profileChangeReducer', () => {
  it('should toggle isEditMode from false to true with TOGGLE_EDIT action', () => {
    const action: ProfileAction = { type: ACTIONS.TOGGLE_EDIT };
    const newState = profileChangeReducer(initialState, action);
    expect(newState).toEqual({
      isEditMode: true,
      isError: false,
    });
  });

  it('should toggle isEditMode from true to false with TOGGLE_EDIT action', () => {
    const state: ProfileState = { isEditMode: true, isError: false };
    const action: ProfileAction = { type: ACTIONS.TOGGLE_EDIT };
    const newState = profileChangeReducer(state, action);
    expect(newState).toEqual({
      isEditMode: false,
      isError: false,
    });
  });

  it('should set isError to true with SET_ERROR action', () => {
    const action: ProfileAction = { type: ACTIONS.SET_ERROR };
    const newState = profileChangeReducer(initialState, action);
    expect(newState).toEqual({
      isEditMode: false,
      isError: true,
    });
  });

  it('should reset isError to false with RESET_ERROR action', () => {
    const state: ProfileState = { isEditMode: false, isError: true };
    const action: ProfileAction = { type: ACTIONS.RESET_ERROR };
    const newState = profileChangeReducer(state, action);
    expect(newState).toEqual({
      isEditMode: false,
      isError: false,
    });
  });

  it('should preserve other state properties when toggling isEditMode', () => {
    const state: ProfileState = { isEditMode: false, isError: true };
    const action: ProfileAction = { type: ACTIONS.TOGGLE_EDIT };
    const newState = profileChangeReducer(state, action);
    expect(newState).toEqual({
      isEditMode: true,
      isError: true,
    });
  });

  it('should preserve other state properties when setting isError', () => {
    const state: ProfileState = { isEditMode: true, isError: false };
    const action: ProfileAction = { type: ACTIONS.SET_ERROR };
    const newState = profileChangeReducer(state, action);
    expect(newState).toEqual({
      isEditMode: true,
      isError: true,
    });
  });

  it('should return the same state for an unknown action type', () => {
    const state: ProfileState = { isEditMode: true, isError: true };
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = profileChangeReducer(state, action);
    expect(newState).toEqual(state);
  });
});
