import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
const meta: Meta<typeof Tooltip> = {
  title: 'Widget/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>Hover Here</TooltipTrigger>
        <TooltipContent>Add to Tip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
