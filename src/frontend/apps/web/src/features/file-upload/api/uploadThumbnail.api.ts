import { serverFetchInstance } from '@/src/shared/services/apis';
import type { FileResponse } from '@/src/entities/file-upload';

type ThumbnailData = {
  fileId: number;
  thumbnail?: File;
};

export async function uploadThumbnail({
  fileId,
  thumbnail,
}: ThumbnailData): Promise<FileResponse> {
  const formData = new FormData();

  formData.append('fileId', fileId.toString());
  formData.append('thumbnail', thumbnail);

  try {
    const response = await serverFetchInstance<FileResponse, FormData>(
      '/api/v1/files/thumbnail',
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
