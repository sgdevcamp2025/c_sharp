'use client';

import { Button, Input, Label } from '@workspace/ui/components';
import { Pencil } from 'lucide-react';

const Nickname = () => {
  //임시변수
  const isNameEditMode = false;
  const name = '공작새';

  return (
    <div className="flex w-full  items-center space-x-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        disabled={!isNameEditMode}
        placeholder="Enter your name"
        value={name}
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
export default Nickname;
