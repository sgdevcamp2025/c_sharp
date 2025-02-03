export type FileData = {
  id: string;
  name: string;
  file: File;
  preview: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
};
