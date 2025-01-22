import type { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
const meta: Meta<typeof Avatar> = {
  title: 'Widget/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Fallback Message',
    },
    variant: {
      control: 'select',
      options: ['default', 'square'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

const Template: StoryFn<typeof Avatar> = (args) => (
  <Avatar {...args}>
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>{args.children}</AvatarFallback>
  </Avatar>
);

export const Default: Story = Template.bind({});
Default.args = {
  variant: 'default',
  children: 'Avatar',
};

export const Logo: Story = Template.bind({});
Logo.args = {
  variant: 'square',
  children: 'Logo',
};
