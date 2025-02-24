// isomorphicFetch.ts
import type {
  FetchOptions,
  JsonValue,
  HttpMethod,
  ApiResponse,
  ApiErrorResponse,
  ApiServerType,
} from '@/src/shared/services/models';
import { getBaseUrl } from '@/src/shared/services/lib/utils';
import { ERROR_MESSAGES } from '@/src/shared/services/models';

export async function isomorphicFetch<TResponse, TBody = JsonValue>(
  serverType: ApiServerType,
  url: string,
  method: HttpMethod,
  options: FetchOptions<TBody> = {},
  token?: string,
): Promise<TResponse> {
  const {
    body,
    params,
    cache,
    tags,
    revalidate,
    includeAuthToken = true,
    ...restOptions
  } = options;
  const BASE_URL = getBaseUrl(serverType);
  const queryParams = params
    ? `?${new URLSearchParams(params).toString()}`
    : '';
  const finalUrl = `${BASE_URL}${url}${queryParams}`;

  const finalHeaders: Record<string, string> = {
    ...(includeAuthToken && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body && !(body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(restOptions.headers as Record<string, string>),
  };

  const finalOptions: RequestInit = {
    method,
    ...restOptions,
    headers: finalHeaders,
    ...(cache && { cache }),
    ...(revalidate && { next: { revalidate } }),
    ...(tags && { next: { tags } }),
  };

  if (body && method !== 'GET') {
    finalOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(finalUrl, finalOptions);

  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return (data as ApiResponse<TResponse>).data ?? (data as TResponse);
    }
    return response.text() as unknown as TResponse;
  }

  let errorResponse: ApiErrorResponse;
  try {
    errorResponse = (await response.json()) as ApiErrorResponse;
  } catch {
    errorResponse = {
      code: String(response.status),
      message: response.statusText || 'Unknown error occurred',
    };
  }
  const error = new Error(
    ERROR_MESSAGES[errorResponse.code] || errorResponse.message,
  ) as Error & {
    status: number;
    code: string;
    response: ApiErrorResponse;
  };
  error.status = response.status;
  error.code = errorResponse.code;
  error.response = errorResponse;
  throw error;
}
