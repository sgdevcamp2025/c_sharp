import { Dispatch } from 'react';

import { ToggleGroupItem } from '@workspace/ui/components';
import { HuddleControl } from '@/src/entities/video';

import { HuddleControlAction } from '../model';

type HuddleControlProps = {
  value: HuddleControl;
  children: React.ReactNode;
  dispatch: Dispatch<HuddleControlAction>;
};

const HuddleControlItem = ({
  value,
  children,
  dispatch,
}: HuddleControlProps) => {
  return (
    <ToggleGroupItem
      value={value}
      onClick={() => dispatch({ type: value })}
    >
      {children}
    </ToggleGroupItem>
  );
};
export default HuddleControlItem;
