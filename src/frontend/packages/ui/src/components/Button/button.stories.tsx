import type { Meta, StoryObj } from '@storybook/react';
import { MessageCircle } from 'lucide-react';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Widget/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text', defaultValue: 'Button' },
    variant: {
      control: 'select',
      options: ['primary', 'destructive', 'outline', 'secondary', 'ghost', 'kakao'],
    },
    size: { control: 'radio', options: ['sm', 'lg', 'icon'] },
    asChild: { control: 'boolean' },
    onClick: { action: 'clicked', type: 'function' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;
// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Button',
  },
};
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
};
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};
export const Kakao: Story = {
  args: {
    variant: 'kakao',
    size: 'lg',
  },
  render: (args) => (
    <Button {...args}>
      <MessageCircle /> KaKao을(를) 사용하여 로그인
    </Button>
  ),
};

export const Icon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20 }}>
      <Button
        variant="outline"
        size="icon"
      >
        <MessageCircle />
      </Button>

      <Button
        variant="secondary"
        size="icon"
      >
        <MessageCircle />
      </Button>
    </div>
  ),
};
