import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ChatTextarea } from './chat-textarea';

const meta: Meta<typeof ChatTextarea> = {
  title: 'Widget/ChatTextarea',
  component: ChatTextarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSend: { action: 'Send button clicked' },
    onAdd: { action: 'Add button clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof ChatTextarea>;

export const Default: Story = {
  args: {
    onSend: action('Send button clicked'),
    onAdd: action('Add button clicked'),
  },
  render: () => (
    <div className="flex flex-wrap w-96">
      <ChatTextarea
        onSend={action('Send')}
        onAdd={action('Add')}
      />
    </div>
  ),
};
