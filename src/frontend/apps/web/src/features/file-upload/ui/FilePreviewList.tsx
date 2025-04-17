'use client';
import FilePreviewItem from './FilePreviewItem';

import type { FilePreview } from '../model';

type FilePreviewListProps = {
  selectedFiles: FilePreview[];
  onRemoveFile: (id: number) => void;
};

const FilePreviewList = ({
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

export default FilePreviewList;
