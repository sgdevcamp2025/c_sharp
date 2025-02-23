'use server';

import { postRequest } from '@/src/shared/services';
import { AuthToken, User } from '@/src/entities';
import { setCookie } from '@/src/shared/services/lib';

type LoginRes = {
  user: User;
  token: AuthToken;
};
type LoginReq = {
  platform: string;
  redirectUri: string;
};

export const requestLogin = async (authorizationCode: string) => {
  const { user, token } = await postRequest<LoginRes, LoginReq>(
    'gateway',
    `/api/v1/user/login?authorizationCode=${authorizationCode}`,
    {
      platform: 'KAKAO',
      redirectUri: process.env.KAKAO_REDIRECT_URI,
    },
  );

  setCookie('userId', user.userId);
  setCookie('accessToken', token.accessToken);
  setCookie('refreshToken', token.refreshToken);

  return user;
};
