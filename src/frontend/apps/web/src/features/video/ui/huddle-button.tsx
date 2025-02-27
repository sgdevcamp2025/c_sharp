'use client';

import { Button } from '@workspace/ui/components';
import { Headset } from 'lucide-react';
import Link from 'next/link';

const HuddleButon = ({ stockSlug }: { stockSlug: string }) => {
  return (
    <Button
      variant="default"
      size="sm"
    >
      <Link
        href={`/stock/huddle?${stockSlug}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Headset size={20} />
      </Link>
    </Button>
  );
};
export default HuddleButon;
