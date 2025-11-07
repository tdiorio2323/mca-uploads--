export enum DealStatus {
  Lead = 'Lead',
  Contacted = 'Contacted',
  Documents = 'Documents',
  Underwriting = 'Underwriting',
  Approved = 'Approved',
  Funded = 'Funded',
  Rejected = 'Rejected',
}

export enum DocumentType {
  BankStatement = 'Bank Statement',
  Application = 'Application',
  TaxReturn = 'Tax Return',
  DriversLicense = 'Driver\'s License',
}

export enum CommunicationType {
  Email = 'Email',
  Call = 'Call',
  Meeting = 'Meeting',
}

export interface Merchant {
  id: string;
  name: string;
  legalName: string;
  owner: string;
  industry: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  creditScore: number;
  annualRevenue: number;
  nsfCount90Days: number;
}

export interface Deal {
  id: string;
  merchantId: string;
  amountRequested: number;
  status: DealStatus;
  assignedBrokerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankStatementParsed {
  totalDeposits: number;
  nsfCount: number;
  avgDailyBalance: number;
  largestDeposit: number;
  redFlags: string[];
}

export interface Document {
  id: string;
  dealId: string | null;
  merchantId: string;
  name: string;
  type: DocumentType;
  url: string; // Placeholder for file path or URL
  uploadedAt: string;
  parsedData?: BankStatementParsed | null;
}

export interface Communication {
  id: string;
  merchantId: string;
  type: CommunicationType;
  subject: string;
  body: string;
  timestamp: string;
}

export interface Task {
  id: string;
  merchantId: string;
  dealId: string | null;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string YYYY-MM-DD
  end: string;   // ISO date string YYYY-MM-DD
  allDay: boolean;
  description?: string;
  color: string; // Tailwind bg color class
}


export type View = 'dashboard' | 'deals' | 'merchants' | 'calendar';