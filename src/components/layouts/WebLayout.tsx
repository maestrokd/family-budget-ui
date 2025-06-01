import React, {type ReactNode} from 'react';
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/sidebar/app-sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {BreadcrumbComponent} from "@/components/BreadcrumbComponent.tsx";

interface LayoutProps {
  children: ReactNode;
}

const WebLayout: React.FC<LayoutProps> = ({children}) => {
  return (
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1"/>
              <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
              />
              <BreadcrumbComponent/>
            </div>
          </header>
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
};

export default WebLayout;
