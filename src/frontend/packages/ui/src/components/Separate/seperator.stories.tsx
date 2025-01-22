import { StoryObj, Meta } from '@storybook/react/*';
import { Separator } from './separator';
import { Badge } from '../Badge';

const meta: Meta = {
  title: 'Widget/Separator',
  component: Separator,
  parameters: {
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => <Separator />,
};

export const HuddleSeparator: Story = {
  render: () => (
    <div className="flex items-center space-x-2 w-96">
      <span className="text-sm whitespace-nowrap flex-shrink-0">
        4개의 댓글
      </span>
      <Separator />
    </div>
  ),
};

export const ChatSeparator: Story = {
  render: () => (
    <div className="flex items-center space-x-2 w-96">
      <Separator />
      <Badge
        size="default"
        variant="secondary"
        className='whitespace-nowrap flex-shrink-0"'
      >
        0월 0일 0요일
      </Badge>
      <Separator />
    </div>
  ),
};
