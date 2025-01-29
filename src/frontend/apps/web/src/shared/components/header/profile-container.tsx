import { Button } from '@workspace/ui/components';
import ProfilePicture from './profile-picture';
import Nickname from './nickname';

const ProfileContainer = () => {
  return (
    <div className="flex flex-col items-start space-y-4">
      <h4 className="font-semibold leading-none">My Account</h4>
      <div className="flex flex-col items-center space-y-4">
        <ProfilePicture />
        <Nickname />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
      >
        LOGOUT
      </Button>
    </div>
  );
};
export default ProfileContainer;
