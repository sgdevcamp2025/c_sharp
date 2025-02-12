import { postRequest } from '@/src/shared/services/apis';

type FileUploadItem = {
  fileTypes: 'IMAGE' | 'VIDEO';
  fileIds: number;
};

type FileUploadRequest = {
  channelId: number;
  workspaceId: number;
  files: File[];
  thumbnails: (File | null)[];
};

export async function uploadFiles({
  channelId,
  workspaceId,
  files,
  thumbnails,
}: FileUploadRequest): Promise<FileUploadItem[]> {
  const formData = new FormData();

  formData.append('channelId', channelId.toString());
  formData.append('workspaceId', workspaceId.toString());

  files.forEach((file) => formData.append('files', file));

  // thumbnails 배열의 요소가 null인 경우, 문자열 "null"으로 대체
  thumbnails.forEach((thumb) =>
    formData.append('thumbnails', thumb === null ? 'null' : thumb),
  );

  for (const [key, value] of formData.entries()) {
    console.log('debugging', key, value);
  }

  return postRequest<FileUploadItem[], FormData>(
    'file',
    '/api/v1/files',
    formData,
  );
}
