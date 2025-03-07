import HuddleParticipantAvatar from './HuddleParticipantAvatar';

const HuddleParticipantCard = () => {
  // 참여자 카메라 화면 또는 아바타가 보여질 예정
  return (
    <div className="h-[45%] aspect-square rounded-md overflow-hidden">
      <HuddleParticipantAvatar />
    </div>
  );
};
export default HuddleParticipantCard;
