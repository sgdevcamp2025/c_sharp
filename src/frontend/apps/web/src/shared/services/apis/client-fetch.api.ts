'use client';

import type {
  ApiServerType,
  FetchOptions,
  JsonValue,
} from '@/src/shared/services/models';
import { getAccessTokenFromCookie } from '../lib';

import { Fetch } from './fetch.api';

const getClientToken = async (): Promise<string | undefined> => {
  const match = await getAccessTokenFromCookie();
  return match;
  // return process.env.NEXT_PUBLIC_TEST_TOKEN;
};

export const clientFetchInstance = async <TResponse, TBody = JsonValue>(
  serverType: ApiServerType,
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  options: FetchOptions<TBody> = {},
): Promise<TResponse> => {
  const token = await getClientToken();
  return Fetch<TResponse, TBody>(serverType, url, method, options, token);
};
