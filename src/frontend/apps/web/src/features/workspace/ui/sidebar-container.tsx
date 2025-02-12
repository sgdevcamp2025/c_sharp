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
import { ChevronRight } from 'lucide-react';

const SidebarContainer = ({ stockSlug }: { stockSlug: string }) => {
  const data = {
    navMain: [
      {
        title: '참여한 채널',
        items: [
          {
            title: 'one',
            url: '#',
          },
          {
            title: 'two',
            url: '#',
            isActive: true,
          },
        ],
      },
      {
        title: '전체 채널',
        items: [
          {
            title: 'three',
            url: '#',
          },
          {
            title: 'four',
            url: '#',
          },
        ],
      },
    ],
  };
  return (
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
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors px-4 py-2"
              >
                <CollapsibleTrigger>
                  {item.title}
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 opacity-70 group-hover/label:opacity-100" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.isActive}
                          className="px-8 py-1.5 text-sm text-white/80 hover:text-white transition-colors"
                        >
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
export default SidebarContainer;
