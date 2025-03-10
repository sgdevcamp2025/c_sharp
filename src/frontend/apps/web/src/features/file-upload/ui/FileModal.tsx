import Image from 'next/image';

import { Button, Modal } from '@workspace/ui/components';

import { FilePreview } from '../model';
import { formatFileSize } from '../lib';

type FileModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  size?: 'default' | 'lg';
  className?: string;
  fileData: FilePreview;
};

const FileModal = ({
  isOpen,
  setIsOpen,
  size,
  className,
  fileData,
}: FileModalProps) => {
  return (
    <Modal
      size={size}
      className={className}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gray-100 rounded-lg">
              {fileData.thumbnailUrl === undefined ? '🖼️' : '🎥'}
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {fileData.file.name}
              </h2>
              <p className="text-sm text-gray-500">
                {fileData.thumbnailUrl === undefined ? 'Image' : 'Video'} •{' '}
                {formatFileSize(fileData.file.size)}
              </p>
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="rounded-xl overflow-hidden bg-gray-50">
          {fileData.thumbnailUrl === undefined ? (
            <div className="relative w-full h-[40vh]">
              <Image
                src={fileData.previewUrl}
                alt={fileData.previewUrl}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          ) : (
            <div className="relative w-full h-[40vh] bg-black">
              <video
                src={fileData.previewUrl}
                className="w-full h-full"
                controls
                autoPlay
                controlsList="nodownload"
                poster={fileData.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="default"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FileModal;
