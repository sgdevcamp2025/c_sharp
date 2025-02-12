export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type FetchOptions<TBody = JsonValue> = Omit<RequestInit, 'body'> & {
  body?: TBody;
  params?: Record<string, string>;
  cache?: RequestCache;
  tags?: string[];
  revalidate?: number;
  includeAuthToken?: boolean;
};

export type ApiResponse<T> = {
  code: string;
  message: string;
  data?: T;
};

export type ApiErrorResponse = Omit<ApiResponse<never>, 'data'>;

export const API_SERVER_TYPES = {
  gateway: 'gateway',
  auth: 'auth',
  stock: 'stock',
  file: 'file',
  chat1: 'chat1',
  chat2: 'chat2',
  history: 'history',
  workspace: 'workspace',
  push: 'push',
  state: 'state',
  signaling: 'signaling',
} as const;

/**
 * API 서버 타입을 유추하도록 타입 생성
 */
export type ApiServerType = keyof typeof API_SERVER_TYPES;
