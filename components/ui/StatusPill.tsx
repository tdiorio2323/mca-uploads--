import React from 'react';
import { DealStage, DealStageLabels } from '../../types';

interface StatusPillProps {
  stage: DealStage;
}

const stageColors: Record<DealStage, string> = {
  [DealStage.Leads]: 'bg-slate-500/20 text-slate-300',
  [DealStage.ChaseDocs]: 'bg-yellow-500/20 text-yellow-300',
  [DealStage.DocsIn]: 'bg-violet-500/20 text-violet-300',
  [DealStage.AppOut]: 'bg-blue-500/20 text-blue-300',
  [DealStage.HotLeads]: 'bg-orange-500/20 text-orange-300 font-bold',
  [DealStage.FollowUp]: 'bg-gray-500/20 text-gray-300',
};

const StatusPill: React.FC<StatusPillProps> = ({ stage }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageColors[stage]}`}
    >
      {DealStageLabels[stage]}
    </span>
  );
};

export default StatusPill;