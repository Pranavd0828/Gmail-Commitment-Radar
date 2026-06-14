import React from 'react';
import type { Message, Commitment } from '../../types';
import { useStore } from '../../store/useStore';
import { Target, CornerUpLeft, MoreVertical, Star } from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { DraftComposer } from './DraftComposer';
import { SIMULATED_CURRENT_DATE } from '../../data/mockData';

export const MessageCard: React.FC<{ message: Message, isLast: boolean, commitments: Commitment[] }> = ({ message, isLast, commitments }) => {
  const { setPanelOpen, selectCommitment, ui, setActiveDraftCommitmentId } = useStore();
  
  // Find if any commitment belonging to this message is the active draft
  const activeDraftCommitment = commitments.find(c => c.id === ui.activeDraftCommitmentId && c.message_id === message.id);
  const isDraftActive = !!activeDraftCommitment;

  const getSourcePhraseHighlight = (text: string, commitments: Commitment[]) => {
    if (!commitments.length) return text;

    let result: React.ReactNode[] = [text];

    commitments.forEach(commitment => {
      if (!commitment.source_phrase || commitment.status === 'Dismissed') return;

      const newResult: React.ReactNode[] = [];
      result.forEach(part => {
        if (typeof part === 'string') {
          const parts = part.split(commitment.source_phrase);
          parts.forEach((p, i) => {
            newResult.push(p);
            if (i < parts.length - 1) {
              newResult.push(
                <span 
                  key={`${commitment.id}-${i}`}
                  className={clsx(
                    "cursor-pointer transition-colors relative group",
                    ui.selectedCommitmentId === commitment.id 
                      ? "bg-yellow-200 border-b-2 border-yellow-400 font-medium"
                      : "bg-yellow-100/50 border-b-2 border-yellow-300 hover:bg-yellow-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCommitment(commitment.id);
                    setPanelOpen(true);
                  }}
                >
                  {commitment.source_phrase}
                  
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                    <Target size={12} className="text-ai-accent mr-1.5" />
                    {commitment.risk_level === 'High' ? 'High risk: ' : ''}
                    {commitment.owner_type === 'me' ? 'You owe' : 'They owe'}
                  </span>
                </span>
              );
            }
          });
        } else {
          newResult.push(part);
        }
      });
      result = newResult;
    });

    return result;
  };

  const formatMessageTime = (isoString: string) => {
    const date = parseISO(isoString);
    const isSimulatedToday = isoString.split('T')[0] === SIMULATED_CURRENT_DATE.split('T')[0];
    return isSimulatedToday ? format(date, 'h:mm a') : format(date, 'MMM d, yyyy, h:mm a');
  };

  return (
    <div className="mb-2">
      <div className={clsx(
        "flex",
        !isLast && "mb-4 border-b border-gray-100 pb-4"
      )}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-lg flex-shrink-0 mr-4">
          {message.sender_name.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
            <div className="mb-1 sm:mb-0">
              <span className="font-bold text-gray-900 mr-2">{message.sender_name}</span>
              <span className="text-sm text-gray-500 hidden sm:inline">&lt;{message.sender_email}&gt;</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-500">
              <span className="text-xs">{formatMessageTime(message.sent_at)}</span>
              <button className="hover:text-gray-700" aria-label="Star message"><Star size={18} /></button>
              <button 
                className="hover:text-gray-700"
                aria-label="Reply"
                onClick={() => {
                  const firstDraftable = commitments.find(c => c.draft_reply);
                  if (firstDraftable) {
                    setActiveDraftCommitmentId(firstDraftable.id);
                  }
                }}
              >
                <CornerUpLeft size={18} />
              </button>
              <button className="hover:text-gray-700" aria-label="More options"><MoreVertical size={18} /></button>
            </div>
          </div>

          <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {getSourcePhraseHighlight(message.body, commitments)}
          </div>
        </div>
      </div>

      {isDraftActive && activeDraftCommitment && (
        <div className="ml-14">
          <DraftComposer 
            message={message} 
            commitment={activeDraftCommitment}
            onCancel={() => setActiveDraftCommitmentId(null)}
          />
        </div>
      )}
    </div>
  );
};
