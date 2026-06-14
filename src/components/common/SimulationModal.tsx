import React from 'react';
import { useStore } from '../../store/useStore';
import { X, Calendar, CheckSquare, ExternalLink } from 'lucide-react';

export const SimulationModal: React.FC = () => {
  const { ui, setActiveSimulation, commitments } = useStore();
  
  if (!ui.activeSimulation) return null;
  
  const commitment = commitments.find(c => c.id === ui.activeSimulation?.commitmentId);
  if (!commitment) return null;

  const isTask = ui.activeSimulation.type === 'task';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] sm:max-h-none">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            {isTask ? (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <CheckSquare size={16} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Calendar size={16} />
              </div>
            )}
            <h3 className="font-semibold text-gray-800">
              {isTask ? 'Google Tasks (Simulation)' : 'Google Calendar (Simulation)'}
            </h3>
          </div>
          <button 
            onClick={() => setActiveSimulation(null)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-blue-50 text-blue-800 px-6 py-2 text-xs font-medium border-b border-blue-100 flex items-center">
          <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded mr-2 uppercase text-[10px] tracking-wider">Simulation</span>
          No actual data will be sent to Google {isTask ? 'Tasks' : 'Calendar'}
        </div>
        
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title</label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-800 font-medium">
              {commitment.normalized_action}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isTask ? 'Due Date' : 'Event Date'}
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-800">
              {commitment.due_date_text || 'No date specified'}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Source</label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-800 truncate">
              Email: {commitment.source_phrase}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={() => setActiveSimulation(null)}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => setActiveSimulation(null)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
              isTask ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>Open in {isTask ? 'Tasks' : 'Calendar'}</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
