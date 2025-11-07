import React from 'react';
import { DealStatus } from '../../types';

interface StatusPillProps {
  status: DealStatus;
}

const statusColors: Record<DealStatus, string> = {
  [DealStatus.Lead]: 'bg-blue-500/20 text-blue-300',
  [DealStatus.ChaseDocs]: 'bg-cyan-500/20 text-cyan-300',
  [DealStatus.AppOut]: 'bg-violet-500/20 text-violet-300',
  [DealStatus.Underwriting]: 'bg-amber-500/20 text-amber-300',
  [DealStatus.Approved]: 'bg-yellow-500/20 text-yellow-300',
  [DealStatus.Funded]: 'bg-amber-400/20 text-amber-200',
  [DealStatus.Rejected]: 'bg-red-500/20 text-red-300',
};

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusPill;