import * as React from "react"
import {BookOpen, Bot, Command, Frame, LifeBuoy, Map, PieChart, Send, Settings2, SquareTerminal,} from "lucide-react"

import {NavMain} from "@/components/sidebar/nav-main.tsx"
import {NavProjects} from "@/components/sidebar/nav-projects.tsx"
import {NavSecondary} from "@/components/sidebar/nav-secondary.tsx"
import {NavUser} from "@/components/sidebar/nav-user.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "#",
        },
        {
          title: "Health",
          url: "#web/health",
        },
        {
          title: "Health Test",
          url: "#web/health/test",
        },
        {
          title: "Health Tel Log",
          url: `#web/health/telegram/log`,
        },
        {
          title: "Health Tel",
          url: "#web/health/telegram",
        },
        {
          title: "Broken",
          url: "#dsfgds",
        },
        {
          title: "Settings",
          url: "#web/settings",
        },
        {
          title: "Sheet Profiles",
          url: "#web/sheet-profiles",
        },
        {
          title: "Sheet Profiles Tel",
          url: "#telegram/sheet-profiles",
        },
        {
          title: "Camera1",
          url: "#camera1",
        },
        {
          title: "Camera2",
          url: "#camera2",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Health",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Settings",
          url: "#web/settings",
        },
        {
          title: "Settings Telegram",
          url: "#telegram/settings",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div
                      className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4"/>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain}/>
          <NavProjects projects={data.projects}/>
          <NavSecondary items={data.navSecondary} className="mt-auto"/>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user}/>
        </SidebarFooter>
      </Sidebar>
  )
}
