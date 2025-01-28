import { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from '../Label';
import { Button } from '../Button';

const meta: Meta<typeof Input> = {
  title: 'Widget/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', padding: '10px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Default input',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithLabel: Story = {
  args: {
    placeholder: 'Enter your name',
    disabled: false,
    id: 'name',
  },
  render: (args) => (
    <div className="flex w-full items-center space-x-2">
      <Label htmlFor={args.id}>Name</Label>
      <Input
        id={args.id}
        placeholder={args.placeholder}
        disabled={args.disabled}
      />
    </div>
  ),
};

export const Form: Story = {
  args: {
    placeholder: 'Enter your name',
    disabled: false,
    id: 'name',
  },
  render: (args) => (
    <div className="flex w-full items-center">
      <Label
        htmlFor={args.id}
        className="mr-3"
      >
        Name
      </Label>
      <Input
        id={args.id}
        placeholder={args.placeholder}
        disabled={args.disabled}
      />
      <Button
        variant="ghost"
        type="submit"
      >
        확인
      </Button>
    </div>
  ),
};
