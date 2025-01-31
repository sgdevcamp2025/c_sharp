import { ERROR_MESSAGES } from '@/src/shared/services/models';
import type {
  HttpMethod,
  FetchOptions,
  JsonValue,
  ApiErrorResponse,
  ApiResponse,
} from '@/src/shared/services/models';

export async function fetchInstance<TResponse, TBody = JsonValue>(
  url: string,
  method: HttpMethod,
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  try {
    // 브라우저 환경에서만 localStorage 접근할 수 있도록
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    /**
     * options 객체에서 필요한 값들을 구조분해할당
     * @param {object} options - fetch 옵션 객체
     * @param {TBody} options.body - 요청 본문 데이터
     * @param {Record<string, string>} options.params - URL 쿼리 파라미터
     * @param {RequestCache} options.cache - Next.js 캐시 전략 ('force-cache' | 'no-store' | 'no-cache' | 'reload' | 'only-if-cached')
     * @param {string[]} options.tags - 캐시 무효화를 위한 태그 배열
     * @param {number} options.revalidate - 캐시 재검증 시간(초)
     * @param {boolean} options.withToken - 토큰을 헤더에 추가할지 여부 (기본값: true)
     */
    const {
      body,
      params,
      cache,
      tags,
      revalidate,
      withToken = true,
      ...restOptions
    } = options;

    // URL 쿼리 파라미터 추가
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const finalUrl = `${url}${queryParams}`;

    // 기본 헤더 설정
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

    // 최종 fetch 옵션 구성
    const finalOptions: RequestInit = {
      method,
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...(restOptions.headers as Record<string, string>),
      },
      // cache, tags, revalidate 옵션이 있을 경우 next 프로퍼티에 추가
      ...(cache && { cache }),
      ...(revalidate && { next: { revalidate } }),
      ...(tags && { next: { tags } }),
    };

    // body 데이터가 있고 GET 요청이 아닐 때만 body 필드 추가
    if (body && method !== 'GET') {
      finalOptions.body = JSON.stringify(body);
    }

    const response = await fetch(finalUrl, finalOptions);

    // 성공 응답 처리
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      // JSON 응답일 경우 JSON 파싱
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        // ApiResponse 형태로 응답이 왔다면 data 필드를 반환
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data
        ) {
          // ApiResponse 형태면 data 필드만 추출
          return (data as ApiResponse<TResponse>).data as TResponse;
        }
        // 일반 JSON 응답이면 그대로 반환
        return data as TResponse;
      }
      // JSON이 아닌 경우 텍스트로 반환
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

    // 커스텀 에러 객체 생성
    const error = new Error(
      ERROR_MESSAGES[errorResponse.code] || errorResponse.message,
    ) as Error & {
      status: number;
      code: string;
      response: ApiErrorResponse;
    };

    // 에러 객체에 상세 정보 추가
    error.status = response.status;
    error.code = errorResponse.code;
    error.response = errorResponse;

    throw error;
  } catch (error) {
    console.error('fetchInstance error:', error);
    throw error;
  }
}
