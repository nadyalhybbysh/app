
import { Supervisor, ProgramPlan, Member, ProgramReport, SystemSettings, DailyReport, DistinguishedSupervisor } from '../types';
import { MOCK_SUPERVISORS, MOCK_PLANS, MOCK_MEMBERS, MOCK_SETTINGS } from '../services/mockData';

const KEYS = {
  SUPERVISORS: 'club_app_supervisors',
  PLANS: 'club_app_plans',
  MEMBERS: 'club_app_members',
  REPORTS: 'club_app_reports',
  DAILY_REPORTS: 'club_app_daily_reports',
  DISTINGUISHED: 'club_app_distinguished',
  // Updated key version to v10 to force reload of the new logo
  SETTINGS: 'club_app_settings_v10', 
  CURRENT_USER: 'club_app_current_user',
};

export const storage = {
  getSupervisors: (): Supervisor[] => {
    const data = localStorage.getItem(KEYS.SUPERVISORS);
    return data ? JSON.parse(data) : MOCK_SUPERVISORS;
  },
  saveSupervisors: (data: Supervisor[]) => localStorage.setItem(KEYS.SUPERVISORS, JSON.stringify(data)),

  getPlans: (): ProgramPlan[] => {
    const data = localStorage.getItem(KEYS.PLANS);
    return data ? JSON.parse(data) : MOCK_PLANS;
  },
  savePlans: (data: ProgramPlan[]) => localStorage.setItem(KEYS.PLANS, JSON.stringify(data)),

  getMembers: (): Member[] => {
    const data = localStorage.getItem(KEYS.MEMBERS);
    return data ? JSON.parse(data) : MOCK_MEMBERS;
  },
  saveMembers: (data: Member[]) => localStorage.setItem(KEYS.MEMBERS, JSON.stringify(data)),

  getReports: (): ProgramReport[] => {
    const data = localStorage.getItem(KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  },
  saveReports: (data: ProgramReport[]) => localStorage.setItem(KEYS.REPORTS, JSON.stringify(data)),

  getDailyReports: (): DailyReport[] => {
    const data = localStorage.getItem(KEYS.DAILY_REPORTS);
    return data ? JSON.parse(data) : [];
  },
  saveDailyReports: (data: DailyReport[]) => localStorage.setItem(KEYS.DAILY_REPORTS, JSON.stringify(data)),

  getDistinguished: (): DistinguishedSupervisor[] => {
    const data = localStorage.getItem(KEYS.DISTINGUISHED);
    return data ? JSON.parse(data) : [];
  },
  saveDistinguished: (data: DistinguishedSupervisor[]) => localStorage.setItem(KEYS.DISTINGUISHED, JSON.stringify(data)),

  getSettings: (): SystemSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : MOCK_SETTINGS;
  },
  saveSettings: (data: SystemSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data)),
  
  // User Session
  getCurrentUser: (): Supervisor | null => {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
  },
  saveCurrentUser: (user: Supervisor | null) => {
      if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      else localStorage.removeItem(KEYS.CURRENT_USER);
  }
};
