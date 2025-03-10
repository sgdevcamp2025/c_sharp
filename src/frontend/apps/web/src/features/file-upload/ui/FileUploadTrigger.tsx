'use client';
import { ChangeEvent, useRef } from 'react';

import { Button } from '@workspace/ui/components';

type FileUploadTriggerProps = {
  name: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const FileUploadTrigger = ({ name, onFileChange }: FileUploadTriggerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="hidden"
        type="file"
        id={name}
        accept="image/*, video/*"
        name={name}
        ref={fileInputRef}
        onChange={onFileChange}
        multiple
      />
      <Button
        size="sm"
        variant="outline"
        type="button"
        onClick={handlePickFile}
      >
        +
      </Button>
      <span className="text-xs text-gray-500">
        Images (max 20MB) or Videos (max 200MB)
      </span>
    </div>
  );
};

export default FileUploadTrigger;
