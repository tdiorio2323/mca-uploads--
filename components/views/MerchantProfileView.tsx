import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Merchant, Deal, Document, Communication, Note, DealStage, DealStageLabels, DocumentType, CommunicationType } from '../../types';
import Skeleton from '../ui/Skeleton';

interface MerchantProfileViewProps {
  merchantId: string;
  onBack: () => void;
}

type TabType = 'business' | 'financials' | 'documents' | 'notes';

const MerchantProfileView: React.FC<MerchantProfileViewProps> = ({ merchantId, onBack }) => {
  const { merchants, deals, documents, communications, notes, setNotes, loading } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('business');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMerchant, setEditedMerchant] = useState<Merchant | null>(null);
  const [newNote, setNewNote] = useState('');

  const merchant = merchants.find(m => m.id === merchantId);
  const merchantDeals = deals.filter(d => d.merchantId === merchantId);
  const merchantDocs = documents.filter(d => d.merchantId === merchantId);
  const merchantComms = communications.filter(c => c.merchantId === merchantId);
  const merchantNotes = notes.filter(n => n.merchantId === merchantId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading || !merchant) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleEdit = () => {
    setEditedMerchant({ ...merchant });
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMerchant(null);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      merchantId: merchant.id,
      content: newNote,
      createdAt: new Date().toISOString(),
      createdBy: 'broker-1',
    };

    setNotes([...notes, note]);
    setNewNote('');
  };

  const displayMerchant = isEditing && editedMerchant ? editedMerchant : merchant;

  // Calculate MCA metrics
  const totalRequested = merchantDeals.reduce((sum, d) => sum + d.requestedAmount, 0);
  const totalApproved = merchantDeals.reduce((sum, d) => sum + (d.approvedAmount || 0), 0);
  const activeDeal = merchantDeals.find(d =>
    d.stage === DealStage.HotLeads || d.stage === DealStage.AppOut || d.stage === DealStage.DocsIn
  );

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
            <h1 className="text-2xl font-bold text-white">{displayMerchant.businessName}</h1>
            <p className="text-slate-400">{displayMerchant.industry} · {displayMerchant.state}</p>
          </div>
        </div>
        {activeTab === 'business' && !isEditing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Edit Details
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-lg">
          <div className="text-sm text-slate-400">Monthly Revenue</div>
          <div className="text-2xl font-bold text-white">${(displayMerchant.monthlyRevenue / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-lg">
          <div className="text-sm text-slate-400">Avg Daily Balance</div>
          <div className="text-2xl font-bold text-white">${(displayMerchant.averageDailyBalance / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-lg">
          <div className="text-sm text-slate-400">Total Requested</div>
          <div className="text-2xl font-bold text-white">${(totalRequested / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-lg">
          <div className="text-sm text-slate-400">Active Deals</div>
          <div className="text-2xl font-bold text-white">{merchantDeals.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'business' as TabType, label: 'Business Info' },
            { id: 'financials' as TabType, label: 'Financials' },
            { id: 'documents' as TabType, label: 'Documents' },
            { id: 'notes' as TabType, label: 'Notes & Calls' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        {activeTab === 'business' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Business Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedMerchant?.businessName || ''}
                    onChange={e => setEditedMerchant(prev => prev ? { ...prev, businessName: e.target.value } : null)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{displayMerchant.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Owner Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedMerchant?.ownerName || ''}
                    onChange={e => setEditedMerchant(prev => prev ? { ...prev, ownerName: e.target.value } : null)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{displayMerchant.ownerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedMerchant?.email || ''}
                    onChange={e => setEditedMerchant(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{displayMerchant.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedMerchant?.phone || ''}
                    onChange={e => setEditedMerchant(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{displayMerchant.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedMerchant?.industry || ''}
                    onChange={e => setEditedMerchant(prev => prev ? { ...prev, industry: e.target.value } : null)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{displayMerchant.industry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedMerchant?.state || ''}
                    onChange={e => setEditedMerchant(prev => prev ? { ...prev, state: e.target.value } : null)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{displayMerchant.state}</p>
                )}
              </div>

              {displayMerchant.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <p className="text-white">
                    {displayMerchant.address.street}<br />
                    {displayMerchant.address.city}, {displayMerchant.address.state} {displayMerchant.address.zip}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Financial Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400">Monthly Revenue</div>
                <div className="text-2xl font-bold text-green-400">${displayMerchant.monthlyRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400">Avg Daily Balance</div>
                <div className="text-2xl font-bold text-blue-400">${displayMerchant.averageDailyBalance.toLocaleString()}</div>
              </div>
              {displayMerchant.creditScore && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Credit Score</div>
                  <div className={`text-2xl font-bold ${
                    displayMerchant.creditScore >= 750 ? 'text-green-400' :
                    displayMerchant.creditScore >= 650 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {displayMerchant.creditScore}
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-3">MCA History</h3>
            <div className="space-y-3">
              {merchantDeals.length === 0 ? (
                <p className="text-slate-400">No MCA history yet</p>
              ) : (
                merchantDeals.map(deal => (
                  <div key={deal.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-medium">Deal #{deal.id}</div>
                        <div className="text-sm text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        deal.stage === DealStage.HotLeads ? 'bg-orange-500/20 text-orange-300' :
                        deal.stage === DealStage.AppOut ? 'bg-blue-500/20 text-blue-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {DealStageLabels[deal.stage]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <div className="text-slate-400">Requested</div>
                        <div className="text-white font-mono">${(deal.requestedAmount / 1000).toFixed(0)}k</div>
                      </div>
                      {deal.approvedAmount && (
                        <div>
                          <div className="text-slate-400">Approved</div>
                          <div className="text-green-400 font-mono">${(deal.approvedAmount / 1000).toFixed(0)}k</div>
                        </div>
                      )}
                      {deal.factorRate && (
                        <div>
                          <div className="text-slate-400">Factor Rate</div>
                          <div className="text-white font-mono">{deal.factorRate}</div>
                        </div>
                      )}
                      {deal.paybackAmount && (
                        <div>
                          <div className="text-slate-400">Payback</div>
                          <div className="text-white font-mono">${(deal.paybackAmount / 1000).toFixed(0)}k</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Documents</h2>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
                Upload Document
              </button>
            </div>

            <div className="space-y-3">
              {merchantDocs.length === 0 ? (
                <p className="text-slate-400">No documents uploaded yet</p>
              ) : (
                merchantDocs.map(doc => (
                  <div key={doc.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">{doc.name}</div>
                        <div className="text-sm text-slate-400">
                          {doc.type} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.status === 'verified' ? 'bg-green-500/20 text-green-300' :
                        doc.status === 'received' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {doc.status}
                      </span>
                      <button className="text-blue-400 hover:text-blue-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notes & Communication Log</h2>

            {/* Add Note */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note about this merchant..."
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 min-h-24"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {[...merchantNotes, ...merchantComms.map(c => ({ ...c, type: 'comm' as const }))]
                .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
                .map((item, idx) => {
                  const isNote = 'content' in item;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        {isNote ? (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-white font-medium">
                              {isNote ? 'Note' : item.subject}
                            </div>
                            <div className="text-sm text-slate-400">
                              {new Date(isNote ? item.createdAt : item.timestamp).toLocaleString()}
                              {!isNote && ` · ${item.type}`}
                            </div>
                          </div>
                          {!isNote && item.outcome && (
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                              {item.outcome}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm">
                          {isNote ? item.content : item.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantProfileView;
