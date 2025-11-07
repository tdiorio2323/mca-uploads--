import React, { useState } from 'react';
import { Deal, DealStage, DealStageLabels, Merchant, View, RequiredDocuments, DocumentType } from '../../types';
import StatusPill from '../ui/StatusPill';
import { useData } from '../../contexts/DataContext';
import Skeleton from '../ui/Skeleton';

const DealCard: React.FC<{
  deal: Deal;
  merchant?: Merchant;
  missingDocs?: DocumentType[];
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
  onDragEnd: () => void;
  onClick: (dealId: string) => void;
}> = ({ deal, merchant, missingDocs, isDragging, onDragStart, onDragEnd, onClick }) => {
  if (!merchant) return null;

  const isHotLead = deal.stage === DealStage.HotLeads;
  const hasMissingDocs = missingDocs && missingDocs.length > 0;
  const daysSinceActivity = Math.floor((Date.now() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
  const isStale = daysSinceActivity > 7;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        // Only navigate if not dragging
        if (!isDragging && e.currentTarget === e.target) {
          onClick(deal.id);
        }
      }}
      className={`mb-3 cursor-pointer rounded-md border p-3 transition-all duration-200 hover:shadow-lg ${
        isDragging
          ? 'relative opacity-75 scale-105 shadow-2xl drop-shadow-[0_5px_15px_rgba(16,185,129,0.3)] z-10 cursor-grabbing'
          : 'shadow-sm'
      } ${
        isHotLead
          ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400 animate-pulse-slow'
          : 'bg-white/10 backdrop-blur-lg border-white/10'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{merchant.businessName}</h4>
            {isHotLead && (
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">HOT</span>
            )}
            {deal.priority === 'urgent' && !isHotLead && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">URGENT</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">{merchant.industry} · {merchant.state}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-white font-semibold">${(deal.requestedAmount / 1000).toFixed(0)}k</div>
          {deal.approvedAmount && (
            <div className="text-xs text-green-400 font-mono">${(deal.approvedAmount / 1000).toFixed(0)}k @ {deal.factorRate}</div>
          )}
        </div>
      </div>

      {hasMissingDocs && (
        <div className="mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
          Missing: {missingDocs.join(', ')}
        </div>
      )}

      {isStale && deal.stage !== DealStage.HotLeads && (
        <div className="mt-2 px-2 py-1 bg-slate-500/20 border border-slate-500/30 rounded text-xs text-slate-400">
          No activity for {daysSinceActivity} days
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {new Date(deal.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{merchant.ownerName}</div>
          <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-800" src={`https://ui-avatars.com/api/?name=${merchant.ownerName}&background=1e293b&color=fff`} alt="Broker"/>
        </div>
      </div>
    </div>
  );
};

const KanbanSkeleton: React.FC = () => {
    const stages = Object.values(DealStage);
    return (
        <div className="flex h-full w-full space-x-4 overflow-x-auto pb-4">
            {stages.map(stage => (
                <div key={stage} className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-white/5 backdrop-blur-lg border border-white/10">
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


const DealsKanbanView: React.FC<{ setView: (view: View, merchantId?: string, dealId?: string) => void }> = ({ setView }) => {
  const { deals, setDeals, merchants, documents, loading } = useData();
  const [draggedOverColumn, setDraggedOverColumn] = useState<DealStage | null>(null);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const stages = Object.values(DealStage);

  // Helper to get missing documents for a deal
  const getMissingDocuments = (deal: Deal): DocumentType[] => {
    const requiredDocs = RequiredDocuments[deal.stage];
    if (requiredDocs.length === 0) return [];

    const dealDocs = documents.filter(d => d.dealId === deal.id);
    const submittedDocTypes = new Set(dealDocs.map(d => d.type));

    return requiredDocs.filter(docType => !submittedDocTypes.has(docType));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
    setDraggedDealId(dealId);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
  };

  const handleDrop = (targetStage: DealStage) => (e: React.DragEvent) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');

    // Optimistic update
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === dealId
          ? {
              ...deal,
              stage: targetStage,
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
            }
          : deal
      )
    );
    setDraggedOverColumn(null);
    setDraggedDealId(null);

    // TODO: When moving to Chase Docs, trigger document checklist creation
    // TODO: Call API to persist change
    // api.updateDealStage(dealId, targetStage);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (stage: DealStage) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggedOverColumn(stage);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDealClick = (dealId: string) => {
    setView('deal-profile', undefined, dealId);
  };

  if (loading) {
      return <KanbanSkeleton />;
  }

  return (
    <div className="flex h-full w-full space-x-4 overflow-x-auto pb-4">
      {stages.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage);
        const isHotLeads = stage === DealStage.HotLeads;

        return (
          <div
            key={stage}
            onDrop={handleDrop(stage)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter(stage)}
            className={`flex w-80 flex-shrink-0 flex-col rounded-lg backdrop-blur-lg border transition-all duration-300 ${
              draggedOverColumn === stage
                ? 'bg-accent/10 border-accent shadow-lg'
                : isHotLeads
                ? 'bg-gradient-to-b from-orange-500/10 to-red-500/10 border-orange-400'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className={`flex items-center justify-between p-3 border-b-2 ${isHotLeads ? 'border-orange-500' : 'border-slate-700'}`}>
              <div className="flex items-center space-x-2">
                {isHotLeads && <span className="text-orange-400">🔥</span>}
                <h3 className="font-semibold text-white">{DealStageLabels[stage]}</h3>
              </div>
              <span className={`text-sm font-medium rounded-full px-2 py-0.5 ${
                isHotLeads
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {stageDeals.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {stageDeals.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  No deals in this stage
                </div>
              ) : (
                stageDeals.map(deal => {
                  const merchant = merchants.find(m => m.id === deal.merchantId);
                  const missingDocs = getMissingDocuments(deal);

                  return (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      merchant={merchant}
                      missingDocs={missingDocs}
                      isDragging={draggedDealId === deal.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={handleDealClick}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealsKanbanView;