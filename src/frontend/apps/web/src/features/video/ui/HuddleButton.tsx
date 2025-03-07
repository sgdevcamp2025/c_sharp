'use client';
import Link from 'next/link';
import { Headset } from 'lucide-react';

import { Button } from '@workspace/ui/components';

const HuddleButon = ({ stockSlug }: { stockSlug: string }) => {
  return (
    <Button
      variant="default"
      size="sm"
    >
      <Link
        href={`/stock/${stockSlug}/huddle`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Headset size={20} />
      </Link>
    </Button>
  );
};
export default HuddleButon;
