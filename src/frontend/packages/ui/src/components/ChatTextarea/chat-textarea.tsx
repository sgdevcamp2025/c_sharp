'use client';

import { Textarea } from '../Textarea';
import { Button } from '../Button';

import { cn } from '@workspace/ui/lib/utils';

const ChatTextarea = ({ onSend, onAdd }) => {
  return (
    <div className={cn('flex flex-col items-center w-full rounded-md')}>
      <Textarea placeholder="Type your message..." />
      <div className="flex justify-between w-full">
        <Button onClick={onAdd} size="icon">
          +
        </Button>
        <Button onClick={onSend} size="sm">
          Send
        </Button>
      </div>
    </div>
  );
};
ChatTextarea.displayName = 'ChatTextarea';

export { ChatTextarea };
