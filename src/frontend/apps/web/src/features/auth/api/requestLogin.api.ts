'use server';

import { postRequest } from '@/src/shared/services';
import { cookies } from 'next/headers';
import { AuthToken, User } from '@/src/entities';

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

  const cookieOptions = {
    secure: process.env.MODE === 'production',
  };
  cookies().set('userId', String(user.userId), cookieOptions);
  cookies().set('accessToken', token.accessToken, cookieOptions);
  cookies().set('refreshToken', token.refreshToken, cookieOptions);

  return user;
};
