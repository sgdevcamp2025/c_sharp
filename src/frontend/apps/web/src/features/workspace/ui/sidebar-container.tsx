'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, CirclePlus } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components';
import { useChatId } from '@/src/shared';

import WorkspaceModal from './workspace-modal';

import {
  useWorkspaceChannels,
  useUnreadMessages,
  useUnreadSubscription,
} from '../model';
import { createWorkspace, getWorkspaceList, joinChannel } from '../api'; // joinChannel 추가
import { getWorkspaceId } from '../lib';

// 채널 렌더링 함수를 분리 (joinedChannels와 unjoinedChannels를 별도로 처리)
const renderJoinedChannels = (
  channels: any[] | undefined,
  onChannelClick: (channelId: number) => void,
  activeChannelId: number | null,
  unreadData?: any,
) => {
  if (!channels || channels.length === 0) {
    return (
      <div className="px-8 py-2 text-sm text-white/50">채널이 없습니다</div>
    );
  }

  return channels.map((channel) => {
    const isActive = channel.channelId === activeChannelId;

    let unreadNum = channel.unreadNum || 0;

    if (unreadData && unreadData.channels) {
      const updatedChannel = unreadData.channels.find(
        (c: any) => c.channelId === channel.channelId,
      );
      if (updatedChannel) {
        unreadNum = updatedChannel.unreadNum;
      }
    }

    return (
      <SidebarMenuItem key={channel.channelId}>
        <SidebarMenuButton
          asChild
          className={`px-8 py-1.5 text-sm transition-colors ${
            isActive
              ? 'bg-white/20 text-white font-medium'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => onChannelClick(channel.channelId)}
        >
          <div className="flex justify-between w-full">
            <span>{channel.channelName}</span>
            <span
              className={`px-1.5 py-0.5 text-xs rounded-full min-w-5 text-center `}
            >
              {unreadNum}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
};

const renderUnjoinedChannels = (
  channels: any[] | undefined,
  onJoinChannel: (channel: any) => void,
  activeChannelId: number | null,
) => {
  if (!channels || channels.length === 0) {
    return (
      <div className="px-8 py-2 text-sm text-white/50">채널이 없습니다</div>
    );
  }

  return channels.map((channel) => {
    return (
      <SidebarMenuItem key={channel.channelId}>
        <SidebarMenuButton
          asChild
          className="px-8 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => onJoinChannel(channel)}
        >
          <div className="flex justify-between w-full">
            <span>{channel.channelName}</span>
            <span className="text-xs text-white/50">가입하기</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
};

const SidebarContainer = ({ stockSlug }: { stockSlug: string }) => {
  const workspaceId = getWorkspaceId(stockSlug);
  const { setChannelId } = useChatId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);

  const { joinedChannels, unjoinedChannels, isLoading, error, refetch } =
    useWorkspaceChannels(workspaceId);

  // console.log('joinnedChannels', joinedChannels);
  // console.log('unjoinnedChannels', unjoinedChannels);

  const { subscribe, isConnected } = useUnreadSubscription(workspaceId);
  const { data: unreadData } = useUnreadMessages(workspaceId);

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isConnected, subscribe]);

  useEffect(() => {
    const storedChat = localStorage.getItem('chat');
    if (storedChat) {
      try {
        const chatData = JSON.parse(storedChat);
        if (chatData.channelId) {
          setActiveChannelId(chatData.channelId);
        }
      } catch (e) {
        console.error('Failed to parse stored chat data', e);
      }
    }
  }, []);

  if (error) return <div>Error: {String(error)}</div>;
  if (workspaceId === -1) return <div>Error: Invalid workspace id</div>;

  const handleCreateChannel = async (data: { workspace?: string }) => {
    await createWorkspace(workspaceId, data.workspace);
  };

  const handleChannelClick = (channelId: number) => {
    setChannelId(channelId);
    setActiveChannelId(channelId);
    const chatData = {
      workspace: workspaceId,
      channelId: channelId,
    };

    localStorage.setItem('chat', JSON.stringify(chatData));
  };

  const handleJoinChannel = async (channel: any) => {
    if (window.confirm(`'${channel.channelName}' 채널에 가입하시겠습니까?`)) {
      try {
        await joinChannel(workspaceId, channel.channelId);
        getWorkspaceList(workspaceId);
        handleChannelClick(channel.channelId);
      } catch (error) {
        console.error('채널 가입 실패:', error);
        alert('채널 가입에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-4 py-3.5 min-w-0 max-w-full border-b border-white/10">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] text-white/40 font-medium tracking-wide uppercase">
              Workspace
            </div>
            <div className="truncate text-white/95 font-bold text-[18px] tracking-tight">
              {stockSlug}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-1 pt-2">
          <Collapsible
            defaultOpen
            className="group/collapsible-joined"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors px-4 py-2"
              >
                <CollapsibleTrigger>
                  마이 채널
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible-joined:rotate-90 opacity-70 group-hover/label:opacity-100" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {isLoading ? (
                      <div className="px-8 py-2 text-sm text-white/50">
                        로딩 중...
                      </div>
                    ) : (
                      renderJoinedChannels(
                        joinedChannels,
                        handleChannelClick,
                        activeChannelId,
                        unreadData,
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          <Collapsible
            defaultOpen
            className="group/collapsible-unjoined"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors px-4 py-2"
              >
                <CollapsibleTrigger>
                  다른 채널
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible-unjoined:rotate-90 opacity-70 group-hover/label:opacity-100" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {isLoading ? (
                      <div className="px-8 py-2 text-sm text-white/50">
                        로딩 중...
                      </div>
                    ) : (
                      renderUnjoinedChannels(
                        unjoinedChannels,
                        handleJoinChannel,
                        activeChannelId,
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <Collapsible className="group/make-channel-collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors px-4 py-2"
              >
                <CollapsibleTrigger onClick={() => setIsModalOpen(true)}>
                  <span>채널 생성하기</span>
                  <CirclePlus className="ml-auto h-4 w-4 opacity-70 group-hover/label:opacity-100" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>
      </Sidebar>
      <WorkspaceModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSubmit={handleCreateChannel}
      />
    </>
  );
};

export default SidebarContainer;
