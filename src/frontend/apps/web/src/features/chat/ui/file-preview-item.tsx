'use client';
import { useState } from 'react';
import { CircleX } from 'lucide-react';

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
      <div className="w-20 h-20 rounded-lg relative overflow-hidden border border-black">
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
        <CircleX
          onClick={(e) => {
            e.stopPropagation();
            onRemove(fileData.id);
          }}
          color="#EA4335"
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
        />
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
