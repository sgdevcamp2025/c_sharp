import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal';
import { Button } from '../Button';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Widget/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'lg'],
      description: 'Sets the size of the modal',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to merge props onto child element',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal should close',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWithToggle = ({
  size,
  className,
}: {
  size?: 'default' | 'lg';
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        size={size}
        className={className}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Modal Title</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
          <div className="py-4">
            <p>
              This is a modal component rendered with createPortal.
              {size === 'lg' ? ' This is a large variant.' : ''}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// 기본 모달 Story
export const Default: Story = {
  render: () => <ModalWithToggle />,
};

// 큰 사이즈 모달 Story
export const Large: Story = {
  render: () => <ModalWithToggle size="lg" />,
};
