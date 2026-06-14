import React, { useState } from 'react';
import { Menu, Search, SlidersHorizontal, HelpCircle, Settings, Grid, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const TopBar: React.FC = () => {
  const { ui, setSearchQuery, setIsSettingsOpen } = useStore();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  if (isMobileSearchOpen) {
    return (
      <div className="flex items-center justify-between h-16 px-2 border-b border-gmail-divider bg-white flex-shrink-0 z-10 sm:hidden">
        <button 
          className="p-3 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
          aria-label="Close search"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 px-2">
          <input 
            type="text" 
            placeholder="Search mail" 
            value={ui.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-4 py-2 border-none outline-none text-base text-gray-800"
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-16 px-2 sm:px-4 border-b border-gmail-divider bg-white flex-shrink-0 z-10">
      {/* Left section */}
      <div className="flex items-center w-auto sm:w-64 flex-shrink-0">
        <button 
          className="p-3 mr-1 hover:bg-gray-100 rounded-full text-gmail-text-secondary transition-colors" 
          aria-label="Main menu"
          onClick={() => useStore.getState().setLeftNavCollapsed(prev => !prev)}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <img 
            src="/gmail-logo.svg" 
            alt="Gmail" 
            className="h-10 ml-1"
          />
        </div>
      </div>

      {/* Middle section - Search */}
      <div className="flex-1 max-w-[720px] px-2 md:px-4 hidden sm:block">
        <div className="flex items-center bg-[#eaf1fb] rounded-full px-4 py-2 transition-shadow focus-within:bg-white focus-within:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <button className="p-2 mr-1 text-gray-600 hover:bg-gray-200 rounded-full flex-shrink-0" aria-label="Search">
            <Search size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Search mail" 
            value={ui.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-600 text-gray-800 min-w-0"
          />
          <button className="p-2 ml-1 text-gray-600 hover:bg-gray-200 rounded-full flex-shrink-0" aria-label="Search options">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center justify-end space-x-1 flex-shrink-0">
        <button 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
          onClick={() => setIsMobileSearchOpen(true)}
          aria-label="Open search"
        >
          <Search size={24} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden md:block" aria-label="Support">
          <HelpCircle size={24} />
        </button>
        <button 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Settings"
        >
          <Settings size={24} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block" aria-label="Google apps">
          <Grid size={24} />
        </button>
        <button className="p-1 ml-1 sm:ml-2" aria-label="Google Account">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
            P
          </div>
        </button>
      </div>
    </div>
  );
};
