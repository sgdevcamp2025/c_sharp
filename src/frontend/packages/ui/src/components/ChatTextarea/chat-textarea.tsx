'use client';

import { Textarea } from '../Textarea';
import { Button } from '../Button';

import { cn } from '@workspace/ui/lib/utils';

const ChatTextarea = ({ onSend, onAdd }) => {
  return (
    <div className={cn('flex flex-col items-center w-full rounded-md border bg-secondary border-gray-300 p-2')}>
      <Textarea placeholder="Type your message..." />
      <div className="flex justify-between w-full px-2 pt-2">
        <Button
          onClick={onAdd}
          size="sm"
          variant="outline"
        >
          +
        </Button>
        <Button
          onClick={onSend}
          size="sm"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
ChatTextarea.displayName = 'ChatTextarea';

export { ChatTextarea };
