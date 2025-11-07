import React from 'react';
import { DealStatus } from '../../types';

interface StatusPillProps {
  status: DealStatus;
}

const statusColors: Record<DealStatus, string> = {
  [DealStatus.Lead]: 'bg-slate-500/20 text-slate-300',
  [DealStatus.Contacted]: 'bg-blue-500/20 text-blue-300',
  [DealStatus.Documents]: 'bg-violet-500/20 text-violet-300',
  [DealStatus.Underwriting]: 'bg-warning/20 text-warning',
  [DealStatus.Approved]: 'bg-yellow-500/20 text-yellow-300',
  [DealStatus.Funded]: 'bg-accent/20 text-accent',
  [DealStatus.Rejected]: 'bg-danger/20 text-danger',
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