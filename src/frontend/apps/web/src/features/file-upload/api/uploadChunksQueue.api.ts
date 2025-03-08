import type { ResponseChunkFileData } from '@/src/entities/file-upload';

import { uploadChunkWithRetry } from './uploadChunkWithRetry.api';
import { getUploadConcurrency } from '../lib';

export const uploadChunksQueue = async (
  chunks: Blob[],
  channelId: number,
  workspaceId: number,
  tempFileIdentifier: string,
  chunkSize: number,
): Promise<ResponseChunkFileData[]> => {
  const totalChunk = chunks.length;
  const concurrency = await getUploadConcurrency();
  const results: ResponseChunkFileData[] = new Array(totalChunk);
  let currentIndex = 0;

  async function worker(workerId: number) {
    while (currentIndex < totalChunk) {
      const index = currentIndex;
      currentIndex++;

      try {
        results[index] = await uploadChunkWithRetry(
          chunks[index],
          channelId,
          workspaceId,
          tempFileIdentifier,
          totalChunk,
          chunkSize,
          index + 1,
        );
      } catch (error) {
        console.error(
          `[worker ${workerId}] Upload failed for chunk index:`,
          index,
          error,
        );
        results[index] = {
          code: '500',
          status: 'error',
        };
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);
  return results;
};
