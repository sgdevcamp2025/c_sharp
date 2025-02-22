import { getRequest } from '@/src/shared/services';

export async function getPing() {
  return getRequest<string>('file', '/api/v1/files/test');
}
