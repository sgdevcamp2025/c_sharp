export type ChunkFileData = {
  workspaceId: number;
  channelId: number;
  tempFileIdentifier: string;
  totalChunks: number;
  totalSize: number;
  chunkIndex: number;
  chunk: File;
};

export type ResponseChunkFileData = FileResponse & {
  fileId?: number;
  fileType?: string;
};

export type ThumbnailData = {
  fileId: number;
  thumbnail?: File;
};

export type FileResponse = {
  code: string;
  status: string;
};

export type ProcessedFile = {
  file: File;
  thumbnailFile?: File;
};
