'use client';

import { RedirectContent } from '@/src/features/auth/ui';
import { Suspense } from 'react';

export default function RedirectPage() {
  return (
    <Suspense>
      <RedirectContent />
    </Suspense>
  );
}
