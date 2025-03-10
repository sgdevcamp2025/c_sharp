import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { Input } from '../Input';
import { Label } from '../Label';
import { Button } from '../Button';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta: Meta<typeof Popover> = {
  title: 'Widget/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Popover>;

const Template: StoryFn = (args) => (
  <Popover>
    <PopoverTrigger asChild>
      <Avatar
        variant="default"
        className="cursor-pointer"
      >
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>Avatar</AvatarFallback>
      </Avatar>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      className="w-72 "
    >
      {args.children}
    </PopoverContent>
  </Popover>
);

export const Default: Story = Template.bind({});
Default.args = {
  children: (
    <div className="flex flex-col items-start space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
      >
        LOGOUT
      </Button>
      <Avatar
        variant="default"
        className="w-full h-full"
      >
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>Avatar</AvatarFallback>
      </Avatar>
      <div className="w-full flex flex-col space-y-2 items-end">
        <div className="flex w-full items-center space-x-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            disabled={true}
            placeholder="Enter your name"
            value={'공작새'}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  ),
};

export const EditMode: Story = Template.bind({});
EditMode.args = {
  children: (
    <div className="flex flex-col space-y-4 items-end">
      <div className="flex w-full items-center space-x-2">
        <Label htmlFor="profile">Profile</Label>
        <Input
          id="profile"
          disabled={false}
          placeholder="Enter your profile url"
          type="file"
        />
      </div>
      <div className="flex w-full items-center space-x-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          disabled={false}
          placeholder="Enter your name"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
      >
        SAVE
      </Button>
    </div>
  ),
};
