'use server';

import { cookies } from 'next/headers';

export const getAccessTokenFromCookie = async () => {
  const cookieStore = cookies();
  return (await cookieStore).get('accessToken')?.value || '0';
};
