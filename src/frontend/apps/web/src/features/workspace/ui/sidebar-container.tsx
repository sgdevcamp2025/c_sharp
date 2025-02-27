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

import { useWorkspaceChannels } from '../model';
import { createWorkspace } from '../api';
import { getWorkspaceId } from '../lib';

const renderChannels = (
  channels: any[] | undefined,
  onChannelClick: (channelId: number) => void,
  activeChannelId: number | null, // 활성 채널 ID 매개변수 추가
) => {
  if (!channels || channels.length === 0) {
    return (
      <div className="px-8 py-2 text-sm text-white/50">채널이 없습니다</div>
    );
  }

  return channels.map((channel) => {
    const isActive = channel.channelId === activeChannelId; // 현재 채널이 활성 상태인지 확인

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

            <span className="px-1.5 py-0.5  text-white text-xs rounded-full min-w-5 text-center">
              {channel.unreadNum}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
};

const SidebarContainer = ({ stockSlug }: { stockSlug: string }) => {
  const workspaceId = getWorkspaceId(stockSlug);
  const { setChannelId, channelId } = useChatId(); // channelId도 가져오기
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null); // 활성 채널 상태 추가

  const { joinedChannels, unjoinedChannels, isLoading, error } =
    useWorkspaceChannels(workspaceId);

  // 컴포넌트 마운트 시 로컬 스토리지에서 저장된 채널 ID 불러오기
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

  console.log('workspaceData:', unjoinedChannels);

  const handleCreateChannel = async (data: { workspace?: string }) => {
    await createWorkspace(workspaceId, data.workspace);
  };

  const handleChannelClick = (channelId: number) => {
    setChannelId(channelId);
    setActiveChannelId(channelId); // 활성 채널 업데이트

    const chatData = {
      workspace: workspaceId,
      channelId: channelId,
    };

    localStorage.setItem('chat', JSON.stringify(chatData));
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
                      renderChannels(
                        joinedChannels,
                        handleChannelClick,
                        activeChannelId,
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* 두 번째 독립적인 Collapsible */}
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
                      renderChannels(
                        unjoinedChannels,
                        handleChannelClick,
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
