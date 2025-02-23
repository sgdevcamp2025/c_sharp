'use server';

import { cookies } from 'next/headers';
import type {
  ApiServerType,
  FetchOptions,
  JsonValue,
} from '@/src/shared/services/models';
import { isomorphicFetch } from './ismorphic-fetch.api';

export async function serverFetchInstance<TResponse, TBody = JsonValue>(
  serverType: ApiServerType,
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  const accessToken = cookies().get('accessToken')?.value;
  return isomorphicFetch<TResponse, TBody>(
    serverType,
    url,
    method,
    options,
    accessToken,
  );
}
