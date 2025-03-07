import { LogoutButton } from '@/src/features/auth';

import ProfilePicture from './ProfilePicture';
import ProfileNickname from './ProfileNickname';

const ProfilePopoverContent = () => {
  return (
    <div className="flex flex-col items-start space-y-4">
      <h4 className="font-semibold leading-none">My Account</h4>
      <div className="flex flex-col items-center space-y-4">
        <ProfilePicture />
        <ProfileNickname />
      </div>
      <LogoutButton />
    </div>
  );
};
export default ProfilePopoverContent;
