import { patchRequest } from '@/src/shared/services';
import { setCookie } from '@/src/shared/services/lib';

export const changeNickname = async (nickname: string) => {
  try {
    const { user } = await patchRequest<any, any>(
      'gateway',
      `/api/v1/user/profile/nickname=${nickname}`,
      {},
    );

    if (!user || !user.id) {
      throw new Error('User not found');
    }

    setCookie('userId', user.id);

    return user;
  } catch (err) {
    console.error(`닉네임 변경 실패 : ${err}`);
    throw err;
  }
};
