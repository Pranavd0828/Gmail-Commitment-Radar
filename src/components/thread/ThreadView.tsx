import React from 'react';
import { useStore } from '../../store/useStore';
import { MessageCard } from './MessageCard';
import { ArrowLeft, Archive, Trash2, Mail, Clock, MoreVertical, Target } from 'lucide-react';

export const ThreadView: React.FC = () => {
  const { ui, threads, commitments, setActiveView, setPanelOpen, selectCommitment } = useStore();
  const thread = threads.find(t => t.id === ui.selectedThreadId);

  if (!thread) return null;

  const threadCommitments = commitments.filter(c => c.thread_id === thread.id);
  const activeCommitments = threadCommitments.filter(c => c.status !== 'Dismissed');
  const openCommitments = activeCommitments.filter(c => c.status === 'Open');

  return (
    <div className="flex flex-col flex-grow bg-white m-2 rounded-t-xl shadow-sm overflow-hidden">
      {/* Thread Toolbar */}
      <div className="flex items-center h-[48px] px-2 border-b border-gray-100 flex-shrink-0 text-gray-600 bg-white sticky top-0 z-10">
        <button 
          className="p-2 hover:bg-gray-100 rounded-full mr-2 focus-visible:ring-2 focus-visible:ring-gmail-blue outline-none transition-colors"
          onClick={() => setActiveView('inbox')}
          aria-label="Back to inbox"
        >
          <ArrowLeft size={18} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full mx-0.5 transition-colors hidden md:block" aria-label="Archive"><Archive size={18} /></button>
        <button className="p-2 hover:bg-gray-100 rounded-full mx-0.5 transition-colors hidden md:block" aria-label="Report spam">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full mx-0.5 transition-colors" aria-label="Delete"><Trash2 size={18} /></button>
        <div className="w-px h-5 bg-gray-200 mx-2 hidden md:block"></div>
        <button className="p-2 hover:bg-gray-100 rounded-full mx-0.5 transition-colors" aria-label="Mark as unread"><Mail size={18} /></button>
        <button className="p-2 hover:bg-gray-100 rounded-full mx-0.5 transition-colors hidden md:block" aria-label="Snooze"><Clock size={18} /></button>
        <button className="p-2 hover:bg-gray-100 rounded-full mx-0.5 transition-colors hidden md:block" aria-label="Add to Tasks">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        </button>
        <div className="flex-grow"></div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="More"><MoreVertical size={18} /></button>
      </div>

      <div className="flex-grow overflow-y-auto px-4 py-4 md:px-16 md:py-6">
        {/* Subject and Commitment Summary */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl text-gray-900 font-normal mb-4">{thread.subject}</h2>
          
          {openCommitments.length > 0 && (
            <button 
              className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
              onClick={() => {
                selectCommitment(openCommitments[0].id);
                setPanelOpen(true);
              }}
            >
              <Target size={16} className="mr-2 text-ai-accent" />
              {openCommitments.length} open commitment{openCommitments.length > 1 ? 's' : ''} 
              {openCommitments[0].due_date_text ? ` · Due ${openCommitments[0].due_date_text}` : ''}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {thread.messages.map((message, index) => (
            <MessageCard 
              key={message.id} 
              message={message} 
              isLast={index === thread.messages.length - 1} 
              commitments={threadCommitments.filter(c => c.message_id === message.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
