'use client';

import { Textarea } from '../Textarea';
import { Button } from '../Button';

import { cn } from '@workspace/ui/lib/utils';

const ChatTextarea = ({ onSend, onAdd }) => {
  return (
    <div className={cn('flex flex-col items-center w-full rounded-md border bg-white border-gray-300 px-0.5 py-1')}>
      <Textarea placeholder="Type your message..." />
      <div className="flex justify-between w-full px-1">
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
