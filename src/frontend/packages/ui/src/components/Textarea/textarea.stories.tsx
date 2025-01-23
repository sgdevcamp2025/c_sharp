import { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

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
