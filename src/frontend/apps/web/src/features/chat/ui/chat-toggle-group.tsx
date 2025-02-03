'use client';
import { useState, useRef } from 'react';

import { Button } from '@workspace/ui/components';
import { handleFileChangeEvent, removeFile } from '@/src/features/chat/model';

import { FilePreviewList } from './file-preivew-list';
import { FileUploadTrigger } from './file-upload-trigger';
import type { FileData } from '../model';

type ChatToggleGroupsProps = {
  name: string;
  onSend?: () => void;
};

const ChatToggleGroup = ({ name, onSend }: ChatToggleGroupsProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChangeEvent(event, setSelectedFiles);
  };

  const handleRemoveFile = (id: string) => {
    removeFile(id, setSelectedFiles);
  };

  return (
    <div className="flex flex-col justify-between gap-2">
      <FilePreviewList
        selectedFiles={selectedFiles}
        onRemoveFile={handleRemoveFile}
      />
      <div className="flex flex-row justify-between">
        <FileUploadTrigger
          name={name}
          onFileChange={handleFileChange}
        />
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
