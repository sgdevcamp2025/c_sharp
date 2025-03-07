'use client';
import { useState } from 'react';
import { CircleX, Loader2 } from 'lucide-react';

import ImagePreview from './ImagePreview';
import VideoPreview from './VideoPreview';
import FileModal from './FileModal';

import type { FilePreview } from '../model';

type FilePreviewItemProps = {
  id: number;
  fileData: FilePreview;
  onRemove: (id: number) => void;
};

const FilePreviewItem = ({ id, fileData, onRemove }: FilePreviewItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // console.log(fileData);

  return (
    <div className="relative group flex-shrink-0">
      <div className="w-20 h-20 rounded-lg relative overflow-hidden border border-black">
        {fileData.thumbnailUrl === undefined ? (
          <ImagePreview
            preview={fileData.previewUrl}
            onClick={() => setIsModalOpen(true)}
          />
        ) : (
          <VideoPreview
            thumbnailUrl={fileData.thumbnailUrl}
            onClick={() => setIsModalOpen(true)}
          />
        )}
        {fileData.isLoading ? (
          <div className="absolute top-1 right-1">
            <Loader2
              size={24}
              className="animate-spin"
              color="#3B82F6"
            />
          </div>
        ) : (
          <CircleX
            onClick={(e) => {
              e.stopPropagation();
              onRemove(Number(id));
            }}
            color="#EA4335"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
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

export default FilePreviewItem;
