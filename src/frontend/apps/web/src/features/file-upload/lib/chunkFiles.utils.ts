import { getPing } from '../api';

export let cachedChunkSize: number | null = null;
export let cachedUploadConcurrency: number | null = null;
export const DEFAULT_CHUNK_SIZE = 200 * 1024 * 1024;

export const resetCache = () => {
  cachedChunkSize = null;
  cachedUploadConcurrency = null;
};

export const getDynamicChunkSize = async (): Promise<number> => {
  if (cachedChunkSize !== null) {
    // console.log('Using cached chunk size:', cachedChunkSize);
    return cachedChunkSize;
  }

  const start = performance.now();
  try {
    await getPing();
  } catch (error) {
    console.warn('Network speed test failed, using default chunk size.', error);
    cachedChunkSize = DEFAULT_CHUNK_SIZE;
    return cachedChunkSize;
  }
  const end = performance.now();
  const latency = end - start;
  // console.log('Network latency:', latency);

  if (latency > 1000) {
    cachedChunkSize = 10 * 1024 * 1024;
  } else if (latency > 500) {
    cachedChunkSize = 100 * 1024 * 1024;
  } else {
    cachedChunkSize = DEFAULT_CHUNK_SIZE;
  }

  return cachedChunkSize;
};

export const getUploadConcurrency = async (): Promise<number> => {
  if (cachedUploadConcurrency !== null) {
    // console.log('Using cached upload concurrency:', cachedUploadConcurrency);
    return cachedUploadConcurrency;
  }

  const start = performance.now();
  try {
    await getPing();
  } catch (error) {
    console.warn(
      'Network speed test failed, using default upload concurrency.',
      error,
    );
    cachedUploadConcurrency = 3;
    return cachedUploadConcurrency;
  }
  const end = performance.now();
  const latency = end - start;
  // console.log('Network latency for upload concurrency:', latency);

  if (latency <= 500) {
    cachedUploadConcurrency = 5;
  } else if (latency <= 1000) {
    cachedUploadConcurrency = 3;
  } else {
    cachedUploadConcurrency = 1;
  }
  // console.log('Upload concurrency set to:', cachedUploadConcurrency);
  return cachedUploadConcurrency;
};

export const createChunks = async (file: File): Promise<Blob[]> => {
  const chunkSize = await getDynamicChunkSize();
  const chunks: Blob[] = [];
  let offset = 0;

  // console.log(
  //   `Creating chunks for ${file.name}, file size: ${file.size} bytes, chunk size: ${chunkSize} bytes`,
  // );

  while (offset < file.size) {
    chunks.push(file.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }

  return chunks;
};

export const generateTempFileIdentifier = (
  userId: number,
  timestamp: number,
  fileIndex: number,
): string => {
  const formattedTimestamp = (timestamp / 1000).toFixed(6);
  return `${userId}-${formattedTimestamp}-${fileIndex}`;
};
