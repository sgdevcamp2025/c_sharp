'use client';

import type { FilePreview } from '../model';
import { FilePreviewItem } from './file-preview-item';

type FilePreviewListProps = {
  selectedFiles: FilePreview[];
  onRemoveFile: (id: number) => void;
};

export const FilePreviewList = ({
  selectedFiles,
  onRemoveFile,
}: FilePreviewListProps) => {
  if (selectedFiles.length === 0) {
    return null;
  }

  // console.log(selectedFiles);

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex gap-2 pb-2 w-max">
        {selectedFiles.map((fileData, index) => (
          <FilePreviewItem
            key={index}
            id={index}
            fileData={fileData}
            onRemove={onRemoveFile}
          />
        ))}
      </div>
    </div>
  );
};
