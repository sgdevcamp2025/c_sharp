'use client';

import { useEffect, useState } from 'react';

import { ChevronRight, CirclePlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
import { QUERY_KEYS, useChatId } from '@/src/shared';

import WorkspaceModal from './workspace-modal';

import { getWorkspaceList, WorkspaceListResponse } from '../api';
import { createWorkspace } from '../api/create-channel.api';
import { useWorkspaceMessages, useWorkspaceSubscription } from '../model';
import { getWorkspaceId } from '../lib';

const renderChannels = (
  channels: any[] | undefined,
  onChannelClick: (channelId: number) => void,
) => {
  if (!channels || channels.length === 0) {
    return (
      <div className="px-8 py-2 text-sm text-white/50">채널이 없습니다</div>
    );
  }

  return channels.map((channel) => (
    <SidebarMenuItem key={channel.channelId}>
      <SidebarMenuButton
        asChild
        className="px-8 py-1.5 text-sm text-white/80 hover:text-white transition-colors"
        onClick={() => onChannelClick(channel.channelId)}
      >
        <span>{channel.channelName}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
};

const SidebarContainer = ({ stockSlug }: { stockSlug: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const workspaceId = getWorkspaceId(stockSlug);
  const { setChannelId } = useChatId();
  const { subscribe } = useWorkspaceSubscription(workspaceId);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [subscribe]);

  const { data: workspaceSocketMessage } = useWorkspaceMessages(workspaceId);

  console.log('workspaceSocketMessage:', workspaceSocketMessage);

  const {
    data: workspaceData,
    isLoading,
    error,
    refetch,
  } = useQuery<WorkspaceListResponse>({
    queryKey: QUERY_KEYS.workspaceList(workspaceId),
    queryFn: () => getWorkspaceList(workspaceId),
    enabled: workspaceId !== -1,
    staleTime: 60 * 1000,
  });

  if (error) return <div>Error: {String(error)}</div>;
  if (workspaceId === -1) return <div>Error: Invalid workspace id</div>;

  // console.log('workspaceData:', workspaceData);

  const handleCreateChannel = async (data: { workspace?: string }) => {
    await createWorkspace(workspaceId, data.workspace);
    refetch();
  };

  const handleChannelClick = (channelId: number) => {
    setChannelId(channelId);

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
                  가입된 채널
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
                        workspaceData?.joinedChannels,
                        handleChannelClick,
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
                  미가입된 채널
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
                        workspaceData?.unjoinedChannels,
                        handleChannelClick,
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
