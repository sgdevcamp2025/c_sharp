import HuddleParticipant from './huddle-participant';

const HuddleContent = () => {
  return (
    <div className="w-full h-full min-h-0 overflow-hidden p-3 bg-muted rounded-lg flex flex-row flex-wrap justify-around items-center gap-1 overflow-y-auto">
      <HuddleParticipant />
      <HuddleParticipant />
      <HuddleParticipant />
      <HuddleParticipant />
    </div>
  );
};
export default HuddleContent;
