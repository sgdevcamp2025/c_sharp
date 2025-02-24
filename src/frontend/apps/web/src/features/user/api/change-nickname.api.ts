'use server';

import { User } from '@/src/entities';
import { patchRequest } from '@/src/shared/services';
import { setCookie } from '@/src/shared/services/lib';

type Response = User;
type Body = {
  nickname: string;
};

export const changeNickname = async (nickname: string) => {
  try {
    const user = await patchRequest<Response, Body>(
      'gateway',
      '/api/v1/user/profile',
      { nickname: nickname },
    );

    if (!user || !user.userId) {
      throw new Error('User not found');
    }

    setCookie('userId', user.userId);

    return user;
  } catch (err) {
    console.error(`닉네임 변경 실패 : ${err}`);
    throw err;
  }
};
