'use server';
import { cookies } from 'next/headers';

const cookieOptions = {
  secure: process.env.MODE === 'production',
};

export async function setCookie(key: string, value: string | number) {
  const storedValue = typeof value === 'string' ? value : String(value);
  (await cookies()).set(key, storedValue, cookieOptions);
}

export async function getCookie(key: string) {
  const allCookies = await cookies();
  return allCookies.get(key)?.value || null;
}

export async function removeCookie(key: string) {
  (await cookies()).delete(key);
}
