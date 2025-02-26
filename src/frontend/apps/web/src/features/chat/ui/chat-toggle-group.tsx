'use client';
import { useEffect, useState } from 'react';

import { Button } from '@workspace/ui/components';

import { FilePreviewList } from './file-preview-list';
import { FileUploadTrigger } from './file-upload-trigger';

import { useFileManagements } from '../model';

type ChatToggleGroupsProps = {
  name: string;
  onSend?: () => void;
  setAttachmentList?: (files: number[]) => void;
  fileManagements: ReturnType<typeof useFileManagements>;
};

const ChatToggleGroup = ({
  name,
  onSend,
  setAttachmentList,
  fileManagements,
}: ChatToggleGroupsProps) => {
  const {
    filePreviews,
    handleFileChange,
    handleRemoveFile,
    isFinalLoading,
    error,
    uploadedFileIds,
  } = fileManagements;

  // console.log('filePreviews', filePreviews);
  // console.log('uploadedFileIds', uploadedFileIds);

  useEffect(() => {
    if (setAttachmentList) {
      setAttachmentList(uploadedFileIds);
    }
  }, [uploadedFileIds, setAttachmentList]);

  // console.log('toggle-group', filePreviews);

  return (
    <div className="flex flex-col justify-between gap-2">
      {error && <div className="text-red-500">{error.message}</div>}

      <FilePreviewList
        selectedFiles={filePreviews}
        onRemoveFile={handleRemoveFile}
      />
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4 items-center">
          <FileUploadTrigger
            name={name}
            onFileChange={handleFileChange}
          />
        </div>
        {onSend && (
          <Button
            onClick={onSend}
            size="sm"
            disabled={isFinalLoading}
          >
            {isFinalLoading ? 'Uploading...' : 'Send'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatToggleGroup;
