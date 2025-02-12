import type { Meta, StoryObj } from '@storybook/react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Button } from '../Button';

const meta: Meta<typeof Sheet> = {
  title: 'Widget/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetHeader>
        content
        <SheetFooter>
          <SheetClose>CLOSE</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
