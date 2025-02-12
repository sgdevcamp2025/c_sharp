import type { Meta, StoryObj } from '@storybook/react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import { ChevronRight } from 'lucide-react';

const meta: Meta<typeof Sidebar> = {
  title: 'Widget/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => {
    const data = {
      navMain: [
        {
          title: 'Group1',
          items: [
            {
              title: 'one',
              url: '#',
            },
            {
              title: 'two',
              url: '#',
            },
          ],
        },
        {
          title: 'Group2',
          items: [
            {
              title: 'three',
              url: '#',
            },
            {
              title: 'four',
              url: '#',
              isActive: true,
            },
          ],
        },
      ],
    };
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>#WSName</SidebarHeader>
          <SidebarContent className="gap-0">
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
                    className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <CollapsibleTrigger>
                      {item.title} <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
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
        <SidebarInset className="w-[428px]">
          <SidebarTrigger className="-ml-1" />
        </SidebarInset>
      </SidebarProvider>
    );
  },
};
