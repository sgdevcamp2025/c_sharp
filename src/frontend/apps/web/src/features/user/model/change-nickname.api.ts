import { patchRequest } from '@/src/shared/services';

export const changeNickname = async (nickname: string) => {
  const { user } = await patchRequest<any, any>(
    'gateway',
    `/api/v1/user/profile/nickname=${nickname}`,
    {},
  );

  return user;
};
