import { Button } from '@workspace/ui/components';

const ProfileContainer = () => {
  return (
    <div className="flex flex-col items-start space-y-4">
      <h4 className="font-semibold leading-none">My Account</h4>
      {/* 프로필사진관리 */}
      {/* 닉네임 관리 */}
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
