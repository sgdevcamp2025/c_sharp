import { Headphones } from 'lucide-react';

import HuddleContent from './HuddleSection';
import ControlsContainer from './HuddleFooter';
import { useHuddleConnect } from '../model/useHuddleConnect';

const HuddleContainer = () => {
  const huddleProps = useHuddleConnect();
  return (
    <div className="bg-primary w-full h-full flex flex-col gap-1 px-2 py-1">
      <h3 className="flex flex-row text-white gap-2">
        <Headphones /> slack-전체에서의 허들 1명
      </h3>
      <div className="min-h-0 h-[90%]">
        <HuddleContent huddleProps={huddleProps} />
      </div>
      <div className="min-h-0 h-[10%]">
        <ControlsContainer huddleProps={huddleProps} />
      </div>
    </div>
  );
};
export default HuddleContainer;
