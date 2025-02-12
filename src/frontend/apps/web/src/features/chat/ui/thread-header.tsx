import Header from './header';

import { X } from 'lucide-react';

const ThreadHeader = ({ onClose }: { onClose: (value: boolean) => void }) => {
  return (
    <Header>
      <span className="font-semibold text-gray-800">스레드</span>
      <button onClick={() => onClose(false)}>
        <X size={20} />
      </button>
    </Header>
  );
};

export default ThreadHeader;
