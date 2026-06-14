import React from 'react';
import { useStore } from '../../store/useStore';
import { Inbox, Send, Clock, Star, File, ChevronDown, Target, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { applyCommitmentVisibilitySettings } from '../../utils/filterHelpers';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  badge?: number;
  isActive: boolean;
  isSpecial?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, badge, isActive, isSpecial, collapsed, onClick }) => (
  <button 
    className={clsx(
      "w-full flex items-center py-2 cursor-pointer transition-colors relative group border-none outline-none focus-visible:ring-2 focus-visible:ring-gmail-blue focus-visible:z-10",
      collapsed ? "px-0 justify-center w-12 mx-auto rounded-full h-12" : "px-6",
      isActive 
        ? (isSpecial ? "bg-ai-accent/10 text-ai-accent font-bold" : "bg-gmail-nav-selected text-gmail-blue font-bold")
        : "text-gmail-text hover:bg-gray-100 font-medium",
      collapsed && isActive && "bg-gmail-nav-selected"
    )}
    onClick={onClick}
    title={collapsed ? label : undefined}
    aria-label={label}
  >
    <div className={clsx("absolute left-0 top-0 bottom-0 w-1 rounded-r-full", isActive && !collapsed && (isSpecial ? "bg-ai-accent" : "bg-gmail-blue"))} />
    <Icon size={20} className={clsx(collapsed ? "" : "mr-4", isActive ? (isSpecial ? "text-ai-accent" : "text-gmail-blue") : "text-gmail-text-secondary")} />
    {!collapsed && (
      <>
        <span className="flex-grow text-sm text-left">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className={clsx(
            "text-xs font-bold",
            isSpecial ? "text-ai-accent" : (isActive ? "text-gmail-blue" : "text-gray-600")
          )}>
            {badge}
          </span>
        )}
      </>
    )}
    {collapsed && badge !== undefined && badge > 0 && (
      <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-white">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

export const LeftNav: React.FC = () => {
  const { ui, setActiveView, setLeftNavCollapsed, commitments, settings, threads } = useStore();
  
  const handleNavClick = (view: 'inbox' | 'dashboard') => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setLeftNavCollapsed(true);
    }
  };
  
  const visibleCommitments = applyCommitmentVisibilitySettings(commitments, threads, settings);
  const openCommitmentsCount = visibleCommitments.filter(c => c.status === 'Open' || c.status === 'Review').length;
  const unreadCount = threads.filter(t => t.unread).length;

  return (
    <nav className={clsx(
      "flex flex-col flex-shrink-0 bg-gmail-surface py-2 transition-all duration-200 z-30",
      ui.leftNavCollapsed ? "w-[72px] absolute md:relative h-full -translate-x-full md:translate-x-0" : "w-[256px] absolute md:relative h-full translate-x-0"
    )}>
      <div className={clsx("px-2 pb-4 pt-2", ui.leftNavCollapsed ? "flex justify-center" : "px-3")}>
        <button 
          className={clsx(
            "flex items-center justify-center bg-[#c2e7ff] hover:bg-[#b5dfff] text-gray-800 rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition-all font-medium",
            ui.leftNavCollapsed ? "w-14 h-14 rounded-2xl" : "px-5 py-4 w-[140px]"
          )}
          aria-label="Compose"
        >
          <svg className={clsx("text-gray-700", ui.leftNavCollapsed ? "w-6 h-6" : "w-6 h-6 mr-3")} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.46,6.38L14.07,0L12,2.07L16.29,6.38L12,10.69L14.07,12.76L20.46,6.38Z"></path>
          </svg>
          {!ui.leftNavCollapsed && "Compose"}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden">
        <NavItem 
          icon={Inbox} 
          label="Inbox" 
          badge={unreadCount > 0 ? unreadCount : undefined} 
          isActive={ui.activeView === 'inbox'} 
          collapsed={ui.leftNavCollapsed}
          onClick={() => handleNavClick('inbox')}
        />
        <NavItem icon={Star} label="Starred" isActive={false} collapsed={ui.leftNavCollapsed} onClick={() => {}} />
        <NavItem icon={Clock} label="Snoozed" isActive={false} collapsed={ui.leftNavCollapsed} onClick={() => {}} />
        <NavItem icon={Send} label="Sent" isActive={false} collapsed={ui.leftNavCollapsed} onClick={() => {}} />
        <NavItem icon={File} label="Drafts" isActive={false} collapsed={ui.leftNavCollapsed} onClick={() => {}} />
        <NavItem icon={ChevronDown} label="More" isActive={false} collapsed={ui.leftNavCollapsed} onClick={() => {}} />
        
        {!ui.leftNavCollapsed && (
          <div className="mt-4 mb-1">
            <span className="px-6 text-sm font-medium text-gray-500">Labels</span>
          </div>
        )}
        
        <div className={clsx("mt-2 pt-2", !ui.leftNavCollapsed && "border-t border-gmail-divider")}>
          <NavItem 
            icon={Target} 
            label="Commitment Radar" 
            isActive={ui.activeView === 'dashboard'} 
            isSpecial={true}
            badge={openCommitmentsCount}
            collapsed={ui.leftNavCollapsed}
            onClick={() => handleNavClick('dashboard')}
          />
        </div>
      </div>
    </nav>
  );
};
