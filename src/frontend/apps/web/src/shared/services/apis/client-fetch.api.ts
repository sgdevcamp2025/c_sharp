'use client';

import type {
  ApiServerType,
  FetchOptions,
  JsonValue,
} from '@/src/shared/services/models';
import { isomorphicFetch } from './ismorphic-fetch.api';

const getClientToken = (): string | undefined => {
  // const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
  // return match ? match[2] : undefined;
  return process.env.NEXT_PUBLIC_TEST_TOKEN;
};

export const clientFetchInstance = <TResponse, TBody = JsonValue>(
  serverType: ApiServerType,
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  options: FetchOptions<TBody> = {},
): Promise<TResponse> => {
  const token = getClientToken();
  return isomorphicFetch<TResponse, TBody>(
    serverType,
    url,
    method,
    options,
    token,
  );
};
