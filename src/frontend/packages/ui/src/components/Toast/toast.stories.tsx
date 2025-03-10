import { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, ToastAction } from './toast';

import { Toaster } from './toaster';
import { Button } from '../Button';
import { useToast } from '@workspace/ui/hooks/Toast/use-toast';

const meta: Meta<typeof Toaster> = {
  title: 'Widget/Toaster',
  component: Toaster,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <ToastProvider>
          <Story />
          <Toaster />
        </ToastProvider>
      </>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Toaster>;

const DefaultTemplate = () => {
  const { toast } = useToast();

  return (
    <div className="w-full h-96 flex items-center justify-center">
      <Button
        onClick={() =>
          toast({
            title: 'Success',
            description: 'Your action was successful!',
          })
        }
      >
        Show Toast
      </Button>
    </div>
  );
};

export const Default: Story = DefaultTemplate.bind({});
Default.args = {};

const DestructiveTemplate = () => {
  const { toast } = useToast();

  return (
    <div className="w-full h-96 flex items-center justify-center">
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
        }
      >
        Show Destructive Toast
      </Button>
    </div>
  );
};

export const Destructive: Story = DestructiveTemplate.bind({});
Destructive.args = {};
