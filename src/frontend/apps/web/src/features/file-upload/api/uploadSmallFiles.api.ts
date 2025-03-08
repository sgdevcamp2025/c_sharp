import { serverFetchInstance } from '@/src/shared/services/apis';
import type { ResponseChunkFileData } from '@/src/entities/file-upload';

export async function uploadSmallFiles({
  channelId,
  workspaceId,
  file,
}): Promise<ResponseChunkFileData> {
  const formData = new FormData();

  formData.append('channelId', channelId.toString());
  formData.append('workspaceId', workspaceId.toString());
  formData.append('file', file);

  try {
    console.log('start upload');
    const response = await serverFetchInstance<ResponseChunkFileData, FormData>(
      '/api/v1/files/small',
      'POST',
      {
        body: formData,
        includeAuthToken: true,
      },
    );
    console.log('[uploadFiles] Response =>', response);
    return response;
  } catch (error) {
    console.error('[uploadFiles] Request error =>', error);
    throw error;
  }
}
