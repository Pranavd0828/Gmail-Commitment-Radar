import React, { useState } from 'react';
import type { Thread, Commitment } from '../../types';
import { useStore } from '../../store/useStore';
import { Square, Star, Clock, Archive, Trash2, Mail, Target } from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { SIMULATED_CURRENT_DATE } from '../../data/mockData';

export const InboxRow: React.FC<{ thread: Thread }> = ({ thread }) => {
  const { selectThread, selectCommitment, setPanelOpen, commitments, settings } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const threadCommitments = commitments.filter(c => c.thread_id === thread.id);
  const activeCommitment = threadCommitments.find(c => c.status === 'Open' || c.status === 'Review' || c.status === 'Done');

  const getBadgeStyle = (commitment: Commitment) => {
    if (commitment.status === 'Done') return 'bg-green-100 text-green-800';
    if (commitment.status === 'Review') return 'bg-purple-100 text-purple-800';
    if (commitment.owner_type === 'me') {
      return commitment.risk_level === 'High' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
    }
    if (commitment.owner_type === 'other_person') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getBadgeText = (commitment: Commitment) => {
    if (commitment.status === 'Done') return 'Done';
    if (commitment.status === 'Review') return 'Review';
    if (commitment.owner_type === 'me') return `You owe ${commitment.due_date_text ? `· ${commitment.due_date_text}` : ''}`;
    if (commitment.owner_type === 'other_person') return 'They owe';
    return 'Waiting';
  };

  const formatTime = (isoString: string) => {
    const date = parseISO(isoString);
    
    // Simulate isToday by comparing date strings YYYY-MM-DD
    const isSimulatedToday = isoString.split('T')[0] === SIMULATED_CURRENT_DATE.split('T')[0];
    return isSimulatedToday ? format(date, 'h:mm a') : format(date, 'MMM d');
  };

  const handleRowClick = () => {
    selectThread(thread.id);
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCommitment) {
      selectThread(thread.id);
      selectCommitment(activeCommitment.id);
      setPanelOpen(true);
    }
  };

  return (
    <div 
      className={clsx(
        "px-3 md:px-2 py-2 md:py-0 border-b border-gray-100 cursor-pointer group hover:shadow-md relative",
        thread.unread ? "font-bold text-gray-900 bg-white" : "text-gray-600 bg-gray-50/50",
        activeCommitment?.risk_level === 'High' && activeCommitment.status === 'Open' ? "border-l-4 border-l-red-500 pl-2 md:pl-1" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
    >
      {/* Mobile Layout (< md) */}
      <div className="flex flex-col w-full md:hidden">
        <div className="flex items-center justify-between mb-1 gap-3">
          <div className="flex items-center space-x-2 overflow-hidden min-w-0 flex-1">
            <span className="truncate min-w-0">
              {thread.participants.map(p => p.name).join(', ')}
            </span>
            {settings.showInboxBadges && activeCommitment && (
              <button 
                onClick={handleBadgeClick}
                className={clsx(
                  "flex items-center flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none",
                  getBadgeStyle(activeCommitment)
                )}
                aria-label={`Commitment: ${getBadgeText(activeCommitment)}`}
              >
                <Target size={10} className="mr-1" />
                {activeCommitment.status === 'Done' ? 'Done' :
                 activeCommitment.status === 'Review' ? 'Review' :
                 activeCommitment.owner_type === 'me' ? 'You' : 'Them'}
              </button>
            )}
          </div>
          <div className="flex items-center flex-shrink-0 space-x-2 text-gray-500">
            <button className="p-1 hover:text-gray-700" aria-label="Star thread" onClick={(e) => e.stopPropagation()}>
              <Star size={16} className={thread.starred ? "text-yellow-400 fill-yellow-400" : ""} />
            </button>
            <span className="text-xs font-normal">{formatTime(thread.last_message_at)}</span>
          </div>
        </div>
        <div className="text-sm truncate">
          <span className="mr-1">{thread.subject}</span>
          <span className={thread.unread ? "text-gray-500 font-normal" : "text-gray-500"}>
            - {thread.messages[thread.messages.length - 1].snippet}
          </span>
        </div>
      </div>

      {/* Desktop Layout (md+) */}
      <div className="hidden md:flex items-center w-full h-10">
        <div className="flex items-center w-16 flex-shrink-0 text-gray-400">
          <button className="p-1 hover:text-gray-600" aria-label="Select thread" onClick={(e) => e.stopPropagation()}><Square size={18} /></button>
          <button className="p-1 ml-1 hover:text-gray-600" aria-label="Star thread" onClick={(e) => e.stopPropagation()}>
            <Star size={18} className={thread.starred ? "text-yellow-400 fill-yellow-400" : ""} />
          </button>
        </div>

        <div className="w-48 truncate pr-4 text-sm">
          {thread.participants.map(p => p.name).join(', ')}
        </div>

        <div className="flex-grow flex items-center min-w-0 pr-4">
          <span className="text-sm truncate">
            <span className="mr-2">{thread.subject}</span>
            <span className={thread.unread ? "text-gray-500 font-normal" : "text-gray-500"}>
              - {thread.messages[thread.messages.length - 1].snippet}
            </span>
          </span>
        </div>

        {settings.showInboxBadges && activeCommitment && (
          <div className="flex-shrink-0 mr-4">
            <button 
              onClick={handleBadgeClick}
              className={clsx(
                "px-3 py-0.5 rounded-full text-xs font-medium border border-transparent hover:border-gray-300 transition-colors",
                getBadgeStyle(activeCommitment)
              )}
            >
              {getBadgeText(activeCommitment)}
            </button>
          </div>
        )}

        <div className="w-24 flex-shrink-0 text-right pr-4 text-xs font-medium text-gray-600 flex items-center justify-end">
          {isHovered ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <button className="hover:text-gray-700" aria-label="Archive" title="Archive" onClick={(e) => e.stopPropagation()}><Archive size={18} /></button>
              <button className="hover:text-gray-700" aria-label="Delete" title="Delete" onClick={(e) => e.stopPropagation()}><Trash2 size={18} /></button>
              <button className="hover:text-gray-700" aria-label="Mark unread" title="Mark unread" onClick={(e) => e.stopPropagation()}><Mail size={18} /></button>
              <button className="hover:text-gray-700" aria-label="Snooze" title="Snooze" onClick={(e) => e.stopPropagation()}><Clock size={18} /></button>
              {activeCommitment && (
                <button className="hover:text-ai-accent text-ai-accent" onClick={handleBadgeClick} aria-label="Open in Radar" title="Open in Radar">
                  <Target size={18} />
                </button>
              )}
            </div>
          ) : (
            <span>{formatTime(thread.last_message_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
