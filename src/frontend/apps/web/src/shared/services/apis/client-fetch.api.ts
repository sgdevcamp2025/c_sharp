'use client';

import type { FetchOptions, JsonValue } from '@/src/shared/services/models';

import { Fetch } from './fetch.api';

export const getClientToken = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('/api/auth/token', { credentials: 'include' }); // API 호출
    const data = await response.json();
    return data.token || undefined;
  } catch (error) {
    console.error('Failed to fetch token:', error);
    return undefined;
  }
};

export const clientFetchInstance = async <TResponse, TBody = JsonValue>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  options: FetchOptions<TBody> = {},
): Promise<TResponse> => {
  const token = await getClientToken();
  return Fetch<TResponse, TBody>(url, method, options, token);
};
