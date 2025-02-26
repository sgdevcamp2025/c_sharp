'use client';

import { Button } from '@workspace/ui/components';
import { useLogout } from '../model/use-logout';

const LogoutButton = () => {
  const handleLogout = useLogout();
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full text-xs"
      onClick={handleLogout}
    >
      LOGOUT
    </Button>
  );
};
export default LogoutButton;
