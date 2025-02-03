'use client';
import { useState } from 'react';

import { ImagePreivew } from './file-preview-image';
import { VideoPreview } from './file-preview-video';
import FileModal from './file-modal';

import type { FileData } from '../model';

type FilePreviewItemProps = {
  fileData: FileData;
  onRemove: (id: string) => void;
};

export const FilePreviewItem = ({
  fileData,
  onRemove,
}: FilePreviewItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative group flex-shrink-0">
      <div className="w-20 h-20 rounded-lg relative overflow-hidden">
        {fileData.type === 'image' ? (
          <ImagePreivew
            preview={fileData.preview}
            onClick={() => setIsModalOpen(true)}
          />
        ) : (
          <VideoPreview
            thumbnailUrl={fileData.thumbnailUrl}
            onClick={() => setIsModalOpen(true)}
          />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(fileData.id);
          }}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center leading-none opacity-0 group-hover:opacity-100 transition-opacity text-sm p-0 font-medium"
        >
          ×
        </button>
      </div>
      {isModalOpen && (
        <FileModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          size="default"
          fileData={fileData}
        />
      )}
    </div>
  );
};
