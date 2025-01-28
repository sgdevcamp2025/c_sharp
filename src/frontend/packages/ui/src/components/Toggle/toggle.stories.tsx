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

export const Default: Story = {
  args: {
    variant: 'outline',
    size: 'default',
  },
  render: (args) => {
    const [isPressed, setIsPressed] = useState(false);
    return (
      <Toggle
        {...args}
        pressed={isPressed}
        onPressedChange={setIsPressed}
      >
        {isPressed ? <Mic /> : <MicOff />}
      </Toggle>
    );
  },
};
