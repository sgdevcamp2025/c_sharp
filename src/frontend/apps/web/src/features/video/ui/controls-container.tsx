import { Button, Toggle } from '@workspace/ui/components';
import HuddleControls from './huddle-controls';
import { MessageSquareText } from 'lucide-react';
const ControlsContainer = () => {
  return (
    <div className="relative w-full h-full min-w-0 min-h-0 flex flex-row justify-center items-center">
      <HuddleControls />
      <Toggle
        size="default"
        variant="outline"
        className="absolute right-0"
      >
        <MessageSquareText />
      </Toggle>
    </div>
  );
};
export default ControlsContainer;
