'use server';

import { cookies } from 'next/headers';
import type {
  ApiServerType,
  FetchOptions,
  JsonValue,
} from '@/src/shared/services/models';
import { Fetch } from './fetch.api';

export async function serverFetchInstance<TResponse, TBody = JsonValue>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  const accessToken = cookies().get('accessToken')?.value;
  return Fetch<TResponse, TBody>(url, method, options, accessToken);
}
