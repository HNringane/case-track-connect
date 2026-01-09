export type CaseStatus = 'submitted' | 'under-review' | 'investigation' | 'resolution' | 'completed';

export interface CaseUpdate {
  id: string;
  date: string;
  title: string;
  description: string;
  stage: CaseStatus;
}

export interface Case {
  id: string;
  caseNumber: string;
  type: string;
  status: CaseStatus;
  statusLabel: 'Completed' | 'In Progress' | 'Overdue';
  submittedDate: string;
  lastUpdate: string;
  progress: number;
  stationName: string;
  officerAssigned?: string;
  updates: CaseUpdate[];
  victimId?: string;
  priority: 'low' | 'medium' | 'high';
}

export const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'CT-2024-001234',
    type: 'Theft',
    status: 'investigation',
    statusLabel: 'In Progress',
    submittedDate: '2024-01-15',
    lastUpdate: '2024-01-18',
    progress: 60,
    stationName: 'Cape Town Central SAPS',
    officerAssigned: 'Capt. Van der Merwe',
    victimId: '1',
    priority: 'medium',
    updates: [
      {
        id: '1',
        date: '2024-01-15',
        title: 'Case Submitted',
        description: 'Your case has been successfully submitted and assigned a case number.',
        stage: 'submitted',
      },
      {
        id: '2',
        date: '2024-01-16',
        title: 'Under Review',
        description: 'A detective has been assigned to review your case details.',
        stage: 'under-review',
      },
      {
        id: '3',
        date: '2024-01-18',
        title: 'Investigation Started',
        description: 'Active investigation is underway. Evidence is being collected.',
        stage: 'investigation',
      },
    ],
  },
  {
    id: '2',
    caseNumber: 'CT-2024-001198',
    type: 'Assault',
    status: 'completed',
    statusLabel: 'Completed',
    submittedDate: '2024-01-10',
    lastUpdate: '2024-01-17',
    progress: 100,
    stationName: 'Johannesburg Central SAPS',
    officerAssigned: 'Sgt. Mthembu',
    victimId: '1',
    priority: 'high',
    updates: [
      {
        id: '1',
        date: '2024-01-10',
        title: 'Case Submitted',
        description: 'Your case has been successfully submitted.',
        stage: 'submitted',
      },
      {
        id: '2',
        date: '2024-01-12',
        title: 'Under Review',
        description: 'Case reviewed and prioritized.',
        stage: 'under-review',
      },
      {
        id: '3',
        date: '2024-01-14',
        title: 'Investigation',
        description: 'Suspect identified and apprehended.',
        stage: 'investigation',
      },
      {
        id: '4',
        date: '2024-01-17',
        title: 'Case Resolved',
        description: 'Case has been successfully resolved. Suspect charged.',
        stage: 'completed',
      },
    ],
  },
  {
    id: '3',
    caseNumber: 'CT-2024-001156',
    type: 'Burglary',
    status: 'under-review',
    statusLabel: 'Overdue',
    submittedDate: '2023-12-20',
    lastUpdate: '2024-01-05',
    progress: 25,
    stationName: 'Durban North SAPS',
    officerAssigned: 'Const. Naidoo',
    victimId: '1',
    priority: 'low',
    updates: [
      {
        id: '1',
        date: '2023-12-20',
        title: 'Case Submitted',
        description: 'Your case has been successfully submitted.',
        stage: 'submitted',
      },
      {
        id: '2',
        date: '2024-01-05',
        title: 'Under Review',
        description: 'Case is currently being reviewed. Additional information may be requested.',
        stage: 'under-review',
      },
    ],
  },
  {
    id: '4',
    caseNumber: 'CT-2024-001289',
    type: 'Fraud',
    status: 'resolution',
    statusLabel: 'In Progress',
    submittedDate: '2024-01-08',
    lastUpdate: '2024-01-19',
    progress: 85,
    stationName: 'Pretoria Central SAPS',
    officerAssigned: 'Det. Botha',
    victimId: '2',
    priority: 'high',
    updates: [
      {
        id: '1',
        date: '2024-01-08',
        title: 'Case Submitted',
        description: 'Fraud case reported and documented.',
        stage: 'submitted',
      },
      {
        id: '2',
        date: '2024-01-10',
        title: 'Under Review',
        description: 'Financial records being analyzed.',
        stage: 'under-review',
      },
      {
        id: '3',
        date: '2024-01-15',
        title: 'Investigation',
        description: 'Bank statements and transactions traced.',
        stage: 'investigation',
      },
      {
        id: '4',
        date: '2024-01-19',
        title: 'Resolution Phase',
        description: 'Preparing case for prosecution. Evidence compiled.',
        stage: 'resolution',
      },
    ],
  },
];

export const stationStats = [
  { station: 'Cape Town Central', cases: 156, resolved: 89, avgDays: 12 },
  { station: 'Johannesburg Central', cases: 234, resolved: 145, avgDays: 15 },
  { station: 'Durban North', cases: 98, resolved: 67, avgDays: 18 },
  { station: 'Pretoria Central', cases: 187, resolved: 112, avgDays: 14 },
  { station: 'Port Elizabeth', cases: 76, resolved: 54, avgDays: 11 },
];

export const caseTypeStats = [
  { type: 'Theft', count: 345, percentage: 28 },
  { type: 'Assault', count: 267, percentage: 22 },
  { type: 'Burglary', count: 198, percentage: 16 },
  { type: 'Fraud', count: 156, percentage: 13 },
  { type: 'Robbery', count: 134, percentage: 11 },
  { type: 'Other', count: 123, percentage: 10 },
];
