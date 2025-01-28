import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { Button } from '../Button';
import { useState } from 'react';

const meta: Meta<typeof Collapsible> = {
  title: 'Widget/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Title</h4>
          <CollapsibleTrigger asChild>
            <Button>Toggle</Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">Contents1</div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">Contents2</div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">Contents3</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};
