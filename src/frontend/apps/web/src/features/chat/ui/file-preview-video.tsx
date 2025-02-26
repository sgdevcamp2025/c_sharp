import Image from 'next/image';

export const VideoPreview = ({
  thumbnailUrl,
  onClick,
}: {
  thumbnailUrl: string | null;
  onClick: () => void;
}) => {
  return (
    <div>
      <Image
        src={thumbnailUrl}
        alt="Video thumbnail"
        fill
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-black-100"
        onClick={onClick}
      />
      <div className="absolute bottom-1 right-1 bg-black/20 text-white text-xs px-1 rounded ">
        ▶
      </div>
    </div>
  );
};
