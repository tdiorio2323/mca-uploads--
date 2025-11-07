import { Merchant, Deal, Document, Communication, Task, DealStatus, DocumentType, CommunicationType, BankStatementParsed } from '../types';

// --- Data for Generation ---
const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
const companyNouns = ['Market', 'Solutions', 'Group', 'Enterprises', 'Services', 'Industries', 'Builders', 'Foods', 'Logistics', 'Ventures'];
const companyAdjectives = ['Global', 'Dynamic', 'Innovative', 'Reliable', 'Apex', 'Summit', 'Pioneer', 'Precision', 'Quantum', 'Stellar'];
const industries = ['Food Service', 'Construction', 'Retail', 'Automotive', 'Healthcare', 'Tech', 'Logistics', 'Manufacturing'];
const streetNames = ['Main St', 'Park Ave', 'Oak St', 'Washington Blvd', 'Maple Ave', 'Pine St'];
const cities = ['Brooklyn', 'New York', 'Queens', 'Bronx', 'Staten Island'];

// --- Seeded PRNG for deterministic results ---
let seed = 1;
function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
const randInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
const randElement = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

export const mockParsedStatement: BankStatementParsed = {
  totalDeposits: 125430.55,
  nsfCount: 2,
  avgDailyBalance: 8750.21,
  largestDeposit: 15200.00,
  redFlags: ['Multiple same-day small deposits', 'Large wire transfer to personal account'],
};

export const generateAllMockData = (merchants: Merchant[]) => {
  if (merchants.length === 0) {
    return { deals: [], documents: [], communications: [], tasks: [] };
  }

  const deals: Deal[] = Array.from({ length: 40 }, (_, i) => {
    const merchant = randElement(merchants);
    const createdAt = new Date(Date.now() - randInt(1, 90) * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + randInt(1, 14) * 24 * 60 * 60 * 1000);
    return {
        id: `d-${i + 1}`,
        merchantId: merchant.id,
        amountRequested: randInt(10, 500) * 1000,
        status: randElement(Object.values(DealStatus)),
        assignedBrokerId: `b-${randInt(1, 2)}`,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
    };
  });

  const documents: Document[] = Array.from({ length: 80 }, (_, i) => {
      const deal = randElement(deals);
      const type = randElement(Object.values(DocumentType));
      const uploadedAt = new Date(new Date(deal.createdAt).getTime() + randInt(0, 5) * 24 * 60 * 60 * 1000);
      return {
          id: `doc-${i + 1}`,
          merchantId: deal.merchantId,
          dealId: deal.id,
          name: `${type} - ${deal.id}.pdf`,
          type,
          url: '#',
          uploadedAt: uploadedAt.toISOString(),
          parsedData: type === DocumentType.BankStatement && random() > 0.5 ? mockParsedStatement : null,
      };
  });

  const communications: Communication[] = Array.from({ length: 120 }, (_, i) => {
      const merchant = randElement(merchants);
      const type = randElement(Object.values(CommunicationType));
      const timestamp = new Date(Date.now() - randInt(1, 90) * 24 * 60 * 60 * 1000);
      return {
          id: `c-${i + 1}`,
          merchantId: merchant.id,
          type,
          subject: `${type} with ${merchant.name}`,
          body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          timestamp: timestamp.toISOString(),
      };
  });

  const tasks: Task[] = Array.from({ length: 50 }, (_, i) => {
      const deal = randElement(deals);
      const merchant = merchants.find(m => m.id === deal.merchantId)!;
      const dueDate = new Date(Date.now() + randInt(-14, 14) * 24 * 60 * 60 * 1000);
      return {
          id: `t-${i + 1}`,
          merchantId: deal.merchantId,
          dealId: deal.id,
          title: `Follow up on deal #${deal.id} for ${merchant.name}`,
          dueDate: dueDate.toISOString(),
          completed: random() > 0.6,
      };
  });
  
  return { deals, documents, communications, tasks };
};
