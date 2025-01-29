'use client';

import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
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
        'flex min-h-[128px] h-auto w-full rounded-md bg-white px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
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
