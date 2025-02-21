import { Loader2 } from 'lucide-react';
import { useLoginRedirect } from '../model/use-login-redirect';

const RedirectContent = () => {
  useLoginRedirect();

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};
export default RedirectContent;
