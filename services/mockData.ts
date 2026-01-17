
import { Supervisor, ProgramPlan, Member, UserRole, PlanStatus, AppStats, SystemSettings } from '../types';

// Mock Supervisors
export const MOCK_SUPERVISORS: Supervisor[] = [
  {
    id: 'admin_01',
    name: 'الدعم الفني (مشرف النظام)',
    role: UserRole.ADMIN,
    phone: '0500000000',
    email: 'admin@club.com',
    image: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
    password: 'admin',
  },
  {
    id: '1',
    name: 'أحمد محمد علي',
    role: UserRole.MANAGER,
    phone: '0500000001',
    email: 'manager@club.com',
    image: 'https://picsum.photos/100/100?random=1',
    password: '123',
  },
  {
    id: '2',
    name: 'سعيد عبدالله',
    role: UserRole.SUPERVISOR,
    phone: '0500000002',
    email: 'saeed@club.com',
    image: 'https://picsum.photos/100/100?random=2',
  },
  {
    id: '3',
    name: 'خالد عمر',
    role: UserRole.SUPERVISOR,
    phone: '0500000003',
    email: 'khaled@club.com',
    image: 'https://picsum.photos/100/100?random=3',
  },
  {
    id: '4',
    name: 'كابتن ياسر',
    role: UserRole.COACH,
    phone: '0500000004',
    email: 'coach@club.com',
    image: 'https://ui-avatars.com/api/?name=Coach+Yasser&background=fb923c&color=fff',
  },
  {
    id: '5',
    name: 'الأستاذ فهد',
    role: UserRole.CULTURAL_SUPERVISOR,
    phone: '0500000005',
    email: 'cultural@club.com',
    image: 'https://ui-avatars.com/api/?name=Cultural+Fahad&background=8b5cf6&color=fff',
  },
];

// Mock Plans
export const MOCK_PLANS: ProgramPlan[] = [
  {
    id: '101',
    supervisorId: '2',
    supervisorName: 'سعيد عبدالله',
    monthYear: '2023-10',
    date: '2023-10-15',
    programName: 'دوري كرة القدم',
    domain: 'رياضي',
    duration: '3 ساعات',
    targetAudience: 'شباب',
    participantsCount: 40,
    budget: 500,
    executorName: 'سعيد عبدالله',
    status: PlanStatus.EXECUTED,
    notes: 'تم بنجاح',
  },
  {
    id: '102',
    supervisorId: '3',
    supervisorName: 'خالد عمر',
    monthYear: '2023-10',
    date: '2023-10-20',
    programName: 'ندوة ثقافية',
    domain: 'ثقافي',
    duration: 'ساعتين',
    targetAudience: 'عام',
    participantsCount: 25,
    budget: 200,
    executorName: 'خالد عمر',
    status: PlanStatus.PENDING,
    notes: '',
  },
  {
    id: '103',
    supervisorId: '2',
    supervisorName: 'سعيد عبدالله',
    monthYear: '2023-10',
    date: '2023-10-25',
    programName: 'مسابقة الجري',
    domain: 'رياضي',
    duration: 'ساعة',
    targetAudience: 'أطفال',
    participantsCount: 30,
    budget: 100,
    executorName: 'سعيد عبدالله',
    status: PlanStatus.NOT_EXECUTED,
    notes: 'تأجيل بسبب الأحوال الجوية',
  },
];

// Mock Members
export const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    membershipNumber: 'MEM-2023-0001',
    fullName: 'فهد سالم',
    nationalId: '1020304050',
    birthDate: '2005-05-15',
    nationality: 'سعودي',
    educationLevel: 'ثانوي',
    address: 'حي الروضة، بيش',
    phone: '0555555555',
    membershipType: 'رياضي',
    hobbies: 'كرة قدم',
    skills: 'العمل الجماعي',
    chronicDiseases: 'لا يوجد',
    photo: 'https://picsum.photos/200/200?random=10',
    registrationDate: '2023-01-01',
    status: 'active',
  },
];

export const MOCK_STATS: AppStats = {
  membersCount: 150,
  supervisorsCount: 12,
  totalPrograms: 45,
  sportsPrograms: 25,
  culturalPrograms: 20,
  achievements: [
    'المركز الأول في بطولة المنطقة لكرة القدم',
    'تكريم من إدارة التعليم للنشاط الثقافي',
    'إطلاق مبادرة "بيش الخضراء"',
  ],
};

// Updated to use the reliable Google User Content CDN link for the specific file ID
const CLUB_LOGO_URL = "https://lh3.googleusercontent.com/d/1QMnxxVE-Ut_TjGeBqWbqO-f_7n4mjY8y";

export const MOCK_SETTINGS: SystemSettings = {
  clubName: 'نادي الحي ببيش الترفيهي التعليمي',
  logoUrl: CLUB_LOGO_URL,
  clubMission: 'نسعى لتوفير بيئة تربوية ترفيهية جاذبة لأفراد المجتمع، لاستثمار أوقات فراغهم بما يعود عليهم بالنفع والفائدة.',
  socialLinks: {
    twitter: '#',
    facebook: '#',
    instagram: '#',
    youtube: '#'
  },
  sliderImages: [
    { url: 'https://picsum.photos/800/400?random=101', title: 'أنشطة رياضية متنوعة' },
    { url: 'https://picsum.photos/800/400?random=102', title: 'محاضرات توعوية وثقافية' },
    { url: 'https://picsum.photos/800/400?random=103', title: 'بيئة تعليمية وترفيهية آمنة' },
  ]
};

export const SLIDE_IMAGES = MOCK_SETTINGS.sliderImages; // Keep for backward compatibility if needed
