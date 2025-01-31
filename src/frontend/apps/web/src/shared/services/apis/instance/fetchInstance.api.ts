import { ERROR_MESSAGES } from '@/src/shared/services/model';
import type {
  HttpMethod,
  FetchOptions,
  JsonValue,
  ApiErrorResponse,
  ApiResponse,
} from '@/src/shared/services/model';

export async function fetchInstance<TResponse, TBody = JsonValue>(
  url: string,
  method: HttpMethod,
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const {
      body,
      params,
      cache,
      tags,
      revalidate,
      withToken = true,
      ...restOptions
    } = options;

    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const finalUrl = `${url}${queryParams}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // withToken이 true일 때만 토큰을 헤더에 추가
    if (withToken) {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const finalOptions: RequestInit = {
      method,
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...(restOptions.headers as Record<string, string>),
      },
      ...(cache && { cache }),
      ...(revalidate && { next: { revalidate } }),
      ...(tags && { next: { tags } }),
    };

    if (body && method !== 'GET') {
      finalOptions.body = JSON.stringify(body);
    }

    const response = await fetch(finalUrl, finalOptions);

    // 성공 응답 처리
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        // ApiResponse 형태로 응답이 왔다면 data 필드를 반환
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data
        ) {
          return (data as ApiResponse<TResponse>).data as TResponse;
        }
        return data as TResponse;
      }
      return response.text() as unknown as TResponse;
    }

    // 에러 응답 처리
    let errorResponse: ApiErrorResponse;
    try {
      errorResponse = (await response.json()) as ApiErrorResponse;
    } catch {
      // JSON 파싱 실패시 기본 에러 응답 생성
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
  } catch (error) {
    console.error('fetchInstance error:', error);
    throw error;
  }
}
