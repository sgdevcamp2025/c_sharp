import ThreadHeader from './thread-header';
import ThreadSection from './thread-section';

const ThreadPanel = ({ onClose }: { onClose: (value: boolean) => void }) => {
  return (
    <div className="z-50 maw-w-[906px] w-full h-full flex flex-col min-w-0 min-h-0">
      <ThreadHeader onClose={onClose} /> <ThreadSection />
    </div>
  );
};

export default ThreadPanel;
