'use client';

import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  const autoResizeTextarea = () => {
    const textarea = document.querySelector('textarea');

    if (textarea) {
      textarea.style.height = 'auto';
      const height = textarea.scrollHeight;
      textarea.style.height = `${height + 8}px`;
    }
  };

  return (
    <textarea
      className={cn(
        'flex min-h-[80px] h-auto w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      maxLength={2000}
      onKeyDown={autoResizeTextarea}
      onKeyUp={autoResizeTextarea}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
