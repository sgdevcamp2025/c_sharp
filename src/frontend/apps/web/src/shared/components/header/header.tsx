'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components';
import Link from 'next/link';

//로고 이미지 경로 변경 필요
const Header = ({ authContent }: { authContent: React.ReactNode }) => {
  return (
    <>
      <Link href="/stock">
        <Avatar variant="square">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="text-primary font-bold">
            주톡피아
          </AvatarFallback>
        </Avatar>
      </Link>
      {authContent}
    </>
  );
};

export default Header;
