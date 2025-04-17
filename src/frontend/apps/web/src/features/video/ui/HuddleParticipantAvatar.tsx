import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components';

const HuddleParticipantAvatar = () => {
  return (
    <Avatar
      variant="square"
      className="w-full h-full"
    >
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback className="bg-gray-300">user profile</AvatarFallback>
    </Avatar>
  );
};
export default HuddleParticipantAvatar;
