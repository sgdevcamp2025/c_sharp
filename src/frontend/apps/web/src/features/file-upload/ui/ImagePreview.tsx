import Image from 'next/image';

const ImagePreview = ({
  preview,
  onClick,
}: {
  preview: string;
  onClick: () => void;
}) => {
  return (
    <Image
      src={preview}
      alt="Preview"
      fill
      className="object-cover"
      onClick={onClick}
    />
  );
};

export default ImagePreview;
