export type FilePreview = {
  id: string;
  file: File;
  previewUrl: string;
  thumbnailUrl?: string;
  isLoading: boolean;
};
