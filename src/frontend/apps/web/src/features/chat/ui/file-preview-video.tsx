import Image from 'next/image';

export const VideoPreview = ({
  thumbnailUrl,
  onClick,
}: {
  thumbnailUrl: string;
  onClick: () => void;
}) => {
  return (
    <>
      <Image
        src={thumbnailUrl}
        alt="Video thumbnail"
        fill
        className="object-cover"
        onClick={onClick}
      />
      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
        ▶
      </div>
    </>
  );
};
