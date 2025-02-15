'use client';

import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';
import { handleShiftEnterIndent } from '@workspace/ui/lib/handle-shiftenter-indent.util';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithRef<'textarea'>
>(({ className, onKeyDown, ...props }, ref) => {
  const autoResizeTextarea = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      const height = textarea.scrollHeight;
      textarea.style.height = `${height + 8}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
      } else {
        handleShiftEnterIndent(e, autoResizeTextarea);
      }
    }

    onKeyDown?.(e);
    autoResizeTextarea();
  };

  return (
    <textarea
      className={cn(
        'flex min-h-[64px] max-h-[388px] resize-none h-auto w-full rounded-md bg-white px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      maxLength={2000}
      onKeyDown={handleKeyDown}
      onKeyUp={autoResizeTextarea}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
