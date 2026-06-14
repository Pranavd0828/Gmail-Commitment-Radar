import React from 'react';
import { useStore } from '../../store/useStore';
import { InboxRow } from './InboxRow';
import { Square, RefreshCw, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

export const InboxList: React.FC = () => {
  const { threads, ui } = useStore();

  const filteredThreads = threads.filter(thread => {
    if (ui.searchQuery) {
      return thread.subject.toLowerCase().includes(ui.searchQuery.toLowerCase()) ||
             thread.participants.some(p => p.name.toLowerCase().includes(ui.searchQuery.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-grow m-2 bg-white shadow-sm rounded-t-xl overflow-hidden relative">
      {/* Fake Inbox Toolbar */}
      <div className="flex items-center px-3 py-1 border-b border-gmail-divider flex-shrink-0 bg-white">
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" aria-label="Select all">
            <Square size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors hidden sm:block" aria-label="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" aria-label="More">
            <MoreVertical size={18} />
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span className="hidden sm:inline">1-{filteredThreads.length} of 2,419</span>
          <span className="sm:hidden">1-{filteredThreads.length}</span>
          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" aria-label="Previous page"><ChevronLeft size={18} /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" aria-label="Next page"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Inbox Tabs (Simulated) */}
      <div className="flex border-b border-gmail-divider h-[48px] px-2 flex-shrink-0">
        <button className="flex items-center px-4 border-b-2 border-gmail-blue text-gmail-blue font-medium text-sm hover:bg-gray-50">
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clipRule="evenodd" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Primary
        </button>
        <button className="flex items-center px-4 border-b-2 border-transparent text-gmail-text-secondary font-medium text-sm hover:bg-gray-50">
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Promotions
        </button>
        <button className="flex items-center px-4 border-b-2 border-transparent text-gmail-text-secondary font-medium text-sm hover:bg-gray-50">
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Social
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-grow overflow-y-auto">
        {filteredThreads.map(thread => (
          <InboxRow key={thread.id} thread={thread} />
        ))}
        {filteredThreads.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gmail-text-secondary">
            No threads found.
          </div>
        )}
      </div>
    </div>
  );
};
