import * as React from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

const modalVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
  {
    variants: {
      size: {
        default: '[&>div]:max-w-lg',
        lg: '[&>div]:max-w-4xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  asChild?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      asChild = false,
      isOpen = false,
      onClose,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div';
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    React.useEffect(() => {
      if (!isOpen) return;

      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && onClose) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && onClose) {
        onClose();
      }
    };

    if (!mounted || !isOpen) return null;

    const modalContent = (
      <Comp
        ref={ref}
        className={cn(modalVariants({ size, className }))}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <div className="relative w-full bg-background rounded-lg shadow-lg">
          {children}
        </div>
      </Comp>
    );

    return createPortal(modalContent, document.body);
  },
);

Modal.displayName = 'Modal';

export { Modal, modalVariants };
