export type FileData = {
  id: string;
  file: File;
  preview: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
};
