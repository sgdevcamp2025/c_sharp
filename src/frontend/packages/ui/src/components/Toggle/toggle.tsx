'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-medium text-muted ring-offset-background transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-primary [&_svg]:pointer-events-none [&_svg]:w-full [&_svg]:h-full [&_svg]:shrink-0 gap-2',
  {
    variants: {
      variant: {
        default: 'bg-toggle',
        outline: 'border border-input  hover:text-accent-foreground',
      },
      size: {
        default: 'w-10 h-10 p-3',
        lg: 'w-14 h-14 p-4',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
