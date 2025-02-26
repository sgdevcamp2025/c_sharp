import { uploadChunkWithRetry } from './upload-chunk-retry-api';

import { ResponseChunkFileData } from '../model';
import { getUploadConcurrency } from '../lib/chunk-file.utils';

/**
 * 파일 청크들을 네트워크 상태에 따른 병렬성으로 업로드하는 업로드 대기열 함수입니다.
 * 각 청크는 바로 API로 전송됩니다.
 * @param chunks 업로드할 청크 배열
 * @param channelId 채널 ID
 * @param workspaceId 워크스페이스 ID
 * @param tempFileIdentifier 임시 파일 식별자
 * @param chunkSize 청크 사이즈
 * @returns {Promise<ResponseFileUploadItem[]>} 각 청크 업로드 결과 배열
 */
export const uploadChunksQueue = async (
  chunks: Blob[],
  channelId: number,
  workspaceId: number,
  tempFileIdentifier: string,
  chunkSize: number,
): Promise<ResponseChunkFileData[]> => {
  const totalChunk = chunks.length;
  const concurrency = await getUploadConcurrency();
  // console.log('Starting upload with concurrency:', concurrency);
  const results: ResponseChunkFileData[] = new Array(totalChunk);
  let currentIndex = 0;

  async function worker(workerId: number) {
    while (currentIndex < totalChunk) {
      const index = currentIndex;
      currentIndex++;
      // console.log(`[worker ${workerId}] Uploading chunk index:`, index);

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
        // console.log(
        //   `[worker ${workerId}] Upload success for chunk index:`,
        //   index,
        // );
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
