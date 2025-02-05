import { Button, Toggle } from '@workspace/ui/components';
import HuddleControlsGroup from './huddle-controls-group';
import { MessageSquareText } from 'lucide-react';

const HuddleFooter = () => {
  return (
    <div className="relative w-full h-full min-w-0 min-h-0 flex flex-row justify-center items-center">
      <HuddleControlsGroup />
      <Toggle
        variant="default"
        size="lg"
        className="absolute right-0"
      >
        <MessageSquareText />
      </Toggle>
    </div>
  );
};
export default HuddleFooter;
