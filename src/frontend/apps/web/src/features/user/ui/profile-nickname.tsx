'use client';

import { useUserStore } from '@/src/entities';
import { Button, Input, Label } from '@workspace/ui/components';
import { Pencil } from 'lucide-react';

const ProfileNickname = () => {
  const isNameEditMode = false;
  const nickname = useUserStore((state) => state.user?.nickname ?? '');

  return (
    <div className="flex w-full  items-center space-x-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        disabled={!isNameEditMode}
        placeholder="Enter your name"
        value={nickname}
      />
      <Button
        variant="ghost"
        size="sm"
      >
        {isNameEditMode ? '저장' : <Pencil />}
      </Button>
    </div>
  );
};
export default ProfileNickname;
