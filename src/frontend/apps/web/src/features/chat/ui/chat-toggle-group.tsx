'use client';
import { useState } from 'react';

import { Button } from '@workspace/ui/components';

import { FilePreviewList } from './file-preview-list';
import { FileUploadTrigger } from './file-upload-trigger';
import { Loader } from 'lucide-react';

import { useFileManagements } from '../model';

type ChatToggleGroupsProps = {
  name: string;
  onSend?: () => void;
};

const ChatToggleGroup = ({ name, onSend }: ChatToggleGroupsProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const {
    selectedFiles,
    handleFileChange,
    handleRemoveFile,
    isLoading,
    error,
  } = useFileManagements(1, 1);

  console.log('123', selectedFiles);

  return (
    <div className="flex flex-col justify-between gap-2">
      {error && <div className="text-red-500">{error.message}</div>}

      {/* <FilePreviewList
        selectedFiles={selectedFiles}
        onRemoveFile={() => {}}
      /> */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4 items-center">
          <FileUploadTrigger
            name={name}
            onFileChange={handleFileChange}
          />
          {isLoading && (
            <Loader
              size="20"
              color="#000"
            />
          )}
        </div>
        {onSend && (
          <Button
            onClick={onSend}
            size="sm"
          >
            Send
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatToggleGroup;
