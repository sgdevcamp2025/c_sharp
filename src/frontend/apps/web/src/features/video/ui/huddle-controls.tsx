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
  return (
    <div className="flex justify-center items-center gap-2">
      <ToggleGroup
        variant="outline"
        type="multiple"
        size="lg"
      >
        <ToggleGroupItem
          value="mic"
          onClick={() => setIsMicOn((prev) => !prev)}
        >
          {isMicOn ? <Mic /> : <MicOff />}
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
      </ToggleGroup>
      <Button
        variant="destructive"
        className="h-11"
      >
        나가기
      </Button>
    </div>
  );
};
export default HuddleControls;
