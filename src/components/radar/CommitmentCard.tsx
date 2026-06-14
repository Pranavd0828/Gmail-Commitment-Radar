import React, { useState } from 'react';
import type { Commitment } from '../../types';
import { Target, CheckCircle, Clock, Calendar, Check, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getRelativeDueLabel } from '../../utils/dateHelpers';
import clsx from 'clsx';

export const CommitmentCard: React.FC<{ commitment: Commitment, expanded?: boolean }> = ({ commitment, expanded: forceExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const [showExplanation, setShowExplanation] = useState(false);
  const { updateCommitmentStatus, updateCommitment, selectThread, setPanelOpen, ui, setActiveDraftCommitmentId, showSnackbar, setActiveSimulation } = useStore();

  const handleMarkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCommitmentStatus(commitment.id, 'Done');
  };

  const openThread = () => {
    selectThread(commitment.thread_id);
    setPanelOpen(true); 
  };

  const getRiskColor = () => {
    if (commitment.risk_level === 'High') return 'text-risk-high';
    if (commitment.risk_level === 'Medium') return 'text-risk-medium';
    return 'text-risk-low';
  };

  const getRiskBg = () => {
    return 'bg-white hover:bg-gray-50';
  };

  // Only hide if standard panel view is open (All, You owe, etc.) but respect filter
  const isResolved = commitment.status === 'Done' || commitment.status === 'Dismissed' || commitment.status === 'Snoozed';
  if (isResolved && ui.activeFilter !== commitment.status) {
    return null;
  }

  return (
    <div 
      className={clsx(
        "border rounded-xl mb-3 overflow-hidden transition-all duration-200",
        isExpanded ? "border-gmail-blue shadow-md" : "border-gray-200 hover:border-gray-300 shadow-sm",
        commitment.status === 'Done' ? "opacity-60" : ""
      )}
    >
      {/* Card Header (Compact View) */}
      <div 
        className={clsx(
          "p-3 cursor-pointer select-none relative",
          getRiskBg()
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Priority indicator bar */}
        <div className={clsx("absolute left-0 top-0 bottom-0 w-1", 
          commitment.risk_level === 'High' ? "bg-red-500" : 
          commitment.risk_level === 'Medium' ? "bg-orange-400" : "bg-green-400")} 
        />
        
        <div className="flex justify-between items-start pl-2">
          <div className="flex-grow pr-2">
            <div className="flex items-center mb-1">
              <span className={clsx("text-[11px] font-bold uppercase tracking-wide", getRiskColor())}>
                {commitment.risk_level} Risk
              </span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-xs text-gray-600 font-medium">
                {commitment.owner_type === 'me' ? 'You owe' : 'They owe'}
              </span>
              {commitment.status !== 'Open' && commitment.status !== 'Review' && (
                <span className="ml-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 bg-gray-200 px-1 rounded">
                  {commitment.status}
                </span>
              )}
            </div>
            <h3 className={clsx(
              "text-[15px] font-medium text-gray-900 leading-tight mb-1",
              commitment.status === 'Done' ? "line-through text-gray-500" : ""
            )}>
              {commitment.normalized_action}
            </h3>
            <div className="text-xs text-gray-500 flex items-center flex-wrap mt-0.5">
              <span className="truncate max-w-[120px] md:max-w-[150px]">{commitment.recipient_name}</span>
              {commitment.due_date_text && (
                <>
                  <span className="mx-1.5">•</span>
                  <span className={clsx(
                    "whitespace-nowrap",
                    commitment.risk_level === 'High' && commitment.status === 'Open' ? "text-risk-high font-medium" : ""
                  )}>
                    Due: {commitment.due_date_text}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Quick Actions (Compact) */}
          {!isExpanded && commitment.status === 'Open' && (
            <div className="flex space-x-1 mt-1">
              <button 
                className="p-1.5 text-gray-400 hover:bg-white hover:text-green-600 rounded-full"
                onClick={handleMarkDone}
                title="Mark Done"
              >
                <Check size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-white border-t border-gray-100">
          <div className="p-3">
            <div className="bg-gray-50 p-2.5 rounded-lg text-sm text-gray-700 italic border-l-2 border-gray-300 mb-3">
              "{commitment.source_phrase}"
            </div>

            {/* Explanation Drawer Toggle */}
            <button 
              className="flex items-center text-xs text-ai-accent font-medium mb-3 hover:underline focus-visible:ring-2 focus-visible:ring-ai-accent outline-none rounded"
              onClick={(e) => { e.stopPropagation(); setShowExplanation(!showExplanation); }}
            >
              <Target size={12} className="mr-1" />
              Why am I seeing this?
              <div className={clsx("transition-transform duration-200", showExplanation ? "rotate-180" : "")}>
                <ChevronDown size={12} className="ml-1" />
              </div>
            </button>

            {/* Explanation Drawer Content */}
            <div className={clsx(
              "overflow-hidden transition-all duration-200 ease-in-out",
              showExplanation ? "max-h-48 opacity-100 mb-3" : "max-h-0 opacity-0"
            )}>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-gray-600 space-y-2">
                <p>{commitment.explanation}</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 mt-2 border-t border-blue-100/50">
                  <span className="font-medium text-gray-500 mb-2 sm:mb-0">Confidence: {commitment.confidence_score}%</span>
                  <div className="flex space-x-3 sm:space-x-2">
                    <button className="text-gray-500 hover:text-gmail-blue text-left" onClick={(e) => { 
                      e.stopPropagation(); 
                      const isMe = commitment.owner_type === 'me';
                      updateCommitment(commitment.id, { 
                        owner_type: isMe ? 'other_person' : 'me',
                        owner_name: isMe ? commitment.recipient_name : 'Me',
                        explanation: `Feedback recorded: Owner manually changed.`
                      });
                      showSnackbar("Feedback recorded: Owner updated"); 
                    }}>Wrong owner</button>
                    <button className="text-gray-500 hover:text-gmail-blue text-left" onClick={(e) => { 
                      e.stopPropagation(); 
                      if (commitment.due_date) {
                        const newDate = new Date(commitment.due_date);
                        newDate.setDate(newDate.getDate() + 1);
                        
                        const relativeText = getRelativeDueLabel(newDate.toISOString()) || 'Later';
                        
                        updateCommitment(commitment.id, { 
                          due_date: newDate.toISOString(), 
                          due_date_text: relativeText,
                          explanation: `Feedback recorded: Due date deferred.`
                        });
                      }
                      showSnackbar("Feedback recorded: Date deferred"); 
                    }}>Wrong date</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Actions */}
            {commitment.status === 'Open' && (
              <div className="flex flex-col space-y-2 mb-3">
                {commitment.suggested_actions.filter(a => a.primary).map(action => (
                  <button 
                    key={action.id}
                    className="w-full py-1.5 bg-gmail-blue text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (action.type === 'draft_reply' || action.type === 'draft_follow_up') {
                        openThread();
                        setActiveDraftCommitmentId(commitment.id);
                      } else if (action.type === 'create_task') {
                        setActiveSimulation({ type: 'task', commitmentId: commitment.id });
                      }
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Secondary Actions Row */}
            {commitment.status === 'Open' ? (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex space-x-1">
                  <button 
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full flex items-center justify-center"
                    onClick={handleMarkDone}
                    title="Mark done"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button 
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCommitmentStatus(commitment.id, 'Snoozed');
                    }}
                    title="Snooze"
                  >
                    <Clock size={18} />
                  </button>
                  <button 
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full flex items-center justify-center"
                    title="Add to Calendar"
                    onClick={(e) => { e.stopPropagation(); setActiveSimulation({ type: 'calendar', commitmentId: commitment.id }); }}
                  >
                    <Calendar size={18} />
                  </button>
                </div>
                
                <button 
                  className="text-xs font-medium text-gray-500 hover:text-gmail-blue px-2 py-1 rounded hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCommitmentStatus(commitment.id, 'Dismissed');
                  }}
                >
                  Not a commitment
                </button>
              </div>
            ) : (
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button 
                  className="text-xs font-medium text-gmail-blue hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCommitmentStatus(commitment.id, 'Open');
                  }}
                >
                  Undo {commitment.status}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
