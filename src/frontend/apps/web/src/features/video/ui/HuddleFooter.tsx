import { MessageSquareText } from 'lucide-react';

import { Toggle } from '@workspace/ui/components';

import HuddleControlsGroup from './HuddleControlsGroup';

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
