import { Headphones } from 'lucide-react';

const HuddleContainer = () => {
  return (
    <div className="bg-primary w-full h-full flex flex-col gap-1 px-2 py-1">
      <h3 className="flex flex-row text-white gap-2">
        <Headphones /> slack-전체에서의 허들 1명
      </h3>
      <div className="bg-gray-500 min-h-0 h-[90%]">허들 콘텐츠</div>
      <div className="bg-red-100 min-h-0 h-[10%]">허들 툴바</div>
    </div>
  );
};
export default HuddleContainer;
