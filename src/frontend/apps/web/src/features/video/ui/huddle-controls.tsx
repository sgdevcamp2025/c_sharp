'use client';
import { Button, ToggleGroup, ToggleGroupItem } from '@workspace/ui/components';
import {
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { useState } from 'react';

const HuddleControls = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const iconStyle = 'w-16 h-16';

  return (
    <div className="flex justify-center items-center">
      <ToggleGroup
        variant="default"
        type="multiple"
        size="lg"
        className="gap-3"
      >
        <ToggleGroupItem
          value="mic"
          onClick={() => setIsMicOn((prev) => !prev)}
        >
          {isMicOn ? (
            <Mic className={iconStyle} />
          ) : (
            <MicOff className={iconStyle} />
          )}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="video"
          onClick={() => setIsVideoOn((prev) => !prev)}
        >
          {isVideoOn ? <Video /> : <VideoOff />}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="sharing"
          onClick={() => setIsScreenSharing((prev) => !prev)}
        >
          {isScreenSharing ? <ScreenShare /> : <ScreenShareOff />}
        </ToggleGroupItem>
        <Button
          variant="destructive"
          size="lg"
          className="h-12 font-bold"
        >
          나가기
        </Button>
      </ToggleGroup>
    </div>
  );
};
export default HuddleControls;
