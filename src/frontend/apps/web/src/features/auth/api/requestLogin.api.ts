'use server';

import { User, AuthToken } from '@/src/entities';
import { postRequest, setCookie } from '@/src/shared';

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
