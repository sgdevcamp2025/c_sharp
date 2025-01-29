import Link from 'next/link';
import { NextPage } from 'next';
import { Button } from '@workspace/ui/components';

const NotFound: NextPage = () => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <div>이 페이지는 존재하지 않습니다. 매인 페이지로 이동하세요.</div>
        <Button>
          <Link href="/">메인페이지로 이동하기</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
