import { Button } from '@workspace/ui/components';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button>
        <Link href="/stock">로그인버튼</Link>
      </Button>
    </div>
  );
}
