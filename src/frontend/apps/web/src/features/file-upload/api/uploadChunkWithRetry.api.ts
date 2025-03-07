import { uploadFiles } from './uploadFiles.api';

import { ResponseChunkFileData } from '../../chat/model';

export const uploadChunkWithRetry = async (
  chunk: Blob,
  channelId: number,
  workspaceId: number,
  tempFileIdentifier: string,
  totalChunks: number,
  totalSize: number,
  chunkIndex: number,
  attempt: number = 0,
): Promise<ResponseChunkFileData> => {
  const maxAttempts = 5;
  try {
    // console.log(
    //   '[uploadChunkWithRetry] Attempt:',
    //   attempt,
    //   'ChunkIndex:',
    //   chunkIndex,
    // );

    const fileForChunk = new File([chunk], `chunk-${chunkIndex}`, {
      type: 'application/octet-stream',
    });

    // console.log('[uploadChunkWithRetry] fileForChunk size:', fileForChunk.size);

    const response = await uploadFiles({
      channelId,
      workspaceId,
      tempFileIdentifier,
      totalChunks,
      totalSize,
      chunkIndex,
      chunk: fileForChunk,
    });
    // console.log(
    //   '[uploadChunkWithRetry] Upload success. chunkIndex:',
    //   chunkIndex,
    // );
    return response;
  } catch (error) {
    // console.error(
    //   '[uploadChunkWithRetry] Upload error. chunkIndex:',
    //   chunkIndex,
    //   error,
    // );

    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(
        `Upload failed for chunk ${chunkIndex} (attempt ${attempt + 1}). Retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return uploadChunkWithRetry(
        chunk,
        channelId,
        workspaceId,
        tempFileIdentifier,
        totalChunks,
        totalSize,
        chunkIndex,
        attempt + 1,
      );
    } else {
      console.error(
        `Chunk ${chunkIndex} upload failed after ${maxAttempts} attempts.`,
      );
      throw error;
    }
  }
};
