import React, {type ReactNode} from 'react';
import {Toaster} from "@/components/ui/sonner.tsx";

interface LayoutProps {
    children: ReactNode;
}

const TelegramLayout: React.FC<LayoutProps> = ({children}) => {
    return (
        <>
            {/*<header className="flex h-16 shrink-0 items-center gap-2">*/}
            {/*    <div className="flex items-center gap-2 px-4">*/}
            {/*    </div>*/}
            {/*</header>*/}
            <main>{children}</main>
            <Toaster position="top-center"/>
        </>
    );
};

export default TelegramLayout;
