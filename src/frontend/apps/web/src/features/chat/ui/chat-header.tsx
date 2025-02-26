import { Button, SidebarTrigger } from '@workspace/ui/components';
import { Headset } from 'lucide-react';
import Header from './header';
import Link from 'next/link';

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
          <Link
            href={'/stock/huddle'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Headset size={20} />
          </Link>
        </Button>
      </div>
    </Header>
  );
};

export default ChatHeader;
