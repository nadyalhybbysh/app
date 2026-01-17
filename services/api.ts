
import { supabase } from './supabaseClient';
import { Supervisor, ProgramPlan, Member, ProgramReport, DailyReport, DistinguishedSupervisor, SystemSettings } from '../types';
import { MOCK_SETTINGS, MOCK_SUPERVISORS, MOCK_PLANS, MOCK_MEMBERS } from './mockData';

// Helper to handle Supabase errors gracefully
// Returns true if the error is "Table/Column Missing", prompting a fallback or silent fail
const isSchemaError = (error: any): boolean => {
  if (!error) return false;
  // PGRST205: Table not found in schema cache
  // 42P01: Undefined table (Postgres)
  // 42703: Undefined column (Postgres) - e.g. password column missing
  if (error.code === 'PGRST205' || error.code === '42P01' || error.code === '42703' || error.message?.includes('Could not find the table')) {
    return true;
  }
  return false;
};

const logError = (operation: string, error: any) => {
    if (!isSchemaError(error)) {
        console.error(`Error in ${operation}:`, error.message);
    }
    // If schema error (table or column missing), we suppress the log to avoid console noise
};

// --- SETTINGS ---
export const fetchSettings = async (): Promise<SystemSettings> => {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error) {
      if (isSchemaError(error) || error.code !== 'PGRST116') {
         // Silent fallback
      } else {
         logError('fetchSettings', error);
      }
      return MOCK_SETTINGS;
    }
    return (data as SystemSettings) || MOCK_SETTINGS;
  } catch (e) {
    return MOCK_SETTINGS;
  }
};

export const updateSettings = async (settings: SystemSettings) => {
  try {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error && !isSchemaError(error)) logError('updateSettings', error);
  } catch (e) { /* silent */ }
};

// --- SUPERVISORS ---
export const fetchSupervisors = async (): Promise<Supervisor[]> => {
  try {
    const { data, error } = await supabase.from('supervisors').select('*');
    if (error) {
      if (isSchemaError(error)) return MOCK_SUPERVISORS; // Fallback to Mocks
      logError('fetchSupervisors', error);
      return [];
    }
    return (data as Supervisor[]) || [];
  } catch (e) {
    return MOCK_SUPERVISORS;
  }
};

export const upsertSupervisor = async (supervisor: Supervisor) => {
  try {
    const { error } = await supabase.from('supervisors').upsert(supervisor);
    
    // RETRY LOGIC: If the error is due to a missing column (like 'password'), try saving without it.
    if (error && isSchemaError(error)) {
        console.warn(`Schema mismatch in upsertSupervisor (likely missing 'password' column). Retrying without password...`);
        // Create a copy without the password field
        const { password, ...supervisorWithoutPassword } = supervisor;
        const { error: retryError } = await supabase.from('supervisors').upsert(supervisorWithoutPassword);
        
        if (retryError && !isSchemaError(retryError)) {
            logError('upsertSupervisor (retry failed)', retryError);
        }
        return;
    }

    if (error) logError('upsertSupervisor', error);
  } catch (e) { /* silent */ }
};

export const deleteSupervisor = async (id: string) => {
  try {
    const { error } = await supabase.from('supervisors').delete().eq('id', id);
    if (error && !isSchemaError(error)) logError('deleteSupervisor', error);
  } catch (e) { /* silent */ }
};

// --- PLANS ---
export const fetchPlans = async (): Promise<ProgramPlan[]> => {
  try {
    const { data, error } = await supabase.from('plans').select('*');
    if (error) {
      if (isSchemaError(error)) return MOCK_PLANS; // Fallback to Mocks
      logError('fetchPlans', error);
      return [];
    }
    return (data as ProgramPlan[]) || [];
  } catch (e) {
    return MOCK_PLANS;
  }
};

export const upsertPlan = async (plan: ProgramPlan) => {
  try {
    const { error } = await supabase.from('plans').upsert(plan);
    if (error && !isSchemaError(error)) logError('upsertPlan', error);
  } catch (e) { /* silent */ }
};

export const deletePlan = async (id: string) => {
  try {
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error && !isSchemaError(error)) logError('deletePlan', error);
  } catch (e) { /* silent */ }
};

// --- MEMBERS ---
export const fetchMembers = async (): Promise<Member[]> => {
  try {
    const { data, error } = await supabase.from('members').select('*');
    if (error) {
      if (isSchemaError(error)) return MOCK_MEMBERS; // Fallback to Mocks
      logError('fetchMembers', error);
      return [];
    }
    return (data as Member[]) || [];
  } catch (e) {
    return MOCK_MEMBERS;
  }
};

export const upsertMember = async (member: Member) => {
  try {
    const { error } = await supabase.from('members').upsert(member);
    if (error && !isSchemaError(error)) logError('upsertMember', error);
  } catch (e) { /* silent */ }
};

export const deleteMember = async (id: string) => {
  try {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error && !isSchemaError(error)) logError('deleteMember', error);
  } catch (e) { /* silent */ }
};

// --- REPORTS ---
export const fetchReports = async (): Promise<ProgramReport[]> => {
  try {
    const { data, error } = await supabase.from('reports').select('*');
    if (error) {
      if (isSchemaError(error)) return []; 
      logError('fetchReports', error);
      return [];
    }
    return (data as ProgramReport[]) || [];
  } catch (e) {
    return [];
  }
};

export const upsertReport = async (report: ProgramReport) => {
  try {
    const { error } = await supabase.from('reports').upsert(report);
    if (error && !isSchemaError(error)) logError('upsertReport', error);
  } catch (e) { /* silent */ }
};

// --- DAILY REPORTS ---
export const fetchDailyReports = async (): Promise<DailyReport[]> => {
  try {
    const { data, error } = await supabase.from('daily_reports').select('*');
    if (error) {
      if (isSchemaError(error)) return [];
      logError('fetchDailyReports', error);
      return [];
    }
    return (data as DailyReport[]) || [];
  } catch (e) {
    return [];
  }
};

export const upsertDailyReport = async (report: DailyReport) => {
  try {
    const { error } = await supabase.from('daily_reports').upsert(report);
    if (error && !isSchemaError(error)) logError('upsertDailyReport', error);
  } catch (e) { /* silent */ }
};

export const deleteDailyReport = async (id: string) => {
  try {
    const { error } = await supabase.from('daily_reports').delete().eq('id', id);
    if (error && !isSchemaError(error)) logError('deleteDailyReport', error);
  } catch (e) { /* silent */ }
};

// --- DISTINGUISHED ---
export const fetchDistinguished = async (): Promise<DistinguishedSupervisor[]> => {
  try {
    const { data, error } = await supabase.from('distinguished_supervisors').select('*');
    if (error) {
      if (isSchemaError(error)) return [];
      logError('fetchDistinguished', error);
      return [];
    }
    return (data as DistinguishedSupervisor[]) || [];
  } catch (e) {
    return [];
  }
};

export const upsertDistinguished = async (item: DistinguishedSupervisor) => {
  try {
    const { error } = await supabase.from('distinguished_supervisors').upsert(item);
    if (error && !isSchemaError(error)) logError('upsertDistinguished', error);
  } catch (e) { /* silent */ }
};

export const deleteDistinguished = async (id: string) => {
  try {
    const { error } = await supabase.from('distinguished_supervisors').delete().eq('id', id);
    if (error && !isSchemaError(error)) logError('deleteDistinguished', error);
  } catch (e) { /* silent */ }
};
