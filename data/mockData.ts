import { Merchant, Deal, Document, Communication, Task, Note, DealStage, DocumentType, DocumentStatus, CommunicationType, BankStatementParsed } from '../types';

// --- MCA-specific Data for Generation ---
const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Maria'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Chen', 'Patel'];
const companyNouns = ['Diner', 'Automotive', 'Construction', 'Cafe', 'Market', 'Services', 'Trucking', 'Restaurant', 'Salon', 'Repair'];
const companyAdjectives = ['City', 'Main Street', 'Quick', 'Premium', 'Elite', 'Family', 'Express', 'Quality', 'Pro', 'Metro'];
const mcaIndustries = [
  'Restaurant',
  'Food Service',
  'Construction',
  'Retail',
  'Automotive Repair',
  'Trucking',
  'Hair Salon',
  'Medical Practice',
  'Convenience Store',
  'HVAC',
  'Plumbing',
  'Landscaping'
];
const usStates = ['NY', 'NJ', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC'];
const streetNames = ['Main St', 'Broadway', 'Oak Ave', 'Washington Blvd', 'Maple St', 'Pine St', 'Market St', '1st Ave'];
const cities = ['Brooklyn', 'Manhattan', 'Queens', 'Newark', 'Jersey City', 'Philadelphia', 'Chicago', 'Houston'];

// --- Seeded PRNG for deterministic results ---
let seed = 42; // Changed seed for different but deterministic results
function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
const randInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
const randElement = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const randBool = (probability: number = 0.5) => random() < probability;

export const mockParsedStatement: BankStatementParsed = {
  totalDeposits: 125430.55,
  nsfCount: 2,
  avgDailyBalance: 8750.21,
  largestDeposit: 15200.00,
  redFlags: ['Multiple same-day small deposits', 'Large wire transfer to personal account'],
  monthsCovered: 3,
};

// Helper to calculate payback amount
const calculatePayback = (amount: number, factorRate: number): number => {
  return Math.round(amount * factorRate);
};

export const generateAllMockData = (merchants: Merchant[]) => {
  if (merchants.length === 0) {
    return { deals: [], documents: [], communications: [], tasks: [], notes: [] };
  }

  // Generate 50 deals across all MCA stages
  const deals: Deal[] = Array.from({ length: 50 }, (_, i) => {
    const merchant = randElement(merchants);
    const createdAt = new Date(Date.now() - randInt(1, 120) * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + randInt(1, 30) * 24 * 60 * 60 * 1000);
    const lastActivityAt = new Date(updatedAt.getTime() + randInt(0, 14) * 24 * 60 * 60 * 1000);

    const stage = randElement(Object.values(DealStage));
    const requestedAmount = randInt(10, 500) * 1000;

    // Hot leads and app_out typically have approved amounts and terms
    const hasTerms = stage === DealStage.AppOut || stage === DealStage.HotLeads;
    const factorRate = hasTerms ? 1.15 + (randInt(0, 35) / 100) : null; // 1.15 to 1.50
    const approvedAmount = hasTerms ? randInt(requestedAmount * 0.7, requestedAmount * 1.1) : null;
    const termInDays = hasTerms ? randInt(3, 12) * 30 : null; // 3-12 months
    const paybackAmount = hasTerms && factorRate && approvedAmount
      ? calculatePayback(approvedAmount, factorRate)
      : null;

    return {
      id: `deal-${String(i + 1).padStart(4, '0')}`,
      merchantId: merchant.id,
      stage,
      requestedAmount,
      approvedAmount,
      factorRate,
      paybackAmount,
      termInDays,
      assignedBrokerId: `broker-${randInt(1, 3)}`,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      lastActivityAt: lastActivityAt.toISOString(),
      priority: stage === DealStage.HotLeads ? 'urgent'
        : stage === DealStage.FollowUp ? 'low'
        : randElement(['low', 'medium', 'high'] as const),
    };
  });

  // Generate documents based on deal stages
  const documents: Document[] = [];
  let docCounter = 1;

  deals.forEach(deal => {
    const dealStage = deal.stage;

    // Generate documents based on stage requirements
    if (dealStage === DealStage.ChaseDocs) {
      // Missing some docs (that's why we're chasing)
      const numDocs = randInt(0, 2);
      for (let i = 0; i < numDocs; i++) {
        const type = randElement([DocumentType.BankStatements, DocumentType.VoidedCheck]);
        documents.push({
          id: `doc-${String(docCounter++).padStart(4, '0')}`,
          merchantId: deal.merchantId,
          dealId: deal.id,
          name: `${type}-${deal.merchantId}.pdf`,
          type,
          status: DocumentStatus.Received,
          url: '#',
          uploadedAt: new Date(new Date(deal.createdAt).getTime() + randInt(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } else if (dealStage === DealStage.DocsIn || dealStage === DealStage.AppOut || dealStage === DealStage.HotLeads) {
      // All required docs present
      [DocumentType.BankStatements, DocumentType.VoidedCheck, DocumentType.COJ, DocumentType.DriverLicense].forEach(type => {
        const uploadedAt = new Date(new Date(deal.createdAt).getTime() + randInt(1, 10) * 24 * 60 * 60 * 1000);
        documents.push({
          id: `doc-${String(docCounter++).padStart(4, '0')}`,
          merchantId: deal.merchantId,
          dealId: deal.id,
          name: `${type}-${deal.merchantId}.pdf`,
          type,
          status: dealStage === DealStage.DocsIn ? DocumentStatus.Received : DocumentStatus.Verified,
          url: '#',
          uploadedAt: uploadedAt.toISOString(),
          verifiedAt: dealStage !== DealStage.DocsIn ? new Date(uploadedAt.getTime() + randInt(1, 3) * 24 * 60 * 60 * 1000).toISOString() : undefined,
          parsedData: type === DocumentType.BankStatements ? {
            ...mockParsedStatement,
            totalDeposits: randInt(50000, 500000),
            avgDailyBalance: randInt(5000, 50000),
            nsfCount: randInt(0, 8),
            redFlags: randBool(0.3) ? ['High NSF count', 'Irregular deposit patterns'] : [],
          } : null,
        });
      });

      // Add application for app_out stage
      if (dealStage === DealStage.AppOut) {
        documents.push({
          id: `doc-${String(docCounter++).padStart(4, '0')}`,
          merchantId: deal.merchantId,
          dealId: deal.id,
          name: `Application-${deal.merchantId}.pdf`,
          type: DocumentType.Application,
          status: DocumentStatus.Verified,
          url: '#',
          uploadedAt: new Date(new Date(deal.updatedAt).getTime() + randInt(1, 5) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  });

  // Generate communications with MCA-specific content
  const communications: Communication[] = Array.from({ length: 150 }, (_, i) => {
    const deal = randElement(deals);
    const merchant = merchants.find(m => m.id === deal.merchantId)!;
    const type = randElement(Object.values(CommunicationType));
    const timestamp = new Date(Date.now() - randInt(1, 90) * 24 * 60 * 60 * 1000);

    const subjects = {
      [CommunicationType.Email]: [
        'Following up on funding application',
        'Document request - Bank statements needed',
        'Offer terms discussion',
        'Quick question about your business',
        'Lender feedback on your application'
      ],
      [CommunicationType.Call]: [
        'Initial outreach call',
        'Document collection discussion',
        'Offer review call',
        'Status update',
        'Closing call'
      ],
      [CommunicationType.Meeting]: [
        'In-person application review',
        'Document signing appointment',
        'Business evaluation meeting'
      ],
      [CommunicationType.SMS]: [
        'Quick check-in',
        'Document reminder',
        'Offer update',
        'Confirmation request'
      ]
    };

    const outcomes = ['Connected - Interested', 'Left voicemail', 'Not interested', 'Documents sent', 'Follow up needed', 'Deal moving forward'];

    return {
      id: `comm-${String(i + 1).padStart(4, '0')}`,
      merchantId: merchant.id,
      dealId: deal.id,
      type,
      subject: randElement(subjects[type]),
      body: `Discussion regarding ${merchant.businessName} MCA application for $${deal.requestedAmount.toLocaleString()}.`,
      timestamp: timestamp.toISOString(),
      outcome: randElement(outcomes),
    };
  });

  // Generate tasks based on deal stages
  const tasks: Task[] = [];
  let taskCounter = 1;

  deals.forEach(deal => {
    const merchant = merchants.find(m => m.id === deal.merchantId)!;
    const numTasks = randInt(1, 3);

    for (let i = 0; i < numTasks; i++) {
      const dueDate = new Date(Date.now() + randInt(-7, 21) * 24 * 60 * 60 * 1000);

      let title = '';
      switch (deal.stage) {
        case DealStage.Leads:
          title = randElement([
            `Initial contact - ${merchant.businessName}`,
            `Qualify lead - ${merchant.businessName}`,
            `Send initial offer to ${merchant.businessName}`
          ]);
          break;
        case DealStage.ChaseDocs:
          title = randElement([
            `Follow up on missing documents - ${merchant.businessName}`,
            `Call ${merchant.ownerName} for bank statements`,
            `Send document checklist to ${merchant.businessName}`
          ]);
          break;
        case DealStage.DocsIn:
          title = randElement([
            `Review bank statements for ${merchant.businessName}`,
            `Verify documents for ${merchant.businessName}`,
            `Prepare application package - ${merchant.businessName}`
          ]);
          break;
        case DealStage.AppOut:
          title = randElement([
            `Follow up with lenders on ${merchant.businessName}`,
            `Check lender status - ${merchant.businessName}`,
            `Prepare offer sheet for ${merchant.businessName}`
          ]);
          break;
        case DealStage.HotLeads:
          title = randElement([
            `URGENT: Close deal with ${merchant.businessName}`,
            `Send contract to ${merchant.businessName}`,
            `Schedule funding call - ${merchant.businessName}`
          ]);
          break;
        case DealStage.FollowUp:
          title = randElement([
            `Re-engage ${merchant.businessName}`,
            `Check in on ${merchant.businessName} interest`,
            `Send updated offer to ${merchant.businessName}`
          ]);
          break;
      }

      tasks.push({
        id: `task-${String(taskCounter++).padStart(4, '0')}`,
        merchantId: deal.merchantId,
        dealId: deal.id,
        title,
        description: `Task for deal ${deal.id}`,
        dueDate: dueDate.toISOString(),
        completed: dueDate < new Date() ? randBool(0.7) : false,
        priority: deal.stage === DealStage.HotLeads ? 'high' : randElement(['low', 'medium', 'high'] as const),
      });
    }
  });

  // Generate notes for merchants
  const notes: Note[] = Array.from({ length: 100 }, (_, i) => {
    const deal = randElement(deals);
    const merchant = merchants.find(m => m.id === deal.merchantId)!;
    const createdAt = new Date(Date.now() - randInt(1, 60) * 24 * 60 * 60 * 1000);

    const noteContents = [
      `Spoke with ${merchant.ownerName} - very interested in funding. Business doing well.`,
      `Owner mentioned seasonal slowdown in ${merchant.industry}. May need larger advance.`,
      `Bank statements show strong daily deposits. Low NSF count. Good candidate.`,
      `Missing COJ - need to follow up by end of week.`,
      `Lender feedback: Approved at 1.25 factor rate for $${randInt(30, 200)}k.`,
      `Owner is shopping around. Need to move fast on this one.`,
      `Business has previous MCA - paid on time. Clean history.`,
      `Red flag: Multiple NSFs in last 2 months. Needs closer review.`
    ];

    return {
      id: `note-${String(i + 1).padStart(4, '0')}`,
      merchantId: merchant.id,
      dealId: deal.id,
      content: randElement(noteContents),
      createdAt: createdAt.toISOString(),
      createdBy: `broker-${randInt(1, 3)}`,
    };
  });

  return { deals, documents, communications, tasks, notes };
};
