import { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Button } from '../Button';

const meta: Meta<typeof Textarea> = {
  title: 'Widget/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    decorators: [
      (Story) => (
        <div style={{ width: '600px', padding: '10px' }}>
          <Story />
        </div>
      ),
    ],
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Default textarea',
  },
  render: (args) => (
    <div className="flex w-96 flex-wrap">
      <Textarea {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
  render: (args) => (
    <div className="flex w-96 flex-wrap">
      <Textarea {...args} />
    </div>
  ),
};

export const ChatTextarea: Story = {
  render: () => {
    const handleAddClick = () => alert('Add clicked');
    const handleSendClick = () => alert('Send clicked');

    return (
      <div className="flex w-96 flex-wrap">
        <div className="flex flex-col items-center w-full rounded-md border bg-secondary border-gray-300 p-2">
          <Textarea placeholder="Type your message..." />
          <div className="flex justify-between w-full px-2 pt-2">
            <Button
              onClick={handleAddClick}
              size="sm"
              variant="outline"
            >
              +
            </Button>
            <Button
              onClick={handleSendClick}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  },
};
