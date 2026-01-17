
export enum UserRole {
  ADMIN = 'مشرف النظام',
  MANAGER = 'مدير النادي',
  SUPERVISOR = 'مساعد إداري',
  COACH = 'مدرب رياضي',
  CULTURAL_SUPERVISOR = 'مشرف ثقافي',
  KEEPER = 'حارس النادي',
  EMPLOYEE = 'موظف النادي',
}

export enum PlanStatus {
  PENDING = 'انتظار',
  IN_PROGRESS = 'قيد التنفيذ',
  EXECUTED = 'منفذة',
  NOT_EXECUTED = 'غير منفذة',
}

export interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface SliderImage {
  url: string;
  title: string;
}

export interface SystemSettings {
  clubName: string;
  logoUrl: string;
  clubMission?: string; // New field for footer description
  socialLinks: SocialLinks;
  sliderImages: SliderImage[];
}

export interface Supervisor {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  image: string;
  signature?: string; // New field for auto-signing
  password?: string; // New field for custom login
}

export interface DistinguishedSupervisor {
  id: string;
  supervisorId: string;
  monthYear: string; // YYYY-MM
  notes?: string;
  awardImage?: string; // Image specific to the award
}

export interface ProgramPlan {
  id: string;
  supervisorId: string;
  supervisorName: string; // Denormalized for display
  monthYear: string;
  date: string;
  programName: string;
  domain: string; // e.g., Cultural, Sports
  duration: string;
  targetAudience: string;
  participantsCount: number;
  budget: number;
  executorName: string;
  status: PlanStatus;
  notes?: string;
}

export interface ProgramReport {
  id: string;
  reportNumber: string; // New field
  planId: string;
  programName: string;
  domain: string;
  date: string;
  targetAudience: string;
  participantsCount: number;
  budget: number;
  objectives: string;
  description: string;
  images: string[]; // 4 images
  executorName: string;
  managerName: string;
  executorSignature?: string; // Base64 Image Data
  managerSignature?: string; // Base64 Image Data
}

export interface DailyReport {
  id: string;
  reportDate: string; // YYYY-MM-DD
  dayName: string; // Sunday, etc.
  clubName: string;
  
  // Staff Section
  staffNames: string; // Text Area
  staffCount: number;
  
  // Stats Section
  dailyAttendance: number;
  registeredCount: number;

  // Activities Table (Fixed 4 rows usually, but flexible)
  activities: { activity: string; beneficiaries: number }[];

  // Feedback Sections
  challenges: string;
  recommendations: string;

  // Images (Max 6)
  images: string[];
}

export interface Member {
  id: string;
  membershipNumber: string; // New Serial Number (e.g., MEM-2023-001)
  // Personal Info
  fullName: string;
  birthDate: string;
  nationalId: string;
  nationality: string;
  city?: string;
  gender?: 'ذكر' | 'أنثى';
  
  // Contact Info
  phone: string;
  guardianPhone?: string;
  emergencyPhone?: string;
  address: string;
  email?: string;
  hasSiblings?: boolean;
  siblingsCount?: number;

  // Medical Info
  chronicDiseases: string; // Used as general text or specific "None"
  allergies?: string;
  injuries?: string;
  medications?: string;
  specialCare?: string;

  // Interests & Goals
  registrationGoal?: string[];
  desiredActivities?: string[];
  otherInterests?: string[];

  // Membership Details
  membershipType: string; // 'daily' | 'monthly'
  educationLevel: string;
  hobbies: string;
  skills: string;
  photo: string;
  registrationDate: string;
  
  // System Fields
  status: 'active' | 'pending' | 'rejected'; // Active = Approved, Pending = Waiting Approval
  memberSignature?: string;
  guardianSignature?: string;
  guardianName?: string;
}

export interface AppStats {
  membersCount: number;
  supervisorsCount: number;
  totalPrograms: number;
  sportsPrograms: number;
  culturalPrograms: number;
  achievements: string[];
}