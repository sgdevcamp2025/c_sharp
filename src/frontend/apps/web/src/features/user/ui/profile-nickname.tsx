'use client';

import { useUserStore } from '@/src/entities';
import { Button, Input, Label } from '@workspace/ui/components';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

const ProfileNickname = () => {
  const nickname = useUserStore((state) => state.user?.nickname ?? '');

  const [isNameEditMode, setIsNameEditMode] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname);
  const [isError, setIsError] = useState(false);

  const handleNameEdit = async () => {
    if (isNameEditMode) {
      console.log('changing..');
      console.log(newNickname);
      if (newNickname === nickname) {
        setIsNameEditMode((prev) => !prev);
        return;
      }
      if (!newNickname.trim()) {
        console.log('빈값에러');
        setIsError(true);
        return;
      }
    }
    setIsNameEditMode((prev) => !prev);
  };

  return (
    <div className="flex w-full  items-center space-x-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        disabled={!isNameEditMode}
        variant={isError ? 'error' : 'default'}
        placeholder="Enter your name"
        value={newNickname}
        onChange={(e) => setNewNickname(e.target.value)}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNameEdit}
      >
        {isNameEditMode ? '저장' : <Pencil />}
      </Button>
    </div>
  );
};
export default ProfileNickname;
