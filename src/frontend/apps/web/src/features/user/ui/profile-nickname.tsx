'use client';

import { useUserStore } from '@/src/entities';
import { Button, Input, Label } from '@workspace/ui/components';
import { Pencil } from 'lucide-react';
import { useReducer, useRef } from 'react';
import { ACTIONS, profileChangeReducer } from '../model/profile-change-reducer';

const ProfileNickname = () => {
  const nickname = useUserStore((state) => state.user?.nickname ?? '');

  const nameInput = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(profileChangeReducer, {
    isEditMode: false,
    isError: false,
  });

  const handleNameEdit = async () => {
    if (state.isEditMode) {
      const newNickname = nameInput.current?.value?.trim() ?? nickname;

      if (!newNickname) {
        dispatch({ type: ACTIONS.SET_ERROR });
        return;
      }

      if (newNickname !== nickname) {
        //api호출
      }
    }
    dispatch({ type: ACTIONS.TOGGLE_EDIT });
  };

  return (
    <div className="flex w-full  items-center space-x-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        disabled={!state.isEditMode}
        variant={state.isError ? 'error' : 'default'}
        placeholder="Enter your name"
        ref={nameInput}
        defaultValue={nickname}
        onFocus={() => {
          dispatch({ type: ACTIONS.RESET_ERROR });
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNameEdit}
      >
        {state.isEditMode ? '저장' : <Pencil />}
      </Button>
    </div>
  );
};
export default ProfileNickname;
