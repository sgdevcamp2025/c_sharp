'use server';

import { ERROR_MESSAGES } from '@/src/shared/services/models';
import type {
  HttpMethod,
  FetchOptions,
  JsonValue,
  ApiErrorResponse,
  ApiResponse,
  ApiServerType,
} from '@/src/shared/services/models';
import { getBaseUrl } from '@/src/shared/services/lib/utils';
import { cookies } from 'next/headers';

export async function fetchInstance<TResponse, TBody = JsonValue>(
  serverType: ApiServerType,
  url: string,
  method: HttpMethod,
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  try {
    const accessToken = cookies().get('accessToken')?.value;

    // const token =
    //   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3NDAwMTgyNTMsImV4cCI6MTc3MTU1NDI1MywidXNlcklkIjoxfQ.8bnw2CjXWgrdNOWr8z2U-rytvqhns3_0Y1VO4tjIB6s-2Wk6GNpQn0-jvvN0BnoGC67pEr-g073vUOGczF-8xg';

    // 🟢 options 객체에서 필요한 값들을 구조 분해 할당
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
    // 🟢 URL에 쿼리 파라미터 추가
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const finalUrl = `${BASE_URL}${url}${queryParams}`;

    // 🟢 기본 헤더 설정 (Content-Type 자동 처리)
    const finalHeaders: Record<string, string> = {
      ...(includeAuthToken && accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...(body && !(body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(restOptions.headers as Record<string, string>),
    };

    // 🟢 최종 fetch 옵션 구성
    const finalOptions: RequestInit = {
      method,
      ...restOptions,
      headers: finalHeaders,
      ...(cache && { cache }),
      ...(revalidate && { next: { revalidate } }),
      ...(tags && { next: { tags } }),
    };

    // body 데이터가 있고, GET 요청이 아닐 때만 body 필드 추가
    if (body && method !== 'GET') {
      finalOptions.body =
        body instanceof FormData ? body : JSON.stringify(body);
    }

    // API 호출
    const response = await fetch(finalUrl, finalOptions);

    // 성공 응답 처리
    if (response.ok) {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return (data as ApiResponse<TResponse>).data ?? (data as TResponse);
      }

      return response.text() as unknown as TResponse;
    }

    // 에러 응답 처리
    let errorResponse: ApiErrorResponse;
    try {
      errorResponse = (await response.json()) as ApiErrorResponse;
    } catch {
      errorResponse = {
        code: String(response.status),
        message: response.statusText || 'Unknown error occurred',
      };
    }

    // 커스텀 에러 객체 생성
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
    console.error('❌ fetchInstance error:', error);
    throw error;
  }
}
