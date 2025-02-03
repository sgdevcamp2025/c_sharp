'use client';

import Image from 'next/image';
import type { FileData } from '../model';

type FilePreviewItemProps = {
  fileData: FileData;
  onRemove: (id: string) => void;
};

export const FilePreviewItem = ({
  fileData,
  onRemove,
}: FilePreviewItemProps) => {
  return (
    <div className="relative group flex-shrink-0">
      <div className="w-20 h-20 rounded-lg relative">
        {fileData.type === 'image' ? (
          <Image
            src={fileData.preview}
            alt="Preview"
            fill
            className="object-cover"
          />
        ) : (
          <Image
            src={fileData.thumbnailUrl || ''}
            alt="Video thumbnail"
            fill
            className="object-cover"
          />
        )}
        <button
          onClick={() => onRemove(fileData.id)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};
