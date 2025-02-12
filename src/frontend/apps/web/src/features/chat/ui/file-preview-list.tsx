'use client';

import type { FileData } from '../model';
import { FilePreviewItem } from './file-preview-item';

type FilePreviewListProps = {
  selectedFiles: FileData[];
  onRemoveFile: (id: string) => void;
};

export const FilePreviewList = ({
  selectedFiles,
  onRemoveFile,
}: FilePreviewListProps) => {
  if (selectedFiles.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex gap-2 pb-2 w-max">
        {/* {selectedFiles.map((fileData) => (
          <FilePreviewItem
            key={fileData.id}
            fileData={fileData}
            onRemove={onRemoveFile}
          />
        ))} */}
      </div>
    </div>
  );
};
