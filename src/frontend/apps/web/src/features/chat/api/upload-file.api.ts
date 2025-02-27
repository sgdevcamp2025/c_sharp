import { clientFetchInstance } from '@/src/shared/services/apis';

import { ResponseChunkFileData } from '../model';

/**
 * 각 청크 데이터를 개별적으로 업로드하는 함수.
 * 이 함수는 하나의 청크(ChunkInfo 객체)를 API로 전송합니다.
 */
export async function uploadFiles({
  channelId,
  workspaceId,
  tempFileIdentifier,
  totalChunks,
  totalSize,
  chunkIndex,
  chunk,
}): Promise<ResponseChunkFileData> {
  const formData = new FormData();

  formData.append('channelId', channelId.toString());
  formData.append('workspaceId', workspaceId.toString());
  formData.append('tempFileIdentifier', tempFileIdentifier);
  formData.append('totalChunks', totalChunks.toString());
  formData.append('totalSize', totalSize.toString());
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('chunk', chunk);

  // 디버깅용: formData의 모든 키-값 출력
  // for (const [key, value] of formData.entries()) {
  //   console.log('debugging', key, value);
  // }

  try {
    const response = await clientFetchInstance<ResponseChunkFileData, FormData>(
      '/api/v1/files/chunk',
      'POST',
      {
        body: formData,
      },
    );
    console.log('[uploadFiles] Response =>', response);
    return response;
  } catch (error) {
    console.error('[uploadFiles] Request error =>', error);
    throw error;
  }
}
