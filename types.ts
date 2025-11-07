// MCA Pipeline Stages - Exact order matters
export enum DealStage {
  Leads = 'leads',
  ChaseDocs = 'chase_docs',
  DocsIn = 'docs_in',
  AppOut = 'app_out',
  HotLeads = 'hot_leads',
  FollowUp = 'follow_up',
}

// MCA-specific document types
export enum DocumentType {
  BankStatements = 'bank_statements',
  VoidedCheck = 'voided_check',
  COJ = 'COJ', // Confession of Judgment
  DriverLicense = 'driver_license',
  Application = 'application',
  CreditPullAuthorization = 'credit_pull_authorization',
  Other = 'other',
}

export enum DocumentStatus {
  Pending = 'pending',
  Received = 'received',
  Verified = 'verified',
}

export enum CommunicationType {
  Email = 'Email',
  Call = 'Call',
  Meeting = 'Meeting',
  SMS = 'SMS',
}

// MCA Merchant with industry-specific fields
export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  monthlyRevenue: number;
  averageDailyBalance: number;
  industry: string;
  state: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  creditScore?: number;
  createdAt: string;
  lastContactedAt?: string;
}

// MCA Deal with financing-specific fields
export interface Deal {
  id: string;
  merchantId: string;
  stage: DealStage;
  requestedAmount: number;
  approvedAmount: number | null;
  factorRate: number | null; // e.g., 1.25 means $1.25 paid back per $1 funded
  paybackAmount: number | null;
  termInDays: number | null;
  assignedBrokerId: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface BankStatementParsed {
  totalDeposits: number;
  nsfCount: number;
  avgDailyBalance: number;
  largestDeposit: number;
  redFlags: string[];
  monthsCovered: number;
}

export interface Document {
  id: string;
  dealId: string | null;
  merchantId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  url: string;
  uploadedAt: string;
  verifiedAt?: string;
  parsedData?: BankStatementParsed | null;
}

export interface Communication {
  id: string;
  merchantId: string;
  dealId?: string;
  type: CommunicationType;
  subject: string;
  body: string;
  timestamp: string;
  outcome?: string;
}

export interface Task {
  id: string;
  merchantId: string;
  dealId: string | null;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string;
  color: string;
  merchantId?: string;
  dealId?: string;
}

export interface Note {
  id: string;
  merchantId: string;
  dealId?: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export type View = 'dashboard' | 'deals' | 'merchants' | 'calendar' | 'merchant-profile' | 'deal-profile';

// Helper to get display name for stages
export const DealStageLabels: Record<DealStage, string> = {
  [DealStage.Leads]: 'Leads',
  [DealStage.ChaseDocs]: 'Chase Docs',
  [DealStage.DocsIn]: 'Docs In',
  [DealStage.AppOut]: 'App Out',
  [DealStage.HotLeads]: 'Hot Leads',
  [DealStage.FollowUp]: 'Follow Up',
};

// Required documents per stage
export const RequiredDocuments: Record<DealStage, DocumentType[]> = {
  [DealStage.Leads]: [],
  [DealStage.ChaseDocs]: [
    DocumentType.BankStatements,
    DocumentType.VoidedCheck,
    DocumentType.COJ,
    DocumentType.DriverLicense,
  ],
  [DealStage.DocsIn]: [
    DocumentType.BankStatements,
    DocumentType.VoidedCheck,
    DocumentType.COJ,
    DocumentType.DriverLicense,
  ],
  [DealStage.AppOut]: [
    DocumentType.BankStatements,
    DocumentType.VoidedCheck,
    DocumentType.COJ,
    DocumentType.DriverLicense,
    DocumentType.Application,
  ],
  [DealStage.HotLeads]: [],
  [DealStage.FollowUp]: [],
};