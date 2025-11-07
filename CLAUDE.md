# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCA Nexus CRM - A Customer Relationship Management system for Merchant Cash Advance (MCA) brokers. The application manages merchants, deals, documents, communications, and tasks with real-time tracking of deal pipelines.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:3000)
npm run build           # Build for production
npm run preview         # Preview production build
```

The dev server runs on port 3000 (host: 0.0.0.0) configured in vite.config.ts.

## Architecture

### Data Flow & State Management

The application uses a hybrid data model:
- **Merchants**: Fetched from Supabase (single source of truth)
- **Deals, Documents, Communications, Tasks**: Generated from mockData.ts and stored in sessionStorage for persistence across refreshes

The DataContext (contexts/DataContext.tsx) orchestrates this:
1. On mount, fetches merchants from Supabase
2. If merchants exist, checks sessionStorage for other data
3. If no sessionStorage data, generates mock data using generateAllMockData()
4. Updates to deals/docs/comms/tasks persist to sessionStorage automatically

### Core Type System (types.ts)

Key enums define the business domain:
- `DealStatus`: Lead → Contacted → Documents → Underwriting → Approved → Funded (or Rejected)
- `DocumentType`: Bank Statement, Application, Tax Return, Driver's License
- `CommunicationType`: Email, Call, Meeting

Critical relationships:
- Merchants (1) → Deals (many) → Documents (many)
- Documents may have `parsedData: BankStatementParsed` for AI-analyzed bank statements
- Tasks/Communications link to merchants (and optionally deals)

### View System

App.tsx manages view routing with a string-based `View` type ('dashboard' | 'deals' | 'merchants' | 'calendar'):
- DashboardView: Summary stats and recent activity
- DealsKanbanView: Kanban board for deal pipeline (grouped by DealStatus)
- MerchantsView: Directory of all merchants with filtering
- CalendarView: Task/event calendar interface

Command palette (Cmd/Ctrl+K) provides quick navigation between views.

### Supabase Integration

supabaseClient.ts connects to production Supabase instance:
- URL: https://crpalakzdzvtgvljlutd.supabase.co
- Uses anon key (safe for client-side)
- Typed with Database schema from types/supabase.ts
- Currently only merchants table is actively queried

### Mock Data Generation

data/mockData.ts uses seeded PRNG for deterministic mock data:
- Generates 40 deals, 80 documents, 120 communications, 50 tasks
- All linked to actual merchants from Supabase
- mockParsedStatement provides example AI-parsed bank statement structure

## Environment Setup

Required environment variable:
- `GEMINI_API_KEY`: Set in .env.local for AI/Gemini integration

Vite config exposes this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

## Path Aliases

Use `@/` to import from project root:
```typescript
import { Merchant } from '@/types';
import { supabase } from '@/supabaseClient';
```

Configured in vite.config.ts and tsconfig.json.

## Key Technical Patterns

1. **Session Persistence**: Mock data survives page refreshes via sessionStorage (key: 'mca-crm-mock-data')
2. **Error Handling**: DataContext tracks Supabase errors via PostgrestError state
3. **Loading States**: Context provides loading boolean for UI skeleton states
4. **Mutable State**: Context exposes setters (setTasks, setDeals, etc.) for components to mutate data

## UI Component Organization

- `components/layout/`: Sidebar, Header (persistent shell)
- `components/views/`: Full-page view components (Dashboard, Deals, Merchants, Calendar)
- `components/ui/`: Reusable components (Button, Modal, ScoreBadge, StatusPill, etc.)
- `components/shared/`: Cross-cutting features (CommandPalette)

## Styling

Tailwind CSS with custom theme:
- Dark mode by default (`bg-primary-dark`, `bg-primary-light`)
- Gradient backgrounds (`from-primary-light to-primary-dark`)
- Semantic colors for deal statuses

## Database Schema Expectations

The Supabase merchants table should match the Merchant interface:
```typescript
{
  id, name, legalName, owner, industry, phone, email,
  address: { street, city, state, zip },
  creditScore, annualRevenue, nsfCount90Days
}
```

Currently, deals/documents/communications/tasks are NOT in Supabase - they're client-side only.
