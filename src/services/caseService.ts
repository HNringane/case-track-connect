import { supabase } from '@/integrations/supabase/client';

export type CaseStatus = 'submitted' | 'under-review' | 'investigation' | 'resolution' | 'completed';
export type CasePriority = 'low' | 'medium' | 'high';

export interface CaseUpdate {
  id: string;
  case_id: string;
  title: string;
  description: string;
  stage: CaseStatus;
  created_by: string | null;
  created_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  victim_id: string | null;
  officer_id: string | null;
  type: string;
  description: string | null;
  status: CaseStatus;
  priority: CasePriority;
  progress: number;
  status_label: string;
  province: string | null;
  city: string | null;
  location: string | null;
  station_name: string | null;
  anonymous: boolean | null;
  submitted_date: string;
  last_update: string;
  created_at: string;
  updated_at: string;
  updates?: CaseUpdate[];
}

export interface CreateCaseData {
  type: string;
  description?: string;
  province?: string;
  city?: string;
  location?: string;
  anonymous?: boolean;
  date?: string;
}

// Generate case number
function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `CT-${year}-${random}`;
}

// Fetch all cases (for police)
export async function fetchAllCases(): Promise<Case[]> {
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error.message);
    throw new Error('Failed to fetch cases');
  }

  // Fetch updates for each case
  const casesWithUpdates = await Promise.all(
    (cases || []).map(async (caseItem) => {
      const { data: updates } = await supabase
        .from('case_updates')
        .select('*')
        .eq('case_id', caseItem.id)
        .order('created_at', { ascending: true });

      return {
        ...caseItem,
        updates: updates || [],
      };
    })
  );

  return casesWithUpdates;
}

// Fetch cases for a specific victim
export async function fetchVictimCases(victimId: string): Promise<Case[]> {
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .eq('victim_id', victimId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching victim cases:', error.message);
    throw new Error('Failed to fetch your cases');
  }

  // Fetch updates for each case
  const casesWithUpdates = await Promise.all(
    (cases || []).map(async (caseItem) => {
      const { data: updates } = await supabase
        .from('case_updates')
        .select('*')
        .eq('case_id', caseItem.id)
        .order('created_at', { ascending: true });

      return {
        ...caseItem,
        updates: updates || [],
      };
    })
  );

  return casesWithUpdates;
}

// Fetch a single case by ID
export async function fetchCaseById(caseId: string): Promise<Case | null> {
  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (error) {
    console.error('Error fetching case:', error.message);
    return null;
  }

  // Fetch updates
  const { data: updates } = await supabase
    .from('case_updates')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  return {
    ...caseData,
    updates: updates || [],
  };
}

// Create a new case
export async function createCase(victimId: string, data: CreateCaseData): Promise<Case> {
  const caseNumber = generateCaseNumber();
  
  const { data: newCase, error } = await supabase
    .from('cases')
    .insert({
      case_number: caseNumber,
      victim_id: victimId,
      type: data.type,
      description: data.description,
      province: data.province,
      city: data.city,
      location: data.location,
      station_name: data.province ? `${data.province} Central SAPS` : null,
      anonymous: data.anonymous,
      submitted_date: data.date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating case:', error.message);
    throw new Error('Failed to create case');
  }

  // Create initial update
  await supabase.from('case_updates').insert({
    case_id: newCase.id,
    title: 'Case Submitted',
    description: 'Your case has been successfully submitted and assigned a case number.',
    stage: 'submitted',
    created_by: victimId,
  });

  return { ...newCase, updates: [] };
}

// Update case status (for police)
export async function updateCaseStatus(
  caseId: string,
  newStatus: CaseStatus,
  notes: string,
  updatedBy: string
): Promise<boolean> {
  // Get current case
  const { data: currentCase, error: fetchError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (fetchError || !currentCase) {
    console.error('Error fetching case:', fetchError?.message);
    return false;
  }

  // Update case status
  const { error: updateError } = await supabase
    .from('cases')
    .update({ status: newStatus })
    .eq('id', caseId);

  if (updateError) {
    console.error('Error updating case:', updateError.message);
    return false;
  }

  // Get status title
  const statusTitles: Record<CaseStatus, string> = {
    'submitted': 'Case Submitted',
    'under-review': 'Under Review',
    'investigation': 'Investigation Started',
    'resolution': 'Resolution Phase',
    'completed': 'Case Resolved',
  };

  // Create case update entry
  const { error: updateInsertError } = await supabase.from('case_updates').insert({
    case_id: caseId,
    title: statusTitles[newStatus],
    description: notes || `Case has been updated to ${statusTitles[newStatus]}`,
    stage: newStatus,
    created_by: updatedBy,
  });

  if (updateInsertError) {
    console.error('Error inserting case update:', updateInsertError.message);
  }

  // Notify victim if they exist
  if (currentCase.victim_id) {
    await supabase.from('notifications').insert({
      user_id: currentCase.victim_id,
      case_id: caseId,
      case_number: currentCase.case_number,
      message: `Case ${currentCase.case_number} has moved to ${statusTitles[newStatus]}`,
      details: notes || `Your case status has been updated. The case is now in the ${statusTitles[newStatus].toLowerCase()} stage.`,
      priority: newStatus === 'completed' ? 'low' : 'medium',
      type: newStatus === 'completed' ? 'success' : 'info',
    });
  }

  return true;
}

// Fetch notifications for a user
export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }

  return data;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error.message);
    return false;
  }

  return true;
}

// Subscribe to case updates in real-time
export function subscribeToCases(callback: (payload: any) => void) {
  const channel = supabase
    .channel('cases-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cases',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to notifications in real-time
export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to case updates (timeline) in real-time
export function subscribeToCaseUpdates(caseId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`case-updates-${caseId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'case_updates',
        filter: `case_id=eq.${caseId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Generate case report
export function generateCaseReport(caseData: Case): string {
  return `
SOUTH AFRICAN POLICE SERVICE
CASE REPORT
================================

Case Number: ${caseData.case_number}
Type: ${caseData.type}
Status: ${caseData.status_label}
Priority: ${caseData.priority.toUpperCase()}

Station: ${caseData.station_name || 'Not assigned'}
Location: ${caseData.location || 'Not specified'}

Submitted: ${new Date(caseData.submitted_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
Last Update: ${new Date(caseData.last_update).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
Progress: ${caseData.progress}%

CASE TIMELINE
================================
${(caseData.updates || []).map(u => `
${new Date(u.created_at).toLocaleDateString('en-ZA')} - ${u.title}
${u.description}
`).join('\n')}

================================
Generated on: ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
This document is confidential and for the case participant's records only.
  `;
}

export function downloadCaseReport(caseData: Case) {
  const report = generateCaseReport(caseData);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${caseData.case_number}-report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}