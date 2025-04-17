import { SidebarTrigger } from '@workspace/ui/components';

import { HuddleButton } from '@/src/features/video';

import ChatHeader from './ChatHeader';

const ChatSectionHeader = ({ stockSlug }: { stockSlug: string }) => {
  return (
    <ChatHeader>
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="font-semibold">{stockSlug}</span>
      </div>
      <div className="flex items-center gap-2">
        <HuddleButton stockSlug={stockSlug} />
      </div>
    </ChatHeader>
  );
};

export default ChatSectionHeader;
