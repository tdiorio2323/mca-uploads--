import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Deal, DealStage, DealStageLabels, RequiredDocuments, DocumentType } from '../../types';
import Skeleton from '../ui/Skeleton';

interface DealProfileViewProps {
  dealId: string;
  onBack: () => void;
}

const DealProfileView: React.FC<DealProfileViewProps> = ({ dealId, onBack }) => {
  const { deals, merchants, documents, tasks, notes, communications, setDeals } = useData();
  const [showOfferModal, setShowOfferModal] = useState(false);

  const deal = deals.find(d => d.id === dealId);
  const merchant = deal ? merchants.find(m => m.id === deal.merchantId) : null;
  const dealDocs = documents.filter(d => d.dealId === dealId);
  const dealTasks = tasks.filter(t => t.dealId === dealId);
  const dealNotes = notes.filter(n => n.dealId === dealId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const dealComms = communications.filter(c => c.dealId === dealId).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (!deal || !merchant) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Check for missing documents
  const requiredDocs = RequiredDocuments[deal.stage];
  const submittedDocTypes = new Set(dealDocs.map(d => d.type));
  const missingDocs = requiredDocs.filter(docType => !submittedDocTypes.has(docType));

  // Stage timeline
  const stageHistory = [
    { stage: DealStage.Leads, label: 'Lead Created', date: deal.createdAt },
    ...(deal.stage !== DealStage.Leads ? [{ stage: deal.stage, label: DealStageLabels[deal.stage], date: deal.updatedAt }] : []),
  ];

  const handleSendToLenders = () => {
    alert('Sending deal to lenders...\n\nThis would:\n1. Package all documents\n2. Send to lender network\n3. Track responses\n4. Update deal status to "App Out"');
    // TODO: Implement actual lender submission
  };

  const handleGenerateApp = () => {
    alert('Generating MCA application...\n\nThis would:\n1. Auto-fill merchant data\n2. Attach bank statements\n3. Include COJ and other docs\n4. Generate PDF application');
    // TODO: Implement application generation
  };

  const handleCreateOffer = () => {
    setShowOfferModal(true);
  };

  const handleMoveStage = (newStage: DealStage) => {
    setDeals(prevDeals =>
      prevDeals.map(d =>
        d.id === dealId
          ? {
              ...d,
              stage: newStage,
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  const daysSinceActivity = Math.floor((Date.now() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
  const isStale = daysSinceActivity > 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Deal {deal.id}</h1>
            <p className="text-slate-400">{merchant.businessName} · {merchant.industry}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            deal.stage === DealStage.HotLeads ? 'bg-orange-500 text-white' :
            deal.stage === DealStage.AppOut ? 'bg-blue-500/20 text-blue-300' :
            deal.stage === DealStage.DocsIn ? 'bg-violet-500/20 text-violet-300' :
            'bg-slate-500/20 text-slate-300'
          }`}>
            {DealStageLabels[deal.stage]}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            deal.priority === 'urgent' ? 'bg-red-500 text-white' :
            deal.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
            deal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-slate-500/20 text-slate-300'
          }`}>
            {deal.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {isStale && deal.stage !== DealStage.HotLeads && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="text-yellow-300 font-medium">Stale Deal</div>
            <div className="text-yellow-200/80 text-sm">No activity for {daysSinceActivity} days. Consider follow-up.</div>
          </div>
        </div>
      )}

      {missingDocs.length > 0 && (deal.stage === DealStage.ChaseDocs || deal.stage === DealStage.DocsIn) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="text-red-300 font-medium">Missing Required Documents</div>
            <div className="text-red-200/80 text-sm">
              Still need: {missingDocs.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Deal Terms */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Deal Terms</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-1">Requested Amount</div>
            <div className="text-2xl font-bold text-white">${deal.requestedAmount.toLocaleString()}</div>
          </div>

          {deal.approvedAmount && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Approved Amount</div>
              <div className="text-2xl font-bold text-green-400">${deal.approvedAmount.toLocaleString()}</div>
            </div>
          )}

          {deal.factorRate && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Factor Rate</div>
              <div className="text-2xl font-bold text-white">{deal.factorRate}</div>
            </div>
          )}

          {deal.paybackAmount && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Total Payback</div>
              <div className="text-2xl font-bold text-orange-400">${deal.paybackAmount.toLocaleString()}</div>
            </div>
          )}

          {deal.termInDays && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Term</div>
              <div className="text-2xl font-bold text-white">{deal.termInDays} days</div>
              <div className="text-sm text-slate-400">({(deal.termInDays / 30).toFixed(1)} months)</div>
            </div>
          )}

          {deal.paybackAmount && deal.approvedAmount && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Cost of Capital</div>
              <div className="text-2xl font-bold text-yellow-400">
                ${(deal.paybackAmount - deal.approvedAmount).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">
                ({(((deal.paybackAmount - deal.approvedAmount) / deal.approvedAmount) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleSendToLenders}
          disabled={missingDocs.length > 0 || deal.stage === DealStage.AppOut}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send to Lenders
        </button>

        <button
          onClick={handleGenerateApp}
          disabled={missingDocs.length > 0}
          className="bg-violet-500 hover:bg-violet-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Application
        </button>

        <button
          onClick={handleCreateOffer}
          disabled={!deal.approvedAmount}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Create Offer Sheet
        </button>
      </div>

      {/* Timeline & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
          <div className="space-y-3">
            {dealDocs.length === 0 ? (
              <p className="text-slate-400 text-sm">No documents uploaded</p>
            ) : (
              dealDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{doc.type}</div>
                      <div className="text-xs text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    doc.status === 'verified' ? 'bg-green-500/20 text-green-300' :
                    doc.status === 'received' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {missingDocs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-sm font-medium text-yellow-300 mb-2">Still Needed:</div>
              <div className="flex flex-wrap gap-2">
                {missingDocs.map(docType => (
                  <span key={docType} className="px-2 py-1 bg-yellow-500/10 text-yellow-300 text-xs rounded border border-yellow-500/30">
                    {docType}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[...dealNotes, ...dealComms.slice(0, 3)].slice(0, 5).map((item, idx) => {
              const isNote = 'content' in item;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {isNote ? 'Note added' : item.subject}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(isNote ? item.createdAt : item.timestamp).toLocaleString()}
                    </div>
                    {isNote && (
                      <div className="text-sm text-slate-300 mt-1">{item.content}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {dealNotes.length === 0 && dealComms.length === 0 && (
              <p className="text-slate-400 text-sm">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Tasks */}
      {dealTasks.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks</h3>
          <div className="space-y-2">
            {dealTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    className="w-4 h-4 rounded border-slate-600"
                  />
                  <div>
                    <div className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Movement (Quick Actions) */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Move Deal Stage</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(DealStage).map(stage => (
            <button
              key={stage}
              onClick={() => handleMoveStage(stage)}
              disabled={deal.stage === stage}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                deal.stage === stage
                  ? 'bg-blue-500 text-white cursor-default'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {DealStageLabels[stage]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealProfileView;
