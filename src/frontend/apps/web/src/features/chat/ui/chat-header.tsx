import { Button, SidebarTrigger } from '@workspace/ui/components';
import { Headset } from 'lucide-react';
import Header from './header';

const ChatHeader = ({ stockSlug }: { stockSlug: string }) => {
  return (
    <Header>
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="font-semibold">{stockSlug}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
        >
          <Headset size={20} />
        </Button>
      </div>
    </Header>
  );
};

export default ChatHeader;
