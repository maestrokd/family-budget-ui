import React, {type ReactNode} from 'react';

interface LayoutProps {
  children: ReactNode;
}

const TelegramLayout: React.FC<LayoutProps> = ({children}) => {
  return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
          </div>
        </header>
        <main>{children}</main>
      </>
  );
};

export default TelegramLayout;
