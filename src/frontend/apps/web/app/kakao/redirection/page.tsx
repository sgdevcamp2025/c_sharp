'use client';

import { useLoginRedirect } from '@/src/features/auth';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  useLoginRedirect();

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
