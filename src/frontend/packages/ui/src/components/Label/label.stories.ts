import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
const meta: Meta<typeof Label> = {
  title: 'Widget/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text', description: 'Label text' },
    htmlFor: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    htmlFor: 'name',
    children: '공작새',
  },
};
