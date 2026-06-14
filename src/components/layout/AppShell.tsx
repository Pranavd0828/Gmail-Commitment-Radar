import React from 'react';
import { TopBar } from './TopBar';
import { LeftNav } from './LeftNav';
import { useStore } from '../../store/useStore';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ui, setLeftNavCollapsed } = useStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gmail-bg text-gmail-text-primary">
      <TopBar />
      <div className="flex flex-grow overflow-hidden relative">
        {/* Mobile overlay backdrop */}
        {!ui.leftNavCollapsed && (
          <div 
            className="md:hidden fixed inset-0 bg-black/20 z-20"
            onClick={() => setLeftNavCollapsed(true)}
          />
        )}
        <LeftNav />
        <main className="flex-grow flex flex-col overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
