import { fetchInstance } from '@/src/shared/services/apis';
import type { FetchOptions, JsonValue } from '@/src/shared/services/models';

/**
 * GET 요청을 보내는 함수입니다.
 * @template TResponse - 응답 데이터의 타입
 * @typedef {object} GetRequestOptions
 * @property {Record<string, string>} [params] - URL 쿼리 파라미터
 * @property {RequestCache} [cache] - Next.js의 캐시 전략 ('force-cache' | 'no-store' | 'no-cache')
 * @property {string[]} [tags] - 캐시 무효화를 위한 태그 배열
 * @property {number} [revalidate] - 캐시 재검증 주기(초)
 * @property {boolean} [withToken] - 인증 토큰 사용 여부
 *
 * @param {string} url - API 엔드포인트 URL
 * @param {Omit<FetchOptions, 'body'>} [options] - GET 요청 옵션
 * @returns {Promise<TResponse>} 응답 데이터를 포함한 Promise
 *
 * @example
 * ```typescript
 * // 기본 GET 요청
 * const data = await getRequest<UserData>('/api/users/me');
 *
 * // 쿼리 파라미터와 캐시 옵션을 포함한 GET 요청
 * const users = await getRequest<User[]>('/api/users', {
 *   params: { page: '1', size: '10' },
 *   cache: 'force-cache',
 *   tags: ['users']
 * });
 * ```
 */
export async function getRequest<TResponse>(
  url: string,
  options?: Omit<FetchOptions, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse>(url, 'GET', options);
}

/**
 * POST 요청을 보내는 함수입니다.
 * @template TResponse - 응답 데이터의 타입
 * @template TBody - 요청 본문의 타입
 * @typedef {object} PostRequestOptions
 * @property {Record<string, string>} [params] - URL 쿼리 파라미터
 * @property {string[]} [tags] - 캐시 무효화를 위한 태그 배열
 * @property {boolean} [withToken] - 인증 토큰 사용 여부
 *
 * @param {string} url - API 엔드포인트 URL
 * @param {TBody} body - 전송할 데이터
 * @param {Omit<FetchOptions<TBody>, 'body'>} [options] - POST 요청 옵션
 * @returns {Promise<TResponse>} 응답 데이터를 포함한 Promise
 *
 * @example
 * ```typescript
 * // 사용자 생성 요청
 * const newUser = await postRequest<User, CreateUserDto>(
 *   '/api/users',
 *   { name: 'John', email: 'john@example.com' }
 * );
 *
 * // 토큰 없이 로그인 요청
 * const loginResponse = await postRequest<LoginResponse, LoginDto>(
 *   '/api/auth/login',
 *   { email: 'user@example.com', password: '****' },
 *   { withToken: false }
 * );
 * ```
 */
export async function postRequest<TResponse, TBody = JsonValue>(
  url: string,
  body: TBody,
  options?: Omit<FetchOptions<TBody>, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse, TBody>(url, 'POST', { ...options, body });
}

/**
 * PATCH 요청을 보내는 함수입니다.
 * @template TResponse - 응답 데이터의 타입
 * @template TBody - 요청 본문의 타입
 * @typedef {object} PatchRequestOptions
 * @property {Record<string, string>} [params] - URL 쿼리 파라미터
 * @property {string[]} [tags] - 캐시 무효화를 위한 태그 배열
 * @property {boolean} [withToken] - 인증 토큰 사용 여부
 *
 * @param {string} url - API 엔드포인트 URL
 * @param {TBody} body - 업데이트할 데이터
 * @param {Omit<FetchOptions<TBody>, 'body'>} [options] - PATCH 요청 옵션
 * @returns {Promise<TResponse>} 응답 데이터를 포함한 Promise
 *
 * @example
 * ```typescript
 * // 사용자 정보 업데이트
 * const updatedUser = await patchRequest<User, UpdateUserDto>(
 *   `/api/users/${userId}`,
 *   { name: 'Updated Name' },
 *   { tags: ['user-profile'] }
 * );
 * ```
 */
export async function patchRequest<TResponse, TBody = JsonValue>(
  url: string,
  body: TBody,
  options?: Omit<FetchOptions<TBody>, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse, TBody>(url, 'PATCH', { ...options, body });
}

/**
 * DELETE 요청을 보내는 함수입니다.
 * @template TResponse - 응답 데이터의 타입
 * @template TBody - 요청 본문의 타입
 * @typedef {object} DeleteRequestOptions
 * @property {Record<string, string>} [params] - URL 쿼리 파라미터
 * @property {string[]} [tags] - 캐시 무효화를 위한 태그 배열
 * @property {boolean} [withToken] - 인증 토큰 사용 여부
 *
 * @param {string} url - API 엔드포인트 URL
 * @param {TBody} [body] - 전송할 데이터 (선택사항)
 * @param {Omit<FetchOptions<TBody>, 'body'>} [options] - DELETE 요청 옵션
 * @returns {Promise<TResponse>} 응답 데이터를 포함한 Promise
 *
 * @example
 * ```typescript
 * // 단순 삭제 요청
 * await deleteRequest<void>(`/api/posts/${postId}`);
 *
 * // 본문과 함께 삭제 요청
 * await deleteRequest<void, DeletePostDto>(
 *   `/api/posts/${postId}`,
 *   { reason: 'spam' },
 *   { tags: ['posts'] }
 * );
 * ```
 */
export async function deleteRequest<TResponse, TBody = JsonValue>(
  url: string,
  body?: TBody,
  options?: Omit<FetchOptions<TBody>, 'body'>,
): Promise<TResponse> {
  return fetchInstance<TResponse, TBody>(url, 'DELETE', { ...options, body });
}
