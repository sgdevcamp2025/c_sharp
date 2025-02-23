import { cookies } from 'next/headers';

const cookieOptions = {
  secure: process.env.MODE === 'production',
};

export function setCookie(key: string, value: string | number) {
  const storedValue = typeof value === 'string' ? value : String(value);
  cookies().set(key, storedValue, cookieOptions);
}

export function getCookie(key: string) {
  return cookies().get(key)?.value || null;
}

export function removeCookie(key: string) {
  cookies().delete(key);
}
