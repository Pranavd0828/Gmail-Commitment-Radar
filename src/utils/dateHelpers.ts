import { SIMULATED_CURRENT_DATE } from '../data/mockData';

export const getRelativeDueLabel = (
  targetDateIso: string | null,
  baseDateIso: string = SIMULATED_CURRENT_DATE
): string | null => {
  if (!targetDateIso) return null;

  const targetDate = new Date(targetDateIso);
  const baseDate = new Date(baseDateIso);

  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return 'Next week';
  
  return 'Later';
};
