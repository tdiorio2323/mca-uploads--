import React, { useState, useCallback } from 'react';
import { Merchant, View, Document as Doc, Deal as DealType, Task as TaskType, Communication, BankStatementParsed, DocumentType } from '../../types';
import { mockParsedStatement } from '../../data/mockData';
import { useData } from '../../contexts/DataContext';
import ScoreBadge from '../ui/ScoreBadge';
import StatusPill from '../ui/StatusPill';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import TaskModal from './TaskModal';

// Dummy Icon Components
const FileIcon: React.FC<{className?: string}> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>);
const EmailIcon: React.FC<{className?: string}> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>);
const PhoneIcon: React.FC<{className?: string}> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>);
const CheckCircleIcon: React.FC<{className?: string}> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const ExclamationCircleIcon: React.FC<{className?: string}> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>);
const ClockIcon: React.FC<{className?: string}> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const UploadIcon: React.FC<{className?: string}> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>);
const EditIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);


type Tab = 'overview' | 'documents' | 'activity' | 'deals' | 'tasks';

const MerchantProfileView: React.FC<{ merchant: Merchant; setView: (view: View) => void }> = ({ merchant, setView }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
        <ScoreBadge score={merchant.creditScore} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{merchant.name}</h2>
          <p className="text-slate-400">{merchant.legalName}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2 text-slate-500" /> {merchant.phone}</div>
            <div className="flex items-center"><EmailIcon className="w-4 h-4 mr-2 text-slate-500" /> {merchant.email}</div>
            <div className="flex items-center"><FileIcon className="w-4 h-4 mr-2 text-slate-500" /> {merchant.industry}</div>
          </div>
        </div>
        <div>
          <Button onClick={() => { /* TODO: Implement new deal logic */ }}>New Deal</Button>
        </div>
      </div>

      <div>
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['overview', 'documents', 'activity', 'deals', 'tasks'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${ activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500' }`}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-6">
          {activeTab === 'overview' && <OverviewTab merchant={merchant} />}
          {activeTab === 'documents' && <DocumentsTab merchantId={merchant.id} />}
          {activeTab === 'activity' && <ActivityTab merchantId={merchant.id} />}
          {activeTab === 'deals' && <DealsTab merchantId={merchant.id} />}
          {activeTab === 'tasks' && <TasksTab merchantId={merchant.id} />}
        </div>
      </div>
    </div>
  );
};


const OverviewTab: React.FC<{ merchant: Merchant }> = ({ merchant }) => (
    <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Merchant Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 text-sm">
            <div><dt className="text-slate-400">Owner</dt><dd className="text-white mt-1">{merchant.owner}</dd></div>
            <div><dt className="text-slate-400">Address</dt><dd className="text-white mt-1">{`${merchant.address.street}, ${merchant.address.city}, ${merchant.address.state} ${merchant.address.zip}`}</dd></div>
            <div><dt className="text-slate-400">Annual Revenue</dt><dd className="text-white mt-1 font-mono">${merchant.annualRevenue.toLocaleString()}</dd></div>
            <div><dt className="text-slate-400">NSF Count (90 days)</dt><dd className="text-white mt-1 font-mono">{merchant.nsfCount90Days}</dd></div>
        </dl>
    </div>
);

const DocumentsTab: React.FC<{ merchantId: string }> = ({ merchantId }) => {
    const { documents: allDocs } = useData();
    const [documents, setDocuments] = useState<Doc[]>(allDocs.filter(d => d.merchantId === merchantId));
    const [parsing, setParsing] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
    const [viewingDoc, setViewingDoc] = useState<Doc | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    type UploadStatus = { progress: number; status: 'uploading' | 'success' | 'error'; error?: string };
    const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadStatus>>({});

    const handleFileUpload = (file: File, docId: string) => {
      // Simulate file upload
      const interval = setInterval(() => {
        setUploadStatuses(prev => {
            const currentProgress = prev[docId]?.progress ?? 0;
            if (currentProgress >= 100) {
                clearInterval(interval);
                return prev;
            }
            return { ...prev, [docId]: { ...prev[docId], progress: currentProgress + 10 }};
        });
      }, 150);

      setTimeout(() => {
        clearInterval(interval);
        const isSuccess = Math.random() > 0.2; // 80% success rate
        setUploadStatuses(prev => ({
            ...prev,
            [docId]: {
                progress: 100,
                status: isSuccess ? 'success' : 'error',
                error: isSuccess ? undefined : 'Upload failed. Please try again.'
            }
        }));

        if (isSuccess) {
            // Simulate parsing for bank statements
            if (file.name.toLowerCase().includes('bank')) {
                setDocuments(prevDocs => prevDocs.map(d => d.id === docId ? {...d, type: DocumentType.BankStatement} : d));
                setTimeout(() => {
                    setParsing(true);
                    setSelectedDoc(documents.find(d => d.id === docId) || null);
                    setTimeout(() => {
                        setDocuments(prevDocs => prevDocs.map(d => d.id === docId ? {...d, parsedData: mockParsedStatement} : d));
                        setSelectedDoc(prev => prev ? {...prev, parsedData: mockParsedStatement} : null);
                        setParsing(false);
                    }, 2000);
                }, 500);
            }
        }
      }, 1500 + Math.random() * 1000);
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const newUploads: Doc[] = [];
        Array.from(files).forEach((file, i) => {
            const docId = `upload-${Date.now()}-${i}`;
            const newDoc: Doc = {
                id: docId,
                merchantId,
                dealId: null,
                name: file.name,
                type: DocumentType.Application, // Default type
                url: '#',
                uploadedAt: new Date().toISOString(),
            };
            newUploads.push(newDoc);
            setUploadStatuses(prev => ({ ...prev, [docId]: { progress: 0, status: 'uploading' }}));
            handleFileUpload(file, docId);
        });
        setDocuments(prev => [...prev, ...newUploads]);
    };
    
    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); };
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleFiles(e.dataTransfer.files);
    };
    
    const openDocument = (doc: Doc) => {
        const uploadStatus = uploadStatuses[doc.id];
        if (uploadStatus?.status === 'uploading' || uploadStatus?.status === 'error') return;
        setViewingDoc(doc);
    };
    
    const dismissStatus = (docId: string) => {
        setUploadStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[docId];
            return newStatuses;
        });
    };

    return (
        <>
        <Modal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} title={viewingDoc?.name || ''}>
            <div className="bg-slate-900 p-4 rounded-md text-center">
                <p className="text-white">Document Preview Placeholder for</p>
                <p className="font-semibold text-accent mt-2">{viewingDoc?.name}</p>
                <p className="text-sm text-slate-400 mt-4">(A real implementation would render the PDF or image here)</p>
            </div>
        </Modal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg space-y-4">
                <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
                <div 
                    onDragEnter={onDragEnter}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${isDraggingOver ? 'border-accent bg-slate-700/50' : 'border-slate-600 hover:border-accent'}`}
                >
                    <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-slate-300">
                        <span className="text-accent font-semibold cursor-pointer">Upload a file</span> or drag and drop
                    </label>
                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
                    <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
                {documents.length > 0 ? (
                    <ul className="space-y-2">
                        {documents.map(doc => {
                            const status = uploadStatuses[doc.id];
                            return (
                                <li key={doc.id} className={`p-2 rounded-md transition-colors duration-200 ${selectedDoc?.id === doc.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}>
                                    <div
                                        onClick={() => openDocument(doc)}
                                        className={`flex items-center justify-between ${!status || status.status === 'success' ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <FileIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            <span className="text-sm font-medium text-white truncate block">{doc.name}</span>
                                        </div>
                                        {doc.parsedData && !status && <span className="text-xs font-semibold text-amber-400 ml-2 flex-shrink-0">Parsed</span>}
                                    </div>
                                    
                                    {status?.status === 'uploading' && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                                                <span>Uploading...</span>
                                                <span className="font-medium text-slate-300">{status.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-600 rounded-full h-1.5">
                                                <div className="bg-accent h-1.5 rounded-full" style={{ width: `${status.progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                    {status?.status === 'success' && (
                                        <div className="mt-2 p-2 rounded-md bg-amber-500/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircleIcon className="w-5 h-5 text-amber-400" />
                                                    <p className="text-sm text-amber-300">Upload complete.</p>
                                                </div>
                                                <button onClick={() => dismissStatus(doc.id)} className="text-slate-400 hover:text-white p-0.5 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {status?.status === 'error' && (
                                        <div className="mt-2 p-2 rounded-md bg-red-500/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                    <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                                                    <p className="text-sm text-red-300 truncate">{status.error || 'Upload failed'}</p>
                                                </div>
                                                <button onClick={() => dismissStatus(doc.id)} className="text-slate-400 hover:text-white p-0.5 rounded-full ml-2">
                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <EmptyState icon={FileIcon} title="No Documents" message="Upload documents to get started." />
                )}
            </div>
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Analysis Preview</h3>
                {parsing ? <AnalysisSkeleton /> : selectedDoc?.parsedData ? <ParsedFieldsEditor parsedData={selectedDoc.parsedData} /> : <p className="text-slate-400">Select a parsed document to view analysis, or upload a new bank statement.</p>}
            </div>
        </div>
        </>
    );
}

const AnalysisSkeleton = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
    </div>
);

const ParsedFieldsEditor: React.FC<{ parsedData: BankStatementParsed }> = ({ parsedData }) => {
    // This would have state and onChange handlers in a real app
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm text-slate-400">Total Deposits</label><input type="text" defaultValue={parsedData.totalDeposits.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} className="mt-1 w-full bg-slate-700 rounded-md p-2 font-mono text-white"/></div>
                <div><label className="block text-sm text-slate-400">NSF Count</label><input type="text" defaultValue={parsedData.nsfCount} className="mt-1 w-full bg-slate-700 rounded-md p-2 font-mono text-white"/></div>
                <div><label className="block text-sm text-slate-400">Avg. Daily Balance</label><input type="text" defaultValue={parsedData.avgDailyBalance.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} className="mt-1 w-full bg-slate-700 rounded-md p-2 font-mono text-white"/></div>
                <div><label className="block text-sm text-slate-400">Largest Deposit</label><input type="text" defaultValue={parsedData.largestDeposit.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} className="mt-1 w-full bg-slate-700 rounded-md p-2 font-mono text-white"/></div>
            </div>
            <div>
                <label className="block text-sm text-slate-400">Red Flags</label>
                <ul className="mt-1 list-disc list-inside space-y-1">
                    {parsedData.redFlags.map((flag, i) => <li key={i} className="text-sm text-red-400">{flag}</li>)}
                </ul>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary">Discard</Button>
                <Button onClick={() => console.log('// TODO: API Call to save parsed data')}>Confirm & Save</Button>
            </div>
        </div>
    );
};

const ActivityTab: React.FC<{ merchantId: string }> = ({ merchantId }) => {
    const { communications: allComms } = useData();
    const activities = allComms.filter(c => c.merchantId === merchantId);

    if (activities.length === 0) return <EmptyState icon={ClockIcon} title="No Activity" message="Calls, emails, and meetings will appear here." />;
    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
            <div className="flow-root"><ul className="-mb-8">
                {activities.map((activity, idx) => (
                <li key={activity.id}><div className="relative pb-8">
                    {idx !== activities.length - 1 ? <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-700" /> : null}
                    <div className="relative flex space-x-3">
                        <div><span className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center ring-8 ring-slate-800">{activity.type === 'Email' ? <EmailIcon className="h-5 w-5 text-slate-300" /> : <PhoneIcon className="h-5 w-5 text-slate-300" />}</span></div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                                <p className="text-sm text-slate-400">{activity.subject} <span className="font-medium text-white">{new Date(activity.timestamp).toLocaleDateString()}</span></p>
                                <p className="mt-1 text-sm text-slate-300">{activity.body}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-slate-500"><time dateTime={activity.timestamp}>{new Date(activity.timestamp).toLocaleTimeString()}</time></div>
                        </div>
                    </div>
                </div></li>
                ))}
            </ul></div>
        </div>
    );
}

const DealsTab: React.FC<{ merchantId: string }> = ({ merchantId }) => {
    const { deals: allDeals } = useData();
    const deals = allDeals.filter(d => d.merchantId === merchantId);

    if (deals.length === 0) return <EmptyState icon={FileIcon} title="No Deals" message="Create a new deal for this merchant." action={<Button>New Deal</Button>} />;

    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg overflow-hidden">
             <table className="min-w-full divide-y divide-slate-700">
                <thead><tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-800">
                    {deals.map(deal => (
                        <tr key={deal.id}>
                            <td className="px-6 py-4 font-mono text-white">${deal.amountRequested.toLocaleString()}</td>
                            <td className="px-6 py-4"><StatusPill status={deal.status} /></td>
                            <td className="px-6 py-4 text-sm text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    );
};

const TasksTab: React.FC<{ merchantId: string }> = ({ merchantId }) => {
    const { tasks: allTasks, setTasks: setAllTasks } = useData();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<TaskType> | null>(null);
    
    const tasks = allTasks.filter(t => t.merchantId === merchantId);

    const toggleTask = (taskId: string) => {
        setAllTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, completed: !t.completed} : t));
        // TODO: API Call to update task status
    };

    const handleEditTask = (task: TaskType) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleNewTaskClick = () => {
        setEditingTask({
            title: '',
            dueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            completed: false,
        });
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = (updatedTask: Partial<TaskType>) => {
        let finalDueDate = updatedTask.dueDate;

        // Ensure dueDate from date picker is converted to UTC ISO string
        if (updatedTask.dueDate && !updatedTask.dueDate.includes('T')) {
            const parts = updatedTask.dueDate.split('-').map(Number);
            finalDueDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).toISOString();
        }

        if (updatedTask.id) { // Update existing task
            setAllTasks(prevTasks => prevTasks.map(t => {
                if (t.id === updatedTask.id) {
                    return { ...t, ...updatedTask, dueDate: finalDueDate || t.dueDate };
                }
                return t;
            }));
            // TODO: API call to update existing task
        } else { // Create new task
            const newTask: TaskType = {
                id: `t-${Date.now()}`,
                merchantId: merchantId,
                dealId: null, // For simplicity, new tasks are not linked to deals
                title: updatedTask.title || 'Untitled Task',
                dueDate: finalDueDate || new Date().toISOString(),
                completed: false,
            };
            setAllTasks(prevTasks => [...prevTasks, newTask]);
            // TODO: API call to create new task
        }
        
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    const handleCloseModal = () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    if (tasks.length === 0) return (
        <EmptyState 
            icon={CheckCircleIcon} 
            title="No Tasks" 
            message="Create a new task to stay on top of your deals." 
            action={<Button onClick={handleNewTaskClick}>Create Task</Button>}
        />
    );
    
    return (
        <>
            {isTaskModalOpen && editingTask && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTask}
                    task={editingTask}
                />
            )}
            <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Tasks</h3>
                    <Button onClick={handleNewTaskClick} size="sm">New Task</Button>
                </div>
                <div className="space-y-3">
                    {tasks
                        .sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .map(task => (
                        <div key={task.id} className="flex items-center group">
                            <input id={`task-${task.id}`} type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-accent focus:ring-accent" />
                            <label htmlFor={`task-${task.id}`} className={`ml-3 text-sm flex-1 ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</label>
                            <span className={`ml-auto text-xs font-mono pr-2 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-400' : 'text-slate-400'}`}>{new Date(task.dueDate).toLocaleDateString()}</span>
                            <button onClick={() => handleEditTask(task)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white p-1 -m-1">
                                <span className="sr-only">Edit task</span>
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MerchantProfileView;
