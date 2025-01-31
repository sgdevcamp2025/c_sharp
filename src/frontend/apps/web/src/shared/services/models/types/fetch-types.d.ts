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
  withToken?: boolean;
};

export type ApiResponse<T> = {
  code: string;
  message: string;
  data?: T;
};

export type ApiErrorResponse = Omit<ApiResponse<never>, 'data'>;
