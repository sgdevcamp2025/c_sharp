import { Button, SidebarTrigger } from '@workspace/ui/components';
import Header from './header';
import HuddleButon from '../../video/ui/huddle-button';

const ChatHeader = ({ stockSlug }: { stockSlug: string }) => {
  return (
    <Header>
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="font-semibold">{stockSlug}</span>
      </div>
      <div className="flex items-center gap-2">
        <HuddleButon stockSlug={stockSlug} />
      </div>
    </Header>
  );
};

export default ChatHeader;
