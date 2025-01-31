import { fetchInstance } from '@/src/shared/services/apis';
import type { FetchOptions, JsonValue } from '@/src/shared/services/models';

/**
 * GET 요청을 보냅니다.
 * @template TResponse - 응답 데이터 타입
 * @param {string} url - 요청 URL
 * @param {Omit<FetchOptions, 'body'>} [options] - 요청 옵션 (body 제외)
 * @param {Record<string, string>} [options.params] - URL 쿼리 파라미터
 * @param {RequestCache} [options.cache] - 캐시 전략
 * @param {string[]} [options.tags] - 캐시 무효화 태그
 * @param {number} [options.revalidate] - 캐시 재검증 시간(초)
 * @returns {Promise<TResponse>} 응답 데이터
 */
export async function getRequest<TResponse>(
  url: string,
  options?: Omit<FetchOptions, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse>(url, 'GET', options);
}

/**
 * POST 요청을 보냅니다.
 * @template TResponse - 응답 데이터 타입
 * @template TBody - 요청 본문 데이터 타입
 * @param {string} url - 요청 URL
 * @param {TBody} body - 요청 본문 데이터
 * @param {Omit<FetchOptions<TBody>, 'body'>} [options] - 요청 옵션 (body 제외)
 * @param {Record<string, string>} [options.params] - URL 쿼리 파라미터
 * @param {string[]} [options.tags] - 캐시 무효화 태그
 * @returns {Promise<TResponse>} 응답 데이터
 */
export async function postRequest<TResponse, TBody = JsonValue>(
  url: string,
  body: TBody,
  options?: Omit<FetchOptions<TBody>, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse, TBody>(url, 'POST', { ...options, body });
}

/**
 * PATCH 요청을 보냅니다.
 * @template TResponse - 응답 데이터 타입
 * @template TBody - 요청 본문 데이터 타입
 * @param {string} url - 요청 URL
 * @param {TBody} body - 업데이트할 데이터
 * @param {Omit<FetchOptions<TBody>, 'body'>} [options] - 요청 옵션 (body 제외)
 * @param {Record<string, string>} [options.params] - URL 쿼리 파라미터
 * @param {string[]} [options.tags] - 캐시 무효화 태그
 * @returns {Promise<TResponse>} 응답 데이터
 */
export async function patchRequest<TResponse, TBody = JsonValue>(
  url: string,
  body: TBody,
  options?: Omit<FetchOptions<TBody>, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse, TBody>(url, 'PATCH', { ...options, body });
}

/**
 * DELETE 요청을 보냅니다.
 * @template TResponse - 응답 데이터 타입
 * @template TBody - 요청 본문 데이터 타입
 * @param {string} url - 요청 URL
 * @param {TBody} [body] - 요청 본문 데이터 (선택사항)
 * @param {Omit<FetchOptions<TBody>, 'body'>} [options] - 요청 옵션 (body 제외)
 * @param {Record<string, string>} [options.params] - URL 쿼리 파라미터
 * @param {string[]} [options.tags] - 캐시 무효화 태그
 * @returns {Promise<TResponse>} 응답 데이터
 */
export async function deleteRequest<TResponse, TBody = JsonValue>(
  url: string,
  body?: TBody,
  options?: Omit<FetchOptions<TBody>, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse, TBody>(url, 'DELETE', { ...options, body });
}
