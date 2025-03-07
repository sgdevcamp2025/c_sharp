'use server';

import { cookies } from 'next/headers';

export const getUserIdFromCookie = async () => {
  const cookieStore = cookies();
  return Number(cookieStore.get('userId')?.value || '0');
};
