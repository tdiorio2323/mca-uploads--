import React, { useState } from 'react';
import { Deal, DealStatus, Merchant, View } from '../../types';
import StatusPill from '../ui/StatusPill';
import { useData } from '../../contexts/DataContext';
import Skeleton from '../ui/Skeleton';

const DealCard: React.FC<{ 
  deal: Deal; 
  merchant?: Merchant; 
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
  onDragEnd: () => void;
}> = ({ deal, merchant, isDragging, onDragStart, onDragEnd }) => {
  if (!merchant) return null;
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      className={`mb-3 cursor-grab rounded-md border border-white/10 bg-white/10 backdrop-blur-lg p-3 transition-all duration-200 hover:shadow-lg active:cursor-grabbing ${isDragging ? 'relative opacity-75 scale-105 shadow-2xl drop-shadow-[0_5px_15px_rgba(16,185,129,0.3)] z-10' : 'shadow-sm'}`}
    >
      <div className="flex justify-between">
        <h4 className="font-semibold text-white">{merchant.name}</h4>
        <div className="text-sm font-mono text-slate-300">${deal.amountRequested.toLocaleString()}</div>
      </div>
      <p className="text-sm text-slate-400">{merchant.industry}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-500">Updated: {new Date(deal.updatedAt).toLocaleDateString()}</div>
        <div className="flex -space-x-2">
            <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-800" src="https://picsum.photos/id/1005/50/50" alt="Broker"/>
        </div>
      </div>
    </div>
  );
};

const KanbanSkeleton: React.FC = () => {
    const statuses = Object.values(DealStatus);
    return (
        <div className="flex h-full w-full space-x-4 overflow-x-auto pb-4">
            {statuses.map(status => (
                <div key={status} className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-white/5 backdrop-blur-lg border border-white/10">
                    <div className="flex items-center justify-between p-3 border-b-2 border-slate-700">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-8 rounded-full" />
                    </div>
                    <div className="p-3 space-y-3">
                        <Skeleton className="h-20 w-full rounded-md" />
                        <Skeleton className="h-20 w-full rounded-md" />
                        <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
};


const DealsKanbanView: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
  const { deals, setDeals, merchants, loading } = useData();
  const [draggedOverColumn, setDraggedOverColumn] = useState<DealStatus | null>(null);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const statuses = Object.values(DealStatus);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
    setDraggedDealId(dealId);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
  };

  const handleDrop = (targetStatus: DealStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    // Optimistic update
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === dealId ? { ...deal, status: targetStatus, updatedAt: new Date().toISOString() } : deal
      )
    );
    setDraggedOverColumn(null);
    setDraggedDealId(null);
    // TODO: Call API to persist change
    // api.updateDealStatus(dealId, targetStatus);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (status: DealStatus) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };
  
  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };
  
  if (loading) {
      return <KanbanSkeleton />;
  }

  return (
    <div className="flex h-full w-full space-x-4 overflow-x-auto pb-4">
      {statuses.map(status => (
        <div
          key={status}
          onDrop={handleDrop(status)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={handleDragEnter(status)}
          className={`flex w-80 flex-shrink-0 flex-col rounded-lg bg-white/5 backdrop-blur-lg border transition-all duration-300 ${draggedOverColumn === status ? 'bg-accent/10 border-accent shadow-lg' : 'border-white/10'}`}
        >
          <div className="flex items-center justify-between p-3 border-b-2 border-slate-700">
            <div className="flex items-center space-x-2">
              <StatusPill status={status} />
              <h3 className="font-semibold text-white">{status}</h3>
            </div>
            <span className="text-sm font-medium text-slate-400 bg-slate-700 rounded-full px-2 py-0.5">{deals.filter(d => d.status === status).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {deals.filter(deal => deal.status === status).map(deal => {
              const merchant = merchants.find(m => m.id === deal.merchantId);
              return <DealCard 
                key={deal.id} 
                deal={deal} 
                merchant={merchant} 
                isDragging={draggedDealId === deal.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealsKanbanView;