import { StocksList } from '@/src/features/stock';
import { Button } from '@workspace/ui/components';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">
          <Link href="/tesla">Button</Link>
        </Button>
        <StocksList />
      </div>
    </div>
  );
}
