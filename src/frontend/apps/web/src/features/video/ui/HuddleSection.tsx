import { HuddleProps } from '../model/huddle.type';
import HuddleParticipant from './HuddleParticipantCard';

const HuddleSection = ({ huddleProps }: { huddleProps: HuddleProps }) => {
  return (
    <div className="w-full h-full min-h-0 overflow-hidden p-3 bg-muted rounded-lg flex flex-row flex-wrap justify-center items-center gap-5 overflow-y-auto">
      <HuddleParticipant />
      <HuddleParticipant />
      {/* <HuddleParticipant />
      <HuddleParticipant /> */}
    </div>
  );
};
export default HuddleSection;
