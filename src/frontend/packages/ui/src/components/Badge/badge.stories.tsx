import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
const meta: Meta<typeof Badge> = {
  title: 'Widget/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text', defaultValue: 'Badge' },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline'],
    },
    size: {
      control: 'radio',
      options: ['default', 'sm'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Badge',
  },
};
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Badge',
  },
};
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Badge',
  },
};
export const Date: Story = {
  args: {
    variant: 'secondary',
    size: 'default',
    children: '0월 0일 0요일',
  },
};
export const Live: Story = {
  args: {
    variant: 'default',
    size: 'sm',
    children: '라이브',
  },
};
