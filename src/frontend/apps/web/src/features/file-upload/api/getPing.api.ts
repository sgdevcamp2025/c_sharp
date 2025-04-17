import { clientFetchInstance } from '@/src/shared/services';

export async function getPing() {
  return clientFetchInstance<string>('/api/v1/files/test', 'GET');
}
