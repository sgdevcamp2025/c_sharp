'use client';
import { useReducer, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

import { Button, Input, Label } from '@workspace/ui/components';

import { useUserStore } from '@/src/shared';

import { ACTIONS, profileChangeReducer } from '../model';
import { changeNickname } from '../api';

const ProfileNickname = () => {
  const nickname = useUserStore((state) => state.user?.nickname ?? '');
  const setUser = useUserStore((state) => state.setUser);

  const nameInput = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(profileChangeReducer, {
    isEditMode: false,
    isError: false,
  });

  const [errMsg, setErrMsg] = useState('');

  const handleNameEdit = async () => {
    if (state.isEditMode) {
      const newNickname = nameInput.current?.value?.trim() ?? nickname;

      if (!newNickname) {
        dispatch({ type: ACTIONS.SET_ERROR });
        setErrMsg('닉네임을 입력하세요.');
        return;
      }

      try {
        const user = await changeNickname(newNickname);
        setUser(user);
      } catch (err) {
        dispatch({ type: ACTIONS.SET_ERROR });
        setErrMsg(err.message || '닉네임 변경 실패');
        return;
      }
    }
    dispatch({ type: ACTIONS.TOGGLE_EDIT });
  };

  return (
    <div className="flex flex-col w-full">
      <div>
        <p className="text-red-500 text-xs font-medium animate-fade-in min-h-[20px] pb-1">
          {state.isError && `ERROR: ${errMsg}`}
        </p>
      </div>
      <div className="flex w-full justify-between items-center space-x-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          disabled={!state.isEditMode}
          variant={state.isError ? 'error' : 'default'}
          placeholder={'Enter your name'}
          ref={nameInput}
          defaultValue={nickname}
          onFocus={() => {
            setErrMsg('');
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
    </div>
  );
};
export default ProfileNickname;
