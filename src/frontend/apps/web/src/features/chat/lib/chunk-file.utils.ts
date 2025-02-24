import { getPing } from '../api';

let cachedChunkSize: number | null = null;
let cachedUploadConcurrency: number | null = null;
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;

/**
 * 네트워크 지연 시간에 따라 동적으로 청크 사이즈를 결정합니다.
 * @returns {Promise<number>} 결정된 청크 사이즈 (바이트 단위)
 */
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
    cachedChunkSize = 2.5 * 1024 * 1024;
  } else if (latency > 500) {
    cachedChunkSize = 5 * 1024 * 1024;
  } else {
    cachedChunkSize = DEFAULT_CHUNK_SIZE;
  }

  return cachedChunkSize;
};

/**
 * 네트워크 지연 시간에 따라 병렬 업로드 개수를 결정합니다.
 * 빠른 네트워크에서는 5개, 중간이면 3개, 느리면 1개로 조절합니다.
 * @returns {Promise<number>} 동시에 전송할 청크 개수
 */
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

/**
 * 파일을 동적 청크 사이즈에 따라 청크로 분리합니다.
 * @param file 분리할 파일
 * @returns {Promise<Blob[]>} 파일 청크들의 배열
 */
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

/**
 * 임시 파일 식별자를 생성합니다.
 * @param userId 사용자 ID
 * @param timestamp 파일 선택 시점의 타임스탬프 (밀리초)
 * @param fileIndex 파일의 인덱스
 * @returns {string} 생성된 임시 파일 식별자
 */
export const generateTempFileIdentifier = (
  userId: number,
  timestamp: number,
  fileIndex: number,
): string => {
  const formattedTimestamp = (timestamp / 1000).toFixed(6);
  return `${userId}-${formattedTimestamp}-${fileIndex}`;
};
