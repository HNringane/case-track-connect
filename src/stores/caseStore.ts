import { Case, CaseUpdate, CaseStatus } from '@/data/mockCases';

// Simple in-memory store for case management - shared across dashboards
let cases: Case[] = [];
let listeners: Set<() => void> = new Set();
let caseIdCounter = 5;

// Victim notifications
interface VictimNotification {
  id: number;
  caseNumber: string;
  message: string;
  time: string;
  unread: boolean;
  details?: string;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: string;
}

let victimNotifications: VictimNotification[] = [
  { id: 1, caseNumber: 'CT-2024-001234', message: 'Case CT-2024-001234 has moved to Investigation stage', time: '2 hours ago', unread: true, details: 'Your case has progressed to the active investigation phase. The assigned officer is now gathering evidence.', priority: 'medium' },
  { id: 2, caseNumber: '', message: 'New resource: Victim Support Counseling available', time: '1 day ago', unread: false, details: 'Free counseling services are now available for all registered victims. Contact 0800-428-428 for assistance.' },
];

let notificationListeners: Set<() => void> = new Set();
let notificationIdCounter = 3;

export function initializeCases(initialCases: Case[]) {
  if (cases.length === 0) {
    cases = [...initialCases];
  }
}

export function getCases(): Case[] {
  return [...cases];
}

export function getCaseById(id: string): Case | undefined {
  return cases.find(c => c.id === id);
}

export function getCasesByVictimId(victimId: string): Case[] {
  return cases.filter(c => c.victimId === victimId);
}

export function addCase(newCaseData: {
  type: string;
  province: string;
  city: string;
  location: string;
  description: string;
  anonymous: boolean;
  date: string;
  victimId: string;
}): Case {
  const caseNumber = `CT-2024-${String(Math.floor(Math.random() * 9000) + 1000).padStart(6, '0')}`;
  const now = new Date().toISOString().split('T')[0];
  
  const newCase: Case = {
    id: String(caseIdCounter++),
    caseNumber,
    type: newCaseData.type,
    status: 'submitted',
    statusLabel: 'In Progress',
    submittedDate: newCaseData.date || now,
    lastUpdate: now,
    progress: 10,
    stationName: `${newCaseData.province} Central SAPS`,
    victimId: newCaseData.victimId,
    priority: 'medium',
    updates: [
      {
        id: '1',
        date: now,
        title: 'Case Submitted',
        description: 'Your case has been successfully submitted and assigned a case number.',
        stage: 'submitted',
      },
    ],
  };
  
  cases = [newCase, ...cases];
  notifyListeners();
  return newCase;
}

export function updateCaseStatus(
  caseId: string, 
  newStatus: CaseStatus, 
  notes: string
): boolean {
  const caseIndex = cases.findIndex(c => c.id === caseId);
  if (caseIndex === -1) return false;
  
  const caseData = cases[caseIndex];
  const now = new Date().toISOString().split('T')[0];
  
  const statusToProgress: Record<CaseStatus, number> = {
    'submitted': 10,
    'under-review': 35,
    'investigation': 60,
    'resolution': 85,
    'completed': 100,
  };
  
  const statusToLabel: Record<CaseStatus, 'Completed' | 'In Progress' | 'Overdue'> = {
    'submitted': 'In Progress',
    'under-review': 'In Progress',
    'investigation': 'In Progress',
    'resolution': 'In Progress',
    'completed': 'Completed',
  };
  
  const statusToTitle: Record<CaseStatus, string> = {
    'submitted': 'Case Submitted',
    'under-review': 'Under Review',
    'investigation': 'Investigation Started',
    'resolution': 'Resolution Phase',
    'completed': 'Case Resolved',
  };

  const newUpdate: CaseUpdate = {
    id: String(caseData.updates.length + 1),
    date: now,
    title: statusToTitle[newStatus],
    description: notes || `Case has been updated to ${statusToTitle[newStatus]}`,
    stage: newStatus,
  };
  
  cases[caseIndex] = {
    ...caseData,
    status: newStatus,
    statusLabel: statusToLabel[newStatus],
    progress: statusToProgress[newStatus],
    lastUpdate: now,
    updates: [...caseData.updates, newUpdate],
  };
  
  // Add notification for victim
  if (caseData.victimId) {
    addVictimNotification({
      caseNumber: caseData.caseNumber,
      message: `Case ${caseData.caseNumber} has moved to ${statusToTitle[newStatus]}`,
      details: notes || `Your case status has been updated. The case is now in the ${statusToTitle[newStatus].toLowerCase()} stage.`,
      priority: newStatus === 'completed' ? 'low' : 'medium',
    });
  }
  
  notifyListeners();
  return true;
}

export function escalateCase(caseId: string): boolean {
  const caseIndex = cases.findIndex(c => c.id === caseId);
  if (caseIndex === -1) return false;
  
  const caseData = cases[caseIndex];
  const now = new Date().toISOString().split('T')[0];
  
  const newUpdate: CaseUpdate = {
    id: String(caseData.updates.length + 1),
    date: now,
    title: 'Case Escalated',
    description: 'This case has been escalated for priority handling by administration.',
    stage: caseData.status,
  };
  
  cases[caseIndex] = {
    ...caseData,
    priority: 'high',
    statusLabel: 'In Progress',
    lastUpdate: now,
    updates: [...caseData.updates, newUpdate],
  };
  
  // Notify victim
  if (caseData.victimId) {
    addVictimNotification({
      caseNumber: caseData.caseNumber,
      message: `Case ${caseData.caseNumber} has been escalated for priority handling`,
      details: 'Your case has been flagged for urgent attention. A senior officer will review it shortly.',
      priority: 'high',
    });
  }
  
  notifyListeners();
  return true;
}

export function subscribeToCase(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Victim Notification Functions
export function getVictimNotifications(): VictimNotification[] {
  return [...victimNotifications];
}

export function addVictimNotification(data: {
  caseNumber: string;
  message: string;
  details?: string;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: string;
}) {
  const notification: VictimNotification = {
    id: notificationIdCounter++,
    caseNumber: data.caseNumber,
    message: data.message,
    time: 'Just now',
    unread: true,
    details: data.details,
    priority: data.priority,
    actionRequired: data.actionRequired,
  };
  
  victimNotifications = [notification, ...victimNotifications];
  notifyNotificationListeners();
}

export function markVictimNotificationAsRead(id: number) {
  victimNotifications = victimNotifications.map(n => 
    n.id === id ? { ...n, unread: false } : n
  );
  notifyNotificationListeners();
}

export function subscribeToVictimNotifications(listener: () => void) {
  notificationListeners.add(listener);
  return () => {
    notificationListeners.delete(listener);
  };
}

function notifyNotificationListeners() {
  notificationListeners.forEach(listener => listener());
}

// Generate PDF report
export function generateCaseReport(caseData: Case): string {
  const report = `
SOUTH AFRICAN POLICE SERVICE
CASE REPORT
================================

Case Number: ${caseData.caseNumber}
Type: ${caseData.type}
Status: ${caseData.statusLabel}
Priority: ${caseData.priority.toUpperCase()}

Station: ${caseData.stationName}
Assigned Officer: ${caseData.officerAssigned || 'Not yet assigned'}

Submitted: ${new Date(caseData.submittedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
Last Update: ${new Date(caseData.lastUpdate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
Progress: ${caseData.progress}%

CASE TIMELINE
================================
${caseData.updates.map(u => `
${new Date(u.date).toLocaleDateString('en-ZA')} - ${u.title}
${u.description}
`).join('\n')}

================================
Generated on: ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
This document is confidential and for the case participant's records only.
  `;
  
  return report;
}

export function downloadCaseReport(caseData: Case) {
  const report = generateCaseReport(caseData);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${caseData.caseNumber}-report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
