import React from 'react';
import { Meta, StoryObj, StoryFn } from '@storybook/react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './resizable';

export default {
  title: 'Widget/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} as Meta;

type Story = StoryObj<typeof ResizablePanelGroup>;

export const Default: Story = {
  render: () => (
    <div className="h-96 w-96 p-8">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel
          defaultSize={30}
          className="flex items-center justify-center bg-gray-200 p-4"
        >
          Stock Chart
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={10}
          className="flex items-center justify-center bg-gray-300 p-4"
        >
          Stock Details
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

const Template2: StoryFn = (args) => (
  <div className="h-96 w-96 p-8">
    <ResizablePanelGroup direction="horizontal" {...args}>
      <ResizablePanel
        defaultSize={100}
        className="flex items-center justify-center bg-gray-200 p-4"
      >
        Stock Chart
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={250}
        className="flex items-center justify-center bg-gray-300 p-4"
      >
        Stock Details
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

export const HorizontalWithHandle: Story = Template2.bind({});
HorizontalWithHandle.args = {
  className: 'border border-gray-400 rounded-md',
};
