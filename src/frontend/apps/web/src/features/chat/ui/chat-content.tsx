import ContentText from './content-text';
import ContentAvatar from './content-avatar';

export type ChatContentProps = {
  type?: 'default' | 'live';
};

export type ChatContentWithAvatarsProps = ChatContentProps & {
  avatarUrls?: string[];
};

const ChatContent = ({ type = 'default', avatarUrls }: ChatContentWithAvatarsProps) => {
  const backgroundColor = type === 'live' ? 'bg-live' : 'bg-white';

  const hoverColor = type === 'default' ? 'hover:bg-chatboxHover' : '';

  return (
    <div className={`flex w-full h-auto ${backgroundColor} pb-2 pl-5 pt-5 pr-6 gap-4 group relative ${hoverColor} transition-all duration-300`}>
      <ContentAvatar type={type} />
      <ContentText
        type={type}
        avatarUrls={avatarUrls}
      />
    </div>
  );
};

export default ChatContent;
