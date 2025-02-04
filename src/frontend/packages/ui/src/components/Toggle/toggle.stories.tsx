import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './toggle';
import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof Toggle> = {
  title: 'Widget/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'radio',
      options: ['default', 'lg'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

const MicButton = ({
  variant = 'outline',
  size = 'default',
}: {
  variant?: 'default' | 'outline';
  size?: 'default' | 'lg';
}) => {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <Toggle
      pressed={isPressed}
      onPressedChange={setIsPressed}
      variant={variant}
      size={size}
      className="bg-gray-100 border-black-100"
    >
      {isPressed ? <Mic /> : <MicOff />}
    </Toggle>
  );
};

export const Default: Story = {
  args: {
    variant: 'outline',
    size: 'default',
  },
  render: (args) => <MicButton {...args} />,
};

export const LargeButton: Story = {
  args: {
    variant: 'default',
    size: 'lg',
  },
  render: (args) => <MicButton {...args} />,
};
