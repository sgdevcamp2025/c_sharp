import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Widget/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full bg-gray-100" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] bg-gray-100" />
        <Skeleton className="h-4 w-[200px] bg-gray-100" />
      </div>
    </div>
  ),
};
