
import React from 'react';
import { Supervisor, ProgramPlan, Member, SystemSettings, DailyReport, ProgramReport, DistinguishedSupervisor, UserRole, PlanStatus } from '../types';
import { Users, Settings, FileText, Activity, Save, Trash2, Edit, Plus, X, Printer, CheckCircle, Search, Trophy, Calendar, Upload, Download, ArrowLeft, Image as ImageIcon, PenTool, Share2, Eye, Banknote, Filter } from 'lucide-react';
import MembershipForm from './MembershipForm';
import SignaturePadModal from '../components/SignaturePadModal';

interface AdminPanelProps {
  supervisors: Supervisor[];
  setSupervisors: React.Dispatch<React.SetStateAction<Supervisor[]>>;
  plans: ProgramPlan[];
  setPlans: React.Dispatch<React.SetStateAction<ProgramPlan[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  dailyReports: DailyReport[];
  setDailyReports: React.Dispatch<React.SetStateAction<DailyReport[]>>;
  reports: ProgramReport[];
  distinguished: DistinguishedSupervisor[];
  setDistinguished: React.Dispatch<React.SetStateAction<DistinguishedSupervisor[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  supervisors, setSupervisors,
  plans, setPlans,
  members, setMembers,
  settings, setSettings,
  dailyReports, setDailyReports,
  reports,
  distinguished, setDistinguished
}) => {
  const [activeTab, setActiveTab] = React.useState('supervisors');
  const [showSettings, setShowSettings] = React.useState(false);
  const [editingSupervisor, setEditingSupervisor] = React.useState<Partial<Supervisor> | null>(null);
  const [viewMember, setViewMember] = React.useState<Member | null>(null);
  const [batchPrintType, setBatchPrintType] = React.useState<'daily' | 'members' | 'daily_single' | 'plans' | 'reports' | null>(null);
  const [reportToPrint, setReportToPrint] = React.useState<DailyReport | null>(null);
  
  // Plans State
  const [editingPlan, setEditingPlan] = React.useState<Partial<ProgramPlan> | null>(null);
  const [filterSupervisorId, setFilterSupervisorId] = React.useState<string | null>(null);
  const [viewProgramReport, setViewProgramReport] = React.useState<ProgramReport | null>(null);

  // Daily Report Form State
  const [showDailyReportModal, setShowDailyReportModal] = React.useState(false);
  const [editingDailyReport, setEditingDailyReport] = React.useState<Partial<DailyReport> | null>(null);
  const [viewDailyReport, setViewDailyReport] = React.useState<DailyReport | null>(null);
  const dailyReportImageInputRef = React.useRef<HTMLInputElement>(null);

  // Signature Modal State
  const [showSignatureModal, setShowSignatureModal] = React.useState(false);
  const supervisorImageInputRef = React.useRef<HTMLInputElement>(null);
  
  // Settings Local State
  const [localSettings, setLocalSettings] = React.useState<SystemSettings>(settings);
  // Slide Management State
  const [newSlideTitle, setNewSlideTitle] = React.useState('');
  const slideImageInputRef = React.useRef<HTMLInputElement>(null);

  // Distinguished
  const [selectedDistinguished, setSelectedDistinguished] = React.useState<Partial<DistinguishedSupervisor>>({
    monthYear: new Date().toISOString().slice(0, 7)
  });
  const distinguishedImageRef = React.useRef<HTMLInputElement>(null);

  const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      return dateString.split('-').reverse().join('/');
  };

  const getArabicDay = (dateStr: string) => {
      if(!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-SA', { weekday: 'long' });
  };

  const getMonthLabel = (monthYear: string) => {
    try {
        const [year, month] = monthYear.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });
    } catch (e) {
        return monthYear;
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
      e.preventDefault();
      setSettings(localSettings);
      alert('تم حفظ الإعدادات بنجاح');
      setShowSettings(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setLocalSettings(prev => ({ ...prev, logoUrl: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddSlide = () => {
      const file = slideImageInputRef.current?.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const newSlide = {
                  url: ev.target?.result as string,
                  title: newSlideTitle || ''
              };
              setLocalSettings(prev => ({
                  ...prev,
                  sliderImages: [...(prev.sliderImages || []), newSlide]
              }));
              setNewSlideTitle('');
              if (slideImageInputRef.current) slideImageInputRef.current.value = '';
          };
          reader.readAsDataURL(file);
      } else {
          alert('يرجى اختيار صورة أولاً');
      }
  };

  const handleRemoveSlide = (index: number) => {
      setLocalSettings(prev => ({
          ...prev,
          sliderImages: prev.sliderImages.filter((_, i) => i !== index)
      }));
  };

  const handleUpdateSlideTitle = (index: number, newTitle: string) => {
      setLocalSettings(prev => {
          const updated = [...prev.sliderImages];
          updated[index].title = newTitle;
          return { ...prev, sliderImages: updated };
      });
  };

  // Supervisor Image Upload
  const handleSupervisorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setEditingSupervisor(prev => prev ? ({ ...prev, image: ev.target?.result as string }) : null);
          };
          reader.readAsDataURL(file);
      }
  };

  // Distinguished Supervisor Image Upload
  const handleDistinguishedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setSelectedDistinguished(prev => ({ ...prev, awardImage: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  // Supervisor Signature Save
  const handleSupervisorSignatureSave = (signatureData: string) => {
      setEditingSupervisor(prev => prev ? ({ ...prev, signature: signatureData }) : null);
  };

  const handleSaveSupervisor = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingSupervisor) return;

      const newSupervisor: Supervisor = {
          id: editingSupervisor.id || Math.random().toString(36).substr(2, 9),
          name: editingSupervisor.name || '',
          role: editingSupervisor.role || UserRole.SUPERVISOR,
          email: editingSupervisor.email || '',
          phone: editingSupervisor.phone || '',
          image: editingSupervisor.image || `https://ui-avatars.com/api/?name=${editingSupervisor.name}`,
          password: editingSupervisor.password,
          signature: editingSupervisor.signature
      };

      setSupervisors(prev => {
          if (editingSupervisor.id) {
              return prev.map(s => s.id === editingSupervisor.id ? newSupervisor : s);
          }
          return [...prev, newSupervisor];
      });
      setEditingSupervisor(null);
  };

  const handleDeleteSupervisor = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) {
          setSupervisors(prev => prev.filter(s => s.id !== id));
      }
  };

  // --- PLANS MANAGEMENT ---
  const handleSavePlan = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingPlan) return;
      
      const selectedSup = supervisors.find(s => s.id === editingPlan.supervisorId);
      
      const newPlan: ProgramPlan = {
          id: editingPlan.id || Math.random().toString(36).substr(2, 9),
          supervisorId: editingPlan.supervisorId || '',
          supervisorName: selectedSup?.name || editingPlan.supervisorName || '',
          programName: editingPlan.programName || '',
          date: editingPlan.date || '',
          monthYear: editingPlan.date ? editingPlan.date.slice(0, 7) : new Date().toISOString().slice(0, 7),
          domain: editingPlan.domain || 'عام',
          duration: editingPlan.duration || '',
          targetAudience: editingPlan.targetAudience || '',
          participantsCount: Number(editingPlan.participantsCount) || 0,
          budget: Number(editingPlan.budget) || 0,
          executorName: editingPlan.executorName || selectedSup?.name || '',
          status: editingPlan.status || PlanStatus.PENDING,
          notes: editingPlan.notes || ''
      };

      setPlans(prev => {
          if (editingPlan.id) {
              return prev.map(p => p.id === editingPlan.id ? newPlan : p);
          }
          return [...prev, newPlan];
      });
      setEditingPlan(null);
      alert('تم حفظ الخطة بنجاح');
  };

  const handleDeletePlan = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
          setPlans(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleMemberAction = (member: Member, status: 'active' | 'rejected') => {
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status } : m));
  };

  const handleDeleteMember = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا العضو؟')) {
          setMembers(prev => prev.filter(m => m.id !== id));
      }
  };

  const handleSaveDistinguished = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedDistinguished.supervisorId) return;

      const newEntry: DistinguishedSupervisor = {
          id: Math.random().toString(36).substr(2, 9),
          supervisorId: selectedDistinguished.supervisorId,
          monthYear: selectedDistinguished.monthYear || new Date().toISOString().slice(0, 7),
          notes: selectedDistinguished.notes,
          awardImage: selectedDistinguished.awardImage
      };

      setDistinguished(prev => [...prev.filter(d => d.monthYear !== newEntry.monthYear), newEntry]);
      setSelectedDistinguished({ monthYear: new Date().toISOString().slice(0, 7) });
  };
  
  const handleDeleteDistinguished = (id: string) => {
       setDistinguished(prev => prev.filter(d => d.id !== id));
  };

  const handlePrintDailyReports = () => setBatchPrintType('daily');
  const handlePrintPlans = () => setBatchPrintType('plans');
  const handlePrintReports = () => setBatchPrintType('reports');
  const handlePrintMembers = () => setBatchPrintType('members');

  const handlePrintSingleReport = (report: DailyReport) => {
      setReportToPrint(report);
      setBatchPrintType('daily_single');
  };

  const handleDeleteDailyReport = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا التقرير اليومي؟')) {
          setDailyReports(prev => prev.filter(r => r.id !== id));
      }
  };

  // --- Daily Report Form Handlers ---
  const getActivitiesForDate = (dateStr: string) => {
      const dayPlans = plans.filter(p => p.date === dateStr);
      const mappedActivities = dayPlans.map(p => ({
          activity: p.programName,
          beneficiaries: p.participantsCount || 0
      }));
      while(mappedActivities.length < 6) { // Ensure 6 rows
          mappedActivities.push({ activity: '', beneficiaries: 0 });
      }
      return mappedActivities.slice(0, 6);
  };

  const handleOpenDailyReportModal = () => {
      const today = new Date().toISOString().slice(0, 10);
      const staffList = supervisors.filter(s => s.role !== UserRole.ADMIN).map(s => `${s.name} - ${s.role}`);
      const staffNames = staffList.join('\n');
      const staffCount = staffList.length;
      const registeredCount = members.length;
      const initialActivities = getActivitiesForDate(today);

      setEditingDailyReport({
          id: Math.random().toString(36).substr(2, 9),
          reportDate: today,
          dayName: getArabicDay(today),
          clubName: settings.clubName,
          staffCount: staffCount,
          staffNames: staffNames,
          dailyAttendance: 0,
          registeredCount: registeredCount,
          activities: initialActivities,
          challenges: '',
          recommendations: '',
          images: []
      });
      setShowDailyReportModal(true);
  };

  const handleEditDailyReport = (report: DailyReport) => {
      // Ensure activities are 6 rows for editing
      const activities = [...(report.activities || [])];
      while(activities.length < 6) activities.push({activity: '', beneficiaries: 0});
      setEditingDailyReport({ ...report, activities: activities.slice(0,6) });
      setShowDailyReportModal(true);
  };

  const handleDailyReportDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value;
      const updatedActivities = getActivitiesForDate(date);
      setEditingDailyReport(prev => prev ? ({
          ...prev,
          reportDate: date,
          dayName: getArabicDay(date),
          activities: updatedActivities
      }) : null);
  };

  const handleDailyReportActivityChange = (index: number, field: 'activity' | 'beneficiaries', value: string | number) => {
      if (!editingDailyReport) return;
      const newActivities = [...(editingDailyReport.activities || [])];
      // Fill gaps if needed
      while(newActivities.length <= index) newActivities.push({ activity: '', beneficiaries: 0 });
      
      if (!newActivities[index]) newActivities[index] = { activity: '', beneficiaries: 0 };
      newActivities[index] = { ...newActivities[index], [field]: value };
      setEditingDailyReport({ ...editingDailyReport, activities: newActivities });
  };

  // Helper to handle staff lines as array rows for the 6-row table
  const handleStaffLineChange = (index: number, value: string) => {
      if (!editingDailyReport) return;
      const lines = (editingDailyReport.staffNames || '').split('\n');
      while(lines.length <= index) lines.push('');
      lines[index] = value;
      setEditingDailyReport({ ...editingDailyReport, staffNames: lines.join('\n') });
  };

  const handleDailyReportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !editingDailyReport) return;
      
      const fileReaders: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
          fileReaders.push(new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(files[i]);
          }));
      }

      Promise.all(fileReaders).then((base64Images) => {
          setEditingDailyReport(prev => prev ? ({
              ...prev,
              images: [...(prev.images || []), ...base64Images].slice(0, 3) // Max 3
          }) : null);
      });
      if (dailyReportImageInputRef.current) dailyReportImageInputRef.current.value = '';
  };

  const removeDailyReportImage = (index: number) => {
      if (!editingDailyReport) return;
      setEditingDailyReport({
          ...editingDailyReport,
          images: editingDailyReport.images?.filter((_, i) => i !== index)
      });
  };

  const handleSaveDailyReportForm = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingDailyReport) return;
      const reportToSave: DailyReport = {
          id: editingDailyReport.id!,
          reportDate: editingDailyReport.reportDate!,
          dayName: editingDailyReport.dayName || getArabicDay(editingDailyReport.reportDate!),
          clubName: editingDailyReport.clubName || settings.clubName,
          staffNames: editingDailyReport.staffNames || '',
          staffCount: Number(editingDailyReport.staffCount) || 0,
          dailyAttendance: Number(editingDailyReport.dailyAttendance) || 0,
          registeredCount: Number(editingDailyReport.registeredCount) || 0,
          activities: editingDailyReport.activities || [],
          challenges: editingDailyReport.challenges || '',
          recommendations: editingDailyReport.recommendations || '',
          images: editingDailyReport.images || []
      };
      setDailyReports(prev => {
          const index = prev.findIndex(r => r.id === reportToSave.id);
          if (index >= 0) {
              const newReports = [...prev];
              newReports[index] = reportToSave;
              return newReports;
          }
          return [reportToSave, ...prev];
      });
      setShowDailyReportModal(false);
      setEditingDailyReport(null);
  };

  const groupPlansByMonth = (plansList: ProgramPlan[]) => {
      const grouped = plansList.reduce((acc, plan) => {
          const monthKey = plan.monthYear || plan.date.slice(0, 7);
          if (!acc[monthKey]) acc[monthKey] = [];
          acc[monthKey].push(plan);
          return acc;
      }, {} as Record<string, ProgramPlan[]>);
      const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      return { grouped, sortedKeys };
  };

  const displayedPlans = filterSupervisorId 
      ? plans.filter(p => p.supervisorId === filterSupervisorId)
      : plans;
  const { grouped: groupedPlans, sortedKeys: sortedMonthKeys } = groupPlansByMonth(displayedPlans);

  // --- Render Views ---

  // BATCH PRINT VIEW: PLANS (Updated padding)
  if (batchPrintType === 'plans') {
      const manager = supervisors.find(s => s.role === UserRole.MANAGER);
      const managerName = manager?.name || 'أحمد محمد علي';
      const managerSignature = manager?.signature;

      return (
          <div className="bg-white min-h-screen">
              <style>{`@media print { @page { margin: 0; size: A4; } body { margin: 0; -webkit-print-color-adjust: exact; } }`}</style>

              <div className="print:hidden p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 z-50 shadow-lg">
                  <div className="flex items-center gap-4">
                      <Calendar className="text-brand-orange" size={24} />
                      <span className="text-xl font-bold">معاينة طباعة الخطط ({sortedMonthKeys.length} أشهر)</span>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-md"><Printer size={20}/> طباعة / حفظ</button>
                      <button onClick={() => setBatchPrintType(null)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md flex items-center gap-2"><X size={20}/> إغلاق</button>
                  </div>
              </div>
              <div className="max-w-[210mm] mx-auto bg-white p-8 md:p-0 print:w-full print:max-w-none print:m-0">
                  {sortedMonthKeys.map(month => (
                      <div key={month} className="print:break-after-page min-h-[297mm] h-[297mm] p-6 print:px-8 print:py-6 relative flex flex-col mb-10 print:mb-0 w-full bg-white print:border-none border-b-8 border-gray-100 last:border-0 overflow-hidden">
                          <div className="w-full mb-4 flex justify-center">
                               <img src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" className="w-full h-20 object-contain bg-white" alt="Header" />
                          </div>
                          <div className="text-center mb-2">
                              <h1 className="text-xl font-bold text-[#2e2344] mb-1 print:text-[#2e2344]">خطة البرامج والأنشطة</h1>
                              <h2 className="text-lg text-gray-600 font-medium">{getMonthLabel(month)}</h2>
                              <div className="h-1 w-24 bg-[#cbb06a] mx-auto rounded-full mt-1 print:bg-[#cbb06a]"></div>
                          </div>
                          <div className="flex-grow">
                              <table className="w-full text-right border-collapse border border-black text-xs text-black" dir="rtl">
                                  <thead>
                                      <tr className="bg-[#2e2344] text-white text-center print:bg-[#2e2344] print:text-white print-color-adjust-exact h-8">
                                          <th className="p-1 border border-black w-8">م</th>
                                          <th className="p-1 border border-black">اسم البرنامج</th>
                                          <th className="p-1 border border-black w-14">المجال</th>
                                          <th className="p-1 border border-black w-20">التاريخ</th>
                                          <th className="p-1 border border-black w-14">المستفيدين</th>
                                          <th className="p-1 border border-black w-14">الميزانية</th>
                                          <th className="p-1 border border-black w-20">المشرف</th>
                                          <th className="p-1 border border-black w-20">ملاحظات</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {groupedPlans[month].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((p, idx) => (
                                          <tr key={p.id} className="text-center h-8 text-black">
                                              <td className="p-1 border border-black font-bold">{idx + 1}</td>
                                              <td className="p-1 border border-black font-bold text-right truncate max-w-[150px]">{p.programName}</td>
                                              <td className="p-1 border border-black">{p.domain}</td>
                                              <td className="p-1 border border-black font-mono leading-tight">{getArabicDay(p.date)}<br/>{formatDate(p.date)}</td>
                                              <td className="p-1 border border-black">{p.participantsCount}</td>
                                              <td className="p-1 border border-black">{p.budget}</td>
                                              <td className="p-1 border border-black truncate max-w-[80px]">{p.executorName}</td>
                                              <td className="p-1 border border-black truncate max-w-[80px]">{p.notes || '-'}</td>
                                          </tr>
                                      ))}
                                      {groupedPlans[month].length < 12 && Array.from({length: 12 - groupedPlans[month].length}).map((_, i) => (
                                          <tr key={`empty-${i}`} className="h-8">
                                            <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                          <div className="mt-auto pt-4 border-t border-black page-break-inside-avoid">
                              <div className="flex justify-end items-end px-8">
                                  <div className="text-center w-1/3">
                                      <p className="font-bold text-black mb-2 text-sm">مدير النادي</p>
                                      <p className="mb-1 text-xs font-bold text-black">{managerName}</p>
                                      {managerSignature && <img src={managerSignature} alt="Signature" className="h-16 mx-auto object-contain"/>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  // BATCH PRINT VIEW: REPORTS (Updated padding)
  if (batchPrintType === 'reports') {
      return (
          <div className="bg-white min-h-screen">
              <style>{`@media print { @page { margin: 0; size: A4; } body { margin: 0; -webkit-print-color-adjust: exact; } }`}</style>
              <div className="print:hidden p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 z-50 shadow-lg">
                  <div className="flex items-center gap-4">
                      <FileText className="text-brand-teal" size={24} />
                      <span className="text-xl font-bold">معاينة طباعة التقارير ({reports.length})</span>
                  </div>
                   <div className="flex gap-3">
                      <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-md">
                          <Printer size={20}/> طباعة / حفظ
                      </button>
                      <button onClick={() => setBatchPrintType(null)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md flex items-center gap-2">
                          <X size={20}/> إغلاق
                      </button>
                  </div>
              </div>
              <div className="max-w-[210mm] mx-auto p-8 md:p-0">
                  {reports.length > 0 ? reports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(rep => (
                      <div key={rep.id} className="print:break-after-page h-[297mm] w-full flex flex-col bg-white p-6 print:px-8 print:py-6 relative mb-8 print:mb-0 border-b-2 border-gray-100 print:border-none overflow-hidden">
                          <div className="w-full mb-4 flex justify-center">
                               <img src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" className="w-full h-20 object-contain bg-white" alt="Header Banner"/>
                          </div>
                          <div className="flex justify-between items-start mb-4 relative">
                              <div className="flex-grow text-center">
                                  <h2 className="text-2xl font-bold text-black decoration-2 underline decoration-blue-200 underline-offset-8 inline-block mt-2">تقرير برنامج {rep.programName}</h2>
                              </div>
                              <div className="absolute left-0 -top-2 border border-black p-2 rounded text-[10px] font-bold text-black text-center min-w-[100px] bg-white">
                                  <p className="border-b border-gray-300 pb-1 mb-1">رقم التقرير: {rep.reportNumber}</p>
                                  <p>التاريخ: {formatDate(rep.date)}</p>
                              </div>
                          </div>
                          <div className="border border-black rounded-lg overflow-hidden mb-4 text-sm text-black">
                              <div className="flex border-b border-black">
                                  <div className="w-1/2 flex border-l border-black">
                                      <div className="w-1/3 bg-[#2dd4bf]/20 p-2 font-bold flex items-center justify-center print:bg-[#2dd4bf]/20 flex-shrink-0">اسم البرنامج</div>
                                      <div className="w-2/3 p-2 flex items-center font-bold bg-[#2dd4bf]/5 print:bg-[#2dd4bf]/5 justify-center text-center">{rep.programName}</div>
                                  </div>
                                  <div className="w-1/2 flex">
                                      <div className="w-1/3 bg-[#fb923c]/20 p-2 font-bold flex items-center justify-center border-r border-black print:bg-[#fb923c]/20 flex-shrink-0">التاريخ</div>
                                      <div className="w-2/3 p-2 flex items-center font-bold bg-[#fb923c]/5 justify-center font-mono print:bg-[#fb923c]/5">{formatDate(rep.date)}</div>
                                  </div>
                              </div>
                              <div className="flex">
                                  <div className="w-1/2 flex border-l border-black">
                                      <div className="w-1/3 bg-[#4338ca]/20 p-2 font-bold flex items-center justify-center print:bg-[#4338ca]/20 flex-shrink-0">المجال</div>
                                      <div className="w-2/3 p-2 flex items-center font-bold bg-[#4338ca]/5 justify-center print:bg-[#4338ca]/5">{rep.domain}</div>
                                  </div>
                                  <div className="w-1/2 flex">
                                      <div className="w-1/3 bg-[#f472b6]/20 p-2 font-bold flex items-center justify-center border-r border-black print:bg-[#f472b6]/20 flex-shrink-0">المستفيدين</div>
                                      <div className="w-2/3 p-2 flex items-center font-bold bg-[#f472b6]/5 justify-center font-mono print:bg-[#f472b6]/5">{rep.participantsCount}</div>
                                  </div>
                              </div>
                          </div>
                          <div className="border border-black rounded p-2 mb-2 min-h-[60px]">
                              <label className="font-bold text-black block mb-1 border-b border-gray-300 pb-1 w-full text-xs">وصف البرنامج وما تم تنفيذه:</label>
                              <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight line-clamp-3">{rep.description}</p>
                          </div>
                          <div className="border border-black rounded p-2 mb-2 min-h-[60px]">
                              <label className="font-bold text-black block mb-1 border-b border-gray-300 pb-1 w-full text-xs">أبرز الإيجابيات والمنجزات:</label>
                              <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight line-clamp-3">{rep.objectives}</p>
                          </div>
                          <div className="flex-grow mb-0">
                              <label className="font-bold text-black block mb-2 text-sm">التوثيق الصوري:</label>
                              <div className="grid grid-cols-2 gap-6">
                                  {rep.images && rep.images.slice(0,4).map((img, idx) => (
                                      <div key={idx} className="h-48 border-4 border-double border-[#2e2344] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                                          <img src={img} className="w-full h-full object-cover" alt="توثيق" />
                                      </div>
                                  ))}
                                  {(!rep.images || rep.images.length === 0) && (
                                      <p className="text-gray-400 text-sm col-span-2 text-center py-8 bg-gray-50 rounded border border-dashed">لا يوجد صور مرفقة</p>
                                  )}
                              </div>
                          </div>
                          <div className="flex justify-between items-end mt-auto pt-4 border-t border-black page-break-inside-avoid">
                              <div className="text-center w-1/3">
                                  <p className="font-bold text-black mb-2 text-sm">مشرف البرنامج</p>
                                  <p className="mb-1 text-xs font-bold text-black">{rep.executorName}</p>
                                  {rep.executorSignature && <img src={rep.executorSignature} alt="Signature" className="h-16 mx-auto object-contain"/>}
                              </div>
                              <div className="text-center w-1/3">
                                  <p className="font-bold text-black mb-2 text-sm">مدير النادي</p>
                                  <p className="mb-1 text-xs font-bold text-black">{rep.managerName}</p>
                                  {rep.managerSignature && <img src={rep.managerSignature} alt="Signature" className="h-16 mx-auto object-contain"/>}
                              </div>
                          </div>
                      </div>
                  )) : (
                      <div className="h-screen flex items-center justify-center text-gray-500">لا توجد تقارير للطباعة</div>
                  )}
              </div>
          </div>
      );
  }

  // ... (Rest of component including BATCH PRINT VIEW: DAILY REPORTS, Member Modal, and Admin UI)
  if (batchPrintType === 'daily' || batchPrintType === 'daily_single') {
      // ... (Content identical to previous but can be collapsed for brevity in this response if allowed, but providing full file per instruction)
      const reportsToRender = batchPrintType === 'daily_single' && reportToPrint ? [reportToPrint] : dailyReports;
      const manager = supervisors.find(s => s.role === UserRole.MANAGER);

      return (
          <div className="bg-white min-h-screen">
               <style>{`@media print { @page { margin: 0; size: A4; } body { margin: 0; -webkit-print-color-adjust: exact; } }`}</style>
               <div className="print:hidden p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 z-50 shadow-lg">
                  <div className="flex items-center gap-4"><FileText className="text-yellow-400" size={24} /><span className="text-xl font-bold">معاينة طباعة التقارير اليومية ({reportsToRender.length})</span></div>
                  <div className="flex gap-3">
                      <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-md"><Printer size={20}/> طباعة / حفظ</button>
                      <button onClick={() => setBatchPrintType(null)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md flex items-center gap-2"><X size={20}/> إغلاق</button>
                  </div>
               </div>
               <div className="max-w-[210mm] mx-auto bg-white p-8 md:p-0">
                   {reportsToRender.map((report) => (
                      <div key={report.id} className="print:break-after-page h-[297mm] w-full flex flex-col bg-white p-8 print:p-8 relative mb-8 print:mb-0 border-b-2 border-gray-100 print:border-none">
                          <div className="mb-2"><img src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" className="w-full h-auto object-contain" alt="Header" /></div>
                          <div className="text-center mb-2"><h1 className="text-3xl font-bold text-[#2e2344] mb-2">التقرير اليومي</h1><div className="h-1 w-24 bg-[#cbb06a] mx-auto rounded-full"></div></div>
                          <div className="border border-black text-sm mb-2">
                              <div className="flex border-b border-black">
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">اسم النادي</div><div className="w-1/4 p-1 text-center flex items-center justify-center font-bold bg-gray-50 border-l border-black">{report.clubName}</div>
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">المنطقة</div><div className="w-1/4 p-1 text-center flex items-center justify-center font-bold bg-gray-50">جازان</div>
                              </div>
                              <div className="flex">
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">اليوم</div><div className="w-1/4 p-1 text-center flex items-center justify-center font-bold bg-gray-50 border-l border-black">{report.dayName}</div>
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">التاريخ</div><div className="w-1/4 p-1 text-center flex items-center justify-center font-bold bg-gray-50 font-mono">{formatDate(report.reportDate)}</div>
                              </div>
                          </div>
                          <div className="border border-black text-sm mb-2 flex">
                              <div className="w-1/2 flex border-l border-black"><div className="w-1/3 bg-[#eaddcf] p-1 font-bold text-center flex items-center justify-center border-l border-black">التردد اليومي</div><div className="w-2/3 p-1 text-center font-bold text-xl flex items-center justify-center bg-white">{report.dailyAttendance}</div></div>
                              <div className="w-1/2 flex"><div className="w-1/3 bg-[#eaddcf] p-1 font-bold text-center flex items-center justify-center border-l border-black">المسجلين</div><div className="w-2/3 p-1 text-center font-bold text-xl flex items-center justify-center bg-white">{report.registeredCount}</div></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                              {/* Staff Table - 6 Rows */}
                              <div className="border border-black flex flex-col h-60">
                                  <div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">فريق العمل</div>
                                  <div className="flex bg-[#eaddcf] font-bold text-center border-b border-black text-xs">
                                      <div className="w-10 p-1 border-l border-black">م</div>
                                      <div className="flex-grow p-1">الاسم</div>
                                  </div>
                                  <div className="flex-grow flex flex-col">
                                      {Array.from({ length: 6 }).map((_, i) => {
                                          const names = report.staffNames.split('\n').filter(n => n.trim());
                                          const name = names[i] || '';
                                          return (
                                              <div key={i} className="flex border-b border-black last:border-0 text-xs flex-grow items-center">
                                                  <div className="w-10 p-1 border-l border-black text-center font-bold border-black h-full flex items-center justify-center">{i + 1}</div>
                                                  <div className="flex-grow p-1 flex items-center pr-2">{name}</div>
                                              </div>
                                          )
                                      })}
                                  </div>
                                  <div className="border-t border-black flex text-xs">
                                      <div className="w-1/3 bg-[#eaddcf] p-1 text-center font-bold border-l border-black flex items-center justify-center">العدد</div>
                                      <div className="w-2/3 p-1 text-center font-bold">{report.staffCount}</div>
                                  </div>
                              </div>
                              {/* Activities Table - 6 Rows */}
                              <div className="border border-black flex flex-col h-60">
                                  <div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">الأنشطة والبرامج</div>
                                  <div className="flex-grow flex flex-col">
                                      <div className="flex bg-[#eaddcf] font-bold text-center border-b border-black text-xs">
                                          <div className="w-10 p-1 border-l border-black">م</div>
                                          <div className="flex-grow p-1 border-l border-black">النشاط</div>
                                          <div className="w-1/4 p-1">المستفيدين</div>
                                      </div>
                                      {Array.from({ length: 6 }).map((_, i) => { 
                                          const act = report.activities && report.activities[i] ? report.activities[i] : { activity: '', beneficiaries: 0 }; 
                                          return (
                                              <div key={i} className="flex border-b border-black last:border-0 text-xs flex-grow items-center">
                                                  <div className="w-10 p-1 border-l border-black text-center font-bold border-black h-full flex items-center justify-center">{i + 1}</div>
                                                  <div className="flex-grow p-1 border-l border-black flex items-center pr-2">{act.activity}</div>
                                                  <div className="w-1/4 p-1 text-center font-bold">{act.beneficiaries || ''}</div>
                                              </div>
                                          ); 
                                      })}
                                  </div>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                              <div className="border border-black h-24 overflow-hidden"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">التحديات والصعوبات</div><div className="p-1 text-xs leading-relaxed">{report.challenges}</div></div>
                              <div className="border border-black h-24 overflow-hidden"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">توصيات ومقترحات</div><div className="p-1 text-xs leading-relaxed">{report.recommendations}</div></div>
                          </div>
                          <div className="border border-black flex flex-col flex-grow mt-1"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">التوثيق المصور</div><div className="flex-grow p-1">{report.images && report.images.length > 0 ? (<div className="grid grid-cols-3 gap-2 h-full">{report.images.slice(0, 3).map((img, i) => (<div key={i} className="border border-gray-200 h-32 relative"><img src={img} className="w-full h-full object-cover absolute inset-0" alt="Report"/></div>))}</div>) : (<div className="h-full min-h-[150px] flex items-center justify-center text-gray-400 text-xs">لا يوجد صور مرفقة</div>)}</div></div>
                          <div className="mt-4 px-8 pb-2"><div className="flex justify-between items-end"><div className="text-right"><p className="font-bold mb-4 text-sm">مدير النادي</p><p className="font-medium text-sm">أحمد محمد علي</p></div><div className="text-left w-48 relative">{manager?.signature && <img src={manager.signature} className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 object-contain mix-blend-multiply print:block hidden" alt="Sig" />}<div className="border-b border-black pb-2 text-center text-sm font-bold mt-8">التوقيع</div></div></div></div>
                      </div>
                   ))}
               </div>
          </div>
      );
  }

  // BATCH PRINT VIEW: MEMBERS
  if (batchPrintType === 'members') {
      return (
          <div className="bg-white min-h-screen">
              {/* Hide Browser Headers/Footers */}
              <style>{`@media print { @page { margin: 0; } body { margin: 0; } }`}</style>
              
              <div className="print:hidden p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 z-50 shadow-lg">
                  <div className="flex items-center gap-4"><Users className="text-blue-400" size={24} /><span className="text-xl font-bold">طباعة سجلات الأعضاء ({members.length})</span></div>
                  <div className="flex gap-3">
                      <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-md"><Printer size={20}/> طباعة الكل</button>
                      <button onClick={() => setBatchPrintType(null)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md flex items-center gap-2"><X size={20}/> إغلاق</button>
                  </div>
              </div>
              <div className="max-w-[210mm] mx-auto bg-white p-0">
                  {members.map(member => (
                      <div key={member.id} className="print:break-after-page min-h-[297mm] mb-8 print:mb-0 border-b-8 border-gray-100 print:border-none">
                         <MembershipForm 
                            members={members} 
                            setMembers={setMembers} 
                            settings={settings} 
                            initialData={member} 
                            readOnly={true} 
                            hidePrintButton={true}
                         />
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <SignaturePadModal isOpen={showSignatureModal} title="توقيع المشرف" onClose={() => setShowSignatureModal(false)} onSave={handleSupervisorSignatureSave} />

      {/* VIEW PROGRAM REPORT MODAL (Updated padding) */}
      {viewProgramReport && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-2 pb-10">
              <div className="bg-white rounded-none md:rounded-2xl shadow-xl w-full max-w-[210mm] p-0 overflow-hidden animate-fade-in relative my-4 md:my-8 print:my-0 print:shadow-none print:w-full">
                  <button onClick={() => setViewProgramReport(null)} className="absolute top-4 left-4 z-10 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 print:hidden"><X size={20}/></button>
                  <div className="flex justify-end p-4 print:hidden absolute top-2 right-2 z-10">
                       <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-gray-900"><Printer size={16}/> طباعة</button>
                  </div>
                  <div className="bg-white p-4 md:p-8 min-h-[297mm] flex flex-col print:px-8 print:py-6">
                       <div className="w-full mb-4 flex justify-center">
                            <img src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" className="w-full h-20 object-contain bg-white" alt="Header Banner"/>
                       </div>
                       <div className="flex justify-between items-start mb-4 relative">
                           <div className="flex-grow text-center">
                               <h2 className="text-2xl font-bold text-black decoration-2 underline decoration-blue-200 underline-offset-8 inline-block mt-2">تقرير برنامج {viewProgramReport.programName}</h2>
                           </div>
                           <div className="absolute left-0 -top-2 border border-black p-2 rounded text-[10px] font-bold text-black text-center min-w-[100px] bg-white">
                               <p className="border-b border-gray-300 pb-1 mb-1">رقم التقرير: {viewProgramReport.reportNumber}</p>
                               <p>التاريخ: {formatDate(viewProgramReport.date)}</p>
                           </div>
                       </div>
                       <div className="border border-black rounded-lg overflow-hidden mb-4 text-sm text-black">
                           <div className="flex border-b border-black">
                               <div className="w-1/2 flex border-l border-black">
                                   <div className="w-1/3 bg-[#2dd4bf]/20 p-2 font-bold flex items-center justify-center print:bg-[#2dd4bf]/20 flex-shrink-0">اسم البرنامج</div>
                                   <div className="w-2/3 p-2 flex items-center font-bold bg-[#2dd4bf]/5 print:bg-[#2dd4bf]/5 justify-center text-center">{viewProgramReport.programName}</div>
                               </div>
                               <div className="w-1/2 flex">
                                   <div className="w-1/3 bg-[#fb923c]/20 p-2 font-bold flex items-center justify-center border-r border-black print:bg-[#fb923c]/20 flex-shrink-0">التاريخ</div>
                                   <div className="w-2/3 p-2 flex items-center font-bold bg-[#fb923c]/5 justify-center font-mono print:bg-[#fb923c]/5">{formatDate(viewProgramReport.date)}</div>
                               </div>
                           </div>
                           <div className="flex">
                               <div className="w-1/2 flex border-l border-black">
                                   <div className="w-1/3 bg-[#4338ca]/20 p-2 font-bold flex items-center justify-center print:bg-[#4338ca]/20 flex-shrink-0">المجال</div>
                                   <div className="w-2/3 p-2 flex items-center font-bold bg-[#4338ca]/5 justify-center print:bg-[#4338ca]/5">{viewProgramReport.domain}</div>
                               </div>
                               <div className="w-1/2 flex">
                                   <div className="w-1/3 bg-[#f472b6]/20 p-2 font-bold flex items-center justify-center border-r border-black print:bg-[#f472b6]/20 flex-shrink-0">المستفيدين</div>
                                   <div className="w-2/3 p-2 flex items-center font-bold bg-[#f472b6]/5 justify-center font-mono print:bg-[#f472b6]/5">{viewProgramReport.participantsCount}</div>
                               </div>
                           </div>
                       </div>
                       <div className="border border-black rounded p-2 mb-2 min-h-[60px]">
                           <label className="font-bold text-black block mb-1 border-b border-gray-300 pb-1 w-full text-xs">وصف البرنامج وما تم تنفيذه:</label>
                           <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight line-clamp-3">{viewProgramReport.description}</p>
                       </div>
                       <div className="border border-black rounded p-2 mb-2 min-h-[60px]">
                           <label className="font-bold text-black block mb-1 border-b border-gray-300 pb-1 w-full text-xs">أبرز الإيجابيات والمنجزات:</label>
                           <p className="text-xs font-bold text-black whitespace-pre-wrap leading-tight line-clamp-3">{viewProgramReport.objectives}</p>
                       </div>
                       <div className="flex-grow mb-0">
                           <label className="font-bold text-black block mb-2 text-sm">التوثيق الصوري:</label>
                           <div className="grid grid-cols-2 gap-6">
                               {viewProgramReport.images && viewProgramReport.images.slice(0,4).map((img, idx) => (
                                   <div key={idx} className="h-48 border-4 border-double border-[#2e2344] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                                       <img src={img} className="w-full h-full object-cover" alt="توثيق" />
                                   </div>
                               ))}
                               {(!viewProgramReport.images || viewProgramReport.images.length === 0) && (
                                   <p className="text-gray-400 text-sm col-span-2 text-center py-8 bg-gray-50 rounded border border-dashed">لا يوجد صور مرفقة</p>
                               )}
                           </div>
                       </div>
                       <div className="flex justify-between items-end mt-auto pt-4 border-t border-black page-break-inside-avoid">
                          <div className="text-center w-1/3">
                              <p className="font-bold text-black mb-2 text-sm">مشرف البرنامج</p>
                              <p className="mb-1 text-xs font-bold text-black">{viewProgramReport.executorName}</p>
                              {viewProgramReport.executorSignature && <img src={viewProgramReport.executorSignature} alt="Signature" className="h-16 mx-auto object-contain"/>}
                          </div>
                          <div className="text-center w-1/3">
                              <p className="font-bold text-black mb-2 text-sm">مدير النادي</p>
                              <p className="mb-1 text-xs font-bold text-black">{viewProgramReport.managerName}</p>
                              {viewProgramReport.managerSignature && <img src={viewProgramReport.managerSignature} alt="Signature" className="h-16 mx-auto object-contain"/>}
                          </div>
                       </div>
                  </div>
              </div>
          </div>
      )}

      {/* VIEW DAILY REPORT MODAL */}
      {viewDailyReport && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-2 pb-10">
            <div className="bg-white rounded-none md:rounded-2xl shadow-xl w-full max-w-[210mm] p-0 overflow-hidden animate-fade-in relative my-4 md:my-8">
               <button onClick={() => setViewDailyReport(null)} className="absolute top-4 left-4 z-10 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"><X size={20}/></button>
               <div className="flex flex-col min-h-[297mm]">
                   <div className="w-full"><img src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" className="w-full h-auto object-contain" alt="Header" /></div>
                   <div className="p-8 md:p-12 pt-4 flex-grow flex flex-col gap-4">
                       <div className="text-center mb-6"><h1 className="text-3xl font-bold text-[#2e2344] mb-2">التقرير اليومي</h1><div className="h-1 w-24 bg-[#cbb06a] mx-auto rounded-full"></div></div>
                       <div className="border border-black text-sm">
                           <div className="flex border-b border-black">
                               <div className="w-1/4 bg-[#2e2344] text-white p-2 font-bold text-center border-l border-black flex items-center justify-center">اسم النادي</div><div className="w-1/4 p-2 text-center flex items-center justify-center font-bold bg-gray-50 border-l border-black">{viewDailyReport.clubName}</div>
                               <div className="w-1/4 bg-[#2e2344] text-white p-2 font-bold text-center border-l border-black flex items-center justify-center">المنطقة</div><div className="w-1/4 p-2 text-center flex items-center justify-center font-bold bg-gray-50">جازان</div>
                           </div>
                           <div className="flex">
                               <div className="w-1/4 bg-[#2e2344] text-white p-2 font-bold text-center border-l border-black flex items-center justify-center">اليوم</div><div className="w-1/4 p-2 text-center flex items-center justify-center font-bold bg-gray-50 border-l border-black">{viewDailyReport.dayName}</div>
                               <div className="w-1/4 bg-[#2e2344] text-white p-2 font-bold text-center border-l border-black flex items-center justify-center">التاريخ</div><div className="w-1/4 p-2 text-center flex items-center justify-center font-bold bg-gray-50 font-mono">{formatDate(viewDailyReport.reportDate)}</div>
                           </div>
                       </div>
                       <div className="border border-black text-sm flex">
                           <div className="w-1/2 flex border-l border-black"><div className="w-1/3 bg-[#eaddcf] p-2 font-bold text-center flex items-center justify-center border-l border-black">التردد اليومي</div><div className="w-2/3 p-2 text-center font-bold text-xl flex items-center justify-center bg-white">{viewDailyReport.dailyAttendance}</div></div>
                           <div className="w-1/2 flex"><div className="w-1/3 bg-[#eaddcf] p-2 font-bold text-center flex items-center justify-center border-l border-black">المسجلين</div><div className="w-2/3 p-2 text-center font-bold text-xl flex items-center justify-center bg-white">{viewDailyReport.registeredCount}</div></div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="border border-black flex flex-col h-64"><div className="bg-[#2e2344] text-white p-2 text-center font-bold text-sm border-b border-black">فريق العمل</div><div className="p-2 whitespace-pre-wrap text-sm leading-[2.1rem] font-medium flex-grow overflow-hidden relative">{viewDailyReport.staffNames}</div><div className="border-t border-black flex text-xs"><div className="w-1/3 bg-[#eaddcf] p-1 text-center font-bold border-l border-black flex items-center justify-center">العدد</div><div className="w-2/3 p-1 text-center font-bold">{viewDailyReport.staffCount}</div></div></div>
                           <div className="border border-black flex flex-col h-64"><div className="bg-[#2e2344] text-white p-2 text-center font-bold text-sm border-b border-black">الأنشطة والبرامج</div><div className="flex-grow flex flex-col"><div className="flex bg-[#eaddcf] font-bold text-center border-b border-black text-xs"><div className="w-10 p-1 border-l border-black">م</div><div className="flex-grow p-1 border-l border-black">النشاط</div><div className="w-1/4 p-1">المستفيدين</div></div>{Array.from({ length: 5 }).map((_, i) => { const act = viewDailyReport.activities && viewDailyReport.activities[i] ? viewDailyReport.activities[i] : { activity: '', beneficiaries: 0 }; return (<div key={i} className="flex border-b border-black last:border-0 text-xs flex-grow items-center"><div className="w-10 p-1 border-l border-black text-center font-bold">{i + 1}</div><div className="flex-grow p-1 border-l border-black flex items-center pr-2">{act.activity}</div><div className="w-1/4 p-1 text-center font-bold">{act.beneficiaries || ''}</div></div>); })}</div></div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="border border-black h-32 flex flex-col"><div className="bg-[#2e2344] text-white p-2 text-center font-bold text-sm border-b border-black">التحديات والصعوبات</div><div className="p-2 text-xs leading-relaxed">{viewDailyReport.challenges}</div></div>
                           <div className="border border-black h-32 flex flex-col"><div className="bg-[#2e2344] text-white p-2 text-center font-bold text-sm border-b border-black">توصيات ومقترحات</div><div className="p-2 text-xs leading-relaxed">{viewDailyReport.recommendations}</div></div>
                       </div>
                       <div className="border border-black flex flex-col flex-grow min-h-[150px]"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">التوثيق المصور</div><div className="flex-grow p-1">{viewDailyReport.images && viewDailyReport.images.length > 0 ? (<div className="grid grid-cols-3 gap-2 h-full">{viewDailyReport.images.slice(0, 3).map((img, idx) => (<div key={idx} className="border border-gray-200 h-full min-h-[180px] relative"><img src={img} className="w-full h-full object-cover absolute inset-0" alt="Report"/></div>))}</div>) : (<div className="h-full min-h-[180px] flex items-center justify-center text-gray-400 text-xs py-8">لا يوجد صور مرفقة</div>)}</div></div>
                       <div className="mt-8 px-12 pb-4"><div className="flex justify-between items-end"><div className="text-right"><p className="font-bold mb-4 text-sm">مدير النادي</p><p className="font-medium text-sm">أحمد محمد علي</p></div><div className="text-left"><div className="w-48 border-b border-black pb-2 text-center text-sm font-bold">التوقيع</div></div></div></div>
                   </div>
               </div>
            </div>
         </div>
      )}

      {/* Daily Report Form Modal (UPDATED TO MATCH PRINT LAYOUT) */}
      {showDailyReportModal && editingDailyReport && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-2 pb-10 print:p-0">
              <div className="bg-white rounded-none md:rounded-2xl shadow-xl w-full max-w-[210mm] p-0 overflow-hidden animate-fade-in relative my-4 md:my-8 print:my-0 print:shadow-none print:w-full">
                   <button onClick={() => setShowDailyReportModal(false)} className="absolute top-4 left-4 z-10 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 print:hidden"><X size={20}/></button>
                   <form onSubmit={handleSaveDailyReportForm} className="flex flex-col min-h-[297mm]">
                      {/* --- HEADER --- */}
                      <div className="w-full mb-2 flex justify-center"><img src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" className="w-full h-auto object-contain" alt="Header" /></div>
                      
                      {/* --- CONTENT --- */}
                      <div className="p-8 print:p-8 pt-0 flex-grow flex flex-col">
                          <div className="text-center mb-2"><h1 className="text-3xl font-bold text-[#2e2344] mb-2">التقرير اليومي</h1><div className="h-1 w-24 bg-[#cbb06a] mx-auto rounded-full"></div></div>
                          
                          {/* INFO TABLE */}
                          <div className="border border-black text-sm mb-2">
                              <div className="flex border-b border-black">
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">اسم النادي</div>
                                  <div className="w-1/4 bg-gray-50 border-l border-black p-0"><input type="text" className="w-full h-full p-1 text-center bg-transparent outline-none font-bold" value={editingDailyReport.clubName || settings.clubName} readOnly /></div>
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">المنطقة</div>
                                  <div className="w-1/4 bg-gray-50 p-1 text-center flex items-center justify-center font-bold">جازان</div>
                              </div>
                              <div className="flex">
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">اليوم</div>
                                  <div className="w-1/4 bg-gray-50 border-l border-black p-0"><input type="text" className="w-full h-full p-1 text-center bg-transparent outline-none font-bold" value={editingDailyReport.dayName || ''} readOnly /></div>
                                  <div className="w-1/4 bg-[#2e2344] text-white p-1 font-bold text-center border-l border-black flex items-center justify-center">التاريخ</div>
                                  <div className="w-1/4 bg-gray-50 p-0 relative"><input required type="date" className="w-full h-full p-1 text-center bg-transparent outline-none font-mono" value={editingDailyReport.reportDate} onChange={handleDailyReportDateChange} /><span className="hidden print:block absolute inset-0 flex items-center justify-center bg-white pointer-events-none">{formatDate(editingDailyReport.reportDate)}</span></div>
                              </div>
                          </div>

                          {/* STATS TABLE */}
                          <div className="border border-black text-sm mb-2 flex">
                              <div className="w-1/2 flex border-l border-black"><div className="w-1/3 bg-[#eaddcf] p-1 font-bold text-center flex items-center justify-center border-l border-black">التردد اليومي</div><div className="w-2/3 bg-white p-0"><input required type="number" className="w-full h-full p-1 text-center font-bold text-xl bg-transparent outline-none" value={editingDailyReport.dailyAttendance} onChange={e => setEditingDailyReport({...editingDailyReport, dailyAttendance: Number(e.target.value)})} /></div></div>
                              <div className="w-1/2 flex"><div className="w-1/3 bg-[#eaddcf] p-1 font-bold text-center flex items-center justify-center border-l border-black">المسجلين</div><div className="w-2/3 bg-white p-0"><input required type="number" className="w-full h-full p-1 text-center font-bold text-xl bg-transparent outline-none" value={editingDailyReport.registeredCount} onChange={e => setEditingDailyReport({...editingDailyReport, registeredCount: Number(e.target.value)})} /></div></div>
                          </div>

                          {/* MAIN GRID: STAFF & ACTIVITIES */}
                          <div className="grid grid-cols-2 gap-4 mb-2">
                              {/* Staff Table - 6 Rows Editable */}
                              <div className="border border-black flex flex-col h-60">
                                  <div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">فريق العمل</div>
                                  <div className="flex bg-[#eaddcf] font-bold text-center border-b border-black text-xs">
                                      <div className="w-10 p-1 border-l border-black">م</div>
                                      <div className="flex-grow p-1">الاسم</div>
                                  </div>
                                  <div className="flex-grow flex flex-col">
                                      {Array.from({ length: 6 }).map((_, i) => {
                                          const currentLines = editingDailyReport.staffNames?.split('\n') || [];
                                          const val = currentLines[i] || '';
                                          return (
                                              <div key={i} className="flex border-b border-black last:border-0 text-xs flex-grow items-center h-full">
                                                  <div className="w-10 p-1 border-l border-black text-center font-bold border-black h-full flex items-center justify-center">{i + 1}</div>
                                                  <div className="flex-grow h-full p-0"><input type="text" className="w-full h-full px-2 outline-none bg-transparent" placeholder="الاسم" value={val} onChange={(e) => handleStaffLineChange(i, e.target.value)} /></div>
                                              </div>
                                          )
                                      })}
                                  </div>
                                  <div className="border-t border-black flex text-xs">
                                      <div className="w-1/3 bg-[#eaddcf] p-1 text-center font-bold border-l border-black flex items-center justify-center">العدد</div>
                                      <div className="w-2/3 p-0"><input type="number" className="w-full h-full p-1 text-center font-bold outline-none" value={editingDailyReport.staffCount} readOnly onChange={e => setEditingDailyReport({...editingDailyReport, staffCount: Number(e.target.value)})} /></div>
                                  </div>
                              </div>

                              {/* Activities Table - 6 Rows Editable */}
                              <div className="border border-black flex flex-col h-60">
                                  <div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">الأنشطة والبرامج</div>
                                  <div className="flex-grow flex flex-col">
                                      <div className="flex bg-[#eaddcf] font-bold text-center border-b border-black text-xs">
                                          <div className="w-10 p-1 border-l border-black">م</div>
                                          <div className="flex-grow p-1 border-l border-black">النشاط</div>
                                          <div className="w-1/4 p-1">المستفيدين</div>
                                      </div>
                                      {Array.from({ length: 6 }).map((_, i) => {
                                          const act = editingDailyReport.activities?.[i] || { activity: '', beneficiaries: 0 };
                                          return (
                                              <div key={i} className="flex border-b border-black last:border-0 text-xs flex-grow items-center h-full">
                                                  <div className="w-10 p-1 border-l border-black text-center font-bold border-black h-full flex items-center justify-center">{i + 1}</div>
                                                  <div className="flex-grow h-full border-l border-black p-0"><input type="text" className="w-full h-full px-2 outline-none bg-transparent" placeholder={`نشاط ${i+1}`} value={act.activity} onChange={e => handleDailyReportActivityChange(i, 'activity', e.target.value)} /></div>
                                                  <div className="w-1/4 h-full p-0"><input type="number" className="w-full h-full text-center outline-none font-bold bg-transparent" placeholder="0" value={act.beneficiaries || ''} onChange={e => handleDailyReportActivityChange(i, 'beneficiaries', Number(e.target.value))} /></div>
                                              </div>
                                          ); 
                                      })}
                                  </div>
                              </div>
                          </div>

                          {/* FEEDBACK GRID */}
                          <div className="grid grid-cols-2 gap-4 mb-2">
                              <div className="border border-black h-24 flex flex-col"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">التحديات والصعوبات</div><textarea className="flex-grow p-1 text-xs leading-relaxed resize-none outline-none bg-transparent" value={editingDailyReport.challenges} onChange={e => setEditingDailyReport({...editingDailyReport, challenges: e.target.value})} placeholder="لا يوجد..."></textarea></div>
                              <div className="border border-black h-24 flex flex-col"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black">توصيات ومقترحات</div><textarea className="flex-grow p-1 text-xs leading-relaxed resize-none outline-none bg-transparent" value={editingDailyReport.recommendations} onChange={e => setEditingDailyReport({...editingDailyReport, recommendations: e.target.value})} placeholder="لا يوجد..."></textarea></div>
                          </div>

                          {/* IMAGES */}
                          <div className="border border-black flex flex-col flex-grow min-h-[150px]"><div className="bg-[#2e2344] text-white p-1 text-center font-bold text-sm border-b border-black flex justify-between items-center px-4"><span>التوثيق المصور</span><button type="button" onClick={() => dailyReportImageInputRef.current?.click()} className="bg-white text-[#2e2344] px-2 py-0.5 rounded text-xs hover:bg-gray-200 transition-colors print:hidden">+ إضافة صور</button><input type="file" ref={dailyReportImageInputRef} className="hidden" multiple accept="image/*" onChange={handleDailyReportImageUpload} /></div><div className="flex-grow p-1">{editingDailyReport.images && editingDailyReport.images.length > 0 ? (<div className="grid grid-cols-3 gap-2 h-full">{editingDailyReport.images.slice(0, 3).map((img, idx) => (<div key={idx} className="border border-gray-200 h-32 relative group"><img src={img} className="w-full h-full object-cover absolute inset-0" alt="Report"/><button type="button" onClick={() => removeDailyReportImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><X size={12}/></button></div>))}</div>) : (<div className="h-full min-h-[150px] flex items-center justify-center text-gray-400 text-xs py-8">لا يوجد صور مرفقة</div>)}</div></div>
                          
                          {/* FOOTER & SIGNATURE */}
                          <div className="mt-4 px-8 pb-2">
                              <div className="flex justify-between items-end">
                                  <div className="text-right">
                                      <p className="font-bold mb-4 text-sm">مدير النادي</p>
                                      <input type="text" className="font-medium text-sm text-right bg-transparent outline-none border-b border-dashed border-gray-400 w-48" placeholder="الاسم" defaultValue="أحمد محمد علي" />
                                  </div>
                                  <div className="text-left w-48 relative">
                                      {/* Auto Manager Signature if exists in supervisors list */}
                                      {(() => {
                                          const manager = supervisors.find(s => s.role === UserRole.MANAGER);
                                          return manager?.signature ? <img src={manager.signature} className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 object-contain mix-blend-multiply" alt="Sig" /> : null;
                                      })()}
                                      <div className="border-b border-black pb-2 text-center text-sm font-bold mt-8">التوقيع</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      {/* ACTIONS */}
                      <div className="bg-gray-50 p-4 border-t flex justify-end gap-3 print:hidden"><button type="button" onClick={() => setShowDailyReportModal(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button><button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md flex items-center gap-2"><Save size={18}/> حفظ التقرير</button></div>
                   </form>
              </div>
          </div>
      )}

      {/* Modal for Member Details */}
      {viewMember && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-4 print:p-0">
             <div className="relative w-full max-w-[210mm] my-4 print:my-0 print:w-full bg-white shadow-2xl rounded-lg overflow-hidden">
                 <MembershipForm 
                    members={members} 
                    setMembers={setMembers} 
                    settings={settings} 
                    initialData={viewMember} 
                    readOnly={true} 
                    onClose={() => setViewMember(null)} 
                 />
             </div>
          </div>
      )}

      <div className="container mx-auto px-4 py-8">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div><h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1><p className="text-gray-500">إدارة النظام والمستخدمين والتقارير</p></div>
            <div className="flex gap-3"><button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-xl transition-colors ${showSettings ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><Settings size={20} /></button></div>
         </div>

         {showSettings && (
             <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 animate-fade-in border border-blue-100">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings size={20} className="text-blue-600"/> إعدادات النظام</h3>
                 <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div><label className="block text-sm font-bold text-gray-700 mb-2">اسم النادي</label><input type="text" className="w-full border rounded-lg p-2" value={localSettings.clubName} onChange={e => setLocalSettings({...localSettings, clubName: e.target.value})} /></div>
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">شعار النادي (URL)</label>
                         <div className="flex gap-2 items-start"><div className="flex-grow"><input type="text" className="w-full border rounded-lg p-2 mb-2 dir-ltr" value={localSettings.logoUrl} onChange={e => setLocalSettings({...localSettings, logoUrl: e.target.value})} /><p className="text-[10px] text-gray-400">يفضل استخدام رابط مباشر للصورة (Google Drive / Imgur)</p></div><label className="cursor-pointer bg-gray-100 p-2 rounded-lg hover:bg-gray-200 h-10 w-10 flex items-center justify-center"><Upload size={20} /><input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label>{localSettings.logoUrl && (<div className="w-24 h-24 rounded-full border border-gray-200 bg-white overflow-hidden shrink-0 shadow-sm"><img src={localSettings.logoUrl} alt="Preview" className="w-full h-full object-contain" /></div>)}</div>
                     </div>
                     <div><label className="block text-sm font-bold text-gray-700 mb-2">وصف النادي (في التذييل)</label><textarea className="w-full border rounded-lg p-2 h-20" value={localSettings.clubMission || ''} onChange={e => setLocalSettings({...localSettings, clubMission: e.target.value})} /></div>
                     <div><label className="block text-sm font-bold text-gray-700 mb-2">روابط التواصل الاجتماعي</label><div className="space-y-2"><input type="text" placeholder="Twitter" className="w-full border rounded-lg p-2 text-sm" value={localSettings.socialLinks.twitter} onChange={e => setLocalSettings({...localSettings, socialLinks: {...localSettings.socialLinks, twitter: e.target.value}})} /><input type="text" placeholder="Instagram" className="w-full border rounded-lg p-2 text-sm" value={localSettings.socialLinks.instagram} onChange={e => setLocalSettings({...localSettings, socialLinks: {...localSettings.socialLinks, instagram: e.target.value}})} /></div></div>
                     <div className="md:col-span-2 border-t pt-4 mt-4">
                        <h4 className="font-bold mb-4 flex items-center gap-2"><ImageIcon size={18}/> صور العرض الرئيسية (Slider)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">{localSettings.sliderImages && localSettings.sliderImages.map((slide, index) => (<div key={index} className="border p-3 rounded-lg relative flex gap-3 items-center bg-gray-50"><img src={slide.url} alt="Slide" className="w-20 h-12 object-cover rounded bg-white" /><input type="text" value={slide.title} onChange={(e) => handleUpdateSlideTitle(index, e.target.value)} className="flex-grow border p-1 rounded text-sm outline-none focus:border-blue-500" placeholder="عنوان الصورة" /><button type="button" onClick={() => handleRemoveSlide(index)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors" title="حذف الصورة"><Trash2 size={16} /></button></div>))}</div>
                        <div className="flex flex-col md:flex-row gap-4 items-end bg-blue-50 p-4 rounded-xl border border-dashed border-blue-200"><div className="flex-grow w-full"><label className="block text-xs font-bold text-gray-500 mb-1">صورة جديدة (من الجهاز)</label><input type="file" accept="image/*" ref={slideImageInputRef} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" /></div><div className="flex-grow w-full"><label className="block text-xs font-bold text-gray-500 mb-1">العنوان (اختياري)</label><input type="text" value={newSlideTitle} onChange={(e) => setNewSlideTitle(e.target.value)} className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" placeholder="اكتب عنواناً للصورة..." /></div><button type="button" onClick={handleAddSlide} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-colors w-full md:w-auto justify-center"><Plus size={18}/> إضافة</button></div>
                     </div>
                     <div className="md:col-span-2 flex justify-end pt-4 border-t mt-4"><button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 shadow-lg"><Save size={18} /> حفظ الإعدادات</button></div>
                 </form>
             </div>
         )}

         <div className="flex overflow-x-auto pb-2 gap-2 mb-6">
            {[{ id: 'supervisors', label: 'المشرفين', icon: <Users size={18} /> }, { id: 'plans', label: 'الخطط', icon: <Calendar size={18} /> }, { id: 'members', label: 'الأعضاء', icon: <Users size={18} /> }, { id: 'daily', label: 'التقارير اليومية', icon: <FileText size={18} /> }, { id: 'distinguished', label: 'المشرف المتميز', icon: <Trophy size={18} /> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap font-bold transition-all ${activeTab === tab.id ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>{tab.icon} {tab.label}</button>
            ))}
         </div>

         {/* TAB CONTENT */}

         {activeTab === 'supervisors' && (
             <div className="bg-white rounded-2xl shadow-sm p-6">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">إدارة المشرفين</h3><button onClick={() => setEditingSupervisor({})} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700"><Plus size={16}/> إضافة مشرف</button></div>
                 {editingSupervisor && (
                     <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
                         <h4 className="font-bold mb-4 text-lg border-b pb-2">{editingSupervisor.id ? 'تعديل بيانات مشرف' : 'إضافة مشرف جديد'}</h4>
                         <form onSubmit={handleSaveSupervisor} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="md:col-span-1 flex flex-col items-center gap-4 border-l pl-4">
                                 <div className="relative w-32 h-32 group cursor-pointer" onClick={() => supervisorImageInputRef.current?.click()}><img src={editingSupervisor.image || `https://ui-avatars.com/api/?name=${editingSupervisor.name || 'User'}`} className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" alt="Profile" /><div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="text-white" size={24} /></div><input type="file" ref={supervisorImageInputRef} className="hidden" accept="image/*" onChange={handleSupervisorImageUpload} /></div><span className="text-xs text-gray-500">اضغط على الصورة لتغييرها</span>
                                 <div className="w-full pt-4 border-t mt-2"><label className="block text-sm font-bold text-gray-700 mb-2">التوقيع الرقمي المعتمد</label><div className="flex flex-col items-center gap-2">{editingSupervisor.signature ? (<div className="relative group border rounded-lg p-2 bg-white w-full flex justify-center"><img src={editingSupervisor.signature} alt="Signature" className="h-16 object-contain" /><button type="button" onClick={() => setShowSignatureModal(true)} className="absolute top-1 right-1 p-1 bg-gray-100 rounded-full hover:bg-blue-100 text-blue-600" title="تعديل التوقيع"><PenTool size={14} /></button></div>) : (<button type="button" onClick={() => setShowSignatureModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-500 transition-colors text-sm"><PenTool size={16} /> اضغط لإضافة توقيع يدوي</button>)}</div></div>
                             </div>
                             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit content-start">
                                 <div><label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label><input type="text" placeholder="الاسم" className="w-full border rounded-lg p-2 bg-white" required value={editingSupervisor.name || ''} onChange={e => setEditingSupervisor({...editingSupervisor, name: e.target.value})} /></div>
                                 <div><label className="block text-sm font-bold text-gray-700 mb-1">الدور الوظيفي</label><select className="w-full border rounded-lg p-2 bg-white" value={editingSupervisor.role || UserRole.SUPERVISOR} onChange={e => setEditingSupervisor({...editingSupervisor, role: e.target.value as UserRole})}>{Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}</select></div>
                                 <div><label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني (للدخول)</label><input type="email" placeholder="email@example.com" className="w-full border rounded-lg p-2 bg-white" required value={editingSupervisor.email || ''} onChange={e => setEditingSupervisor({...editingSupervisor, email: e.target.value})} /></div>
                                 <div><label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف</label><input type="text" placeholder="05xxxxxxxx" className="w-full border rounded-lg p-2 bg-white" value={editingSupervisor.phone || ''} onChange={e => setEditingSupervisor({...editingSupervisor, phone: e.target.value})} /></div>
                                 <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label><input type="text" placeholder="تعيين كلمة مرور جديدة" className="w-full border rounded-lg p-2 bg-white" value={editingSupervisor.password || ''} onChange={e => setEditingSupervisor({...editingSupervisor, password: e.target.value})} /><p className="text-xs text-gray-400 mt-1">اتركها فارغة للاحتفاظ بكلمة المرور الحالية (أو الافتراضية 123456)</p></div>
                                 <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t"><button type="button" onClick={() => setEditingSupervisor(null)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button><button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md">حفظ البيانات</button></div>
                             </div>
                         </form>
                     </div>
                 )}
                 <div className="overflow-x-auto">
                     <table className="w-full text-right">
                         <thead>
                             <tr className="bg-gray-50 text-gray-500 text-xs uppercase"><th className="p-4 rounded-r-xl">المشرف</th><th className="p-4">الدور</th><th className="p-4">البريد</th><th className="p-4 rounded-l-xl">إجراءات</th></tr>
                         </thead>
                         <tbody className="divide-y">
                             {supervisors.map(s => (
                                 <tr key={s.id} className="hover:bg-gray-50">
                                     <td className="p-4 flex items-center gap-3"><img src={s.image} className="w-10 h-10 rounded-full bg-gray-200 object-cover" alt={s.name} /><div><div className="font-bold">{s.name}</div>{s.signature && <span className="text-[10px] text-green-600 flex items-center gap-1"><PenTool size={10}/> توقيع معتمد</span>}</div></td>
                                     <td className="p-4 text-sm"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{s.role}</span></td><td className="p-4 text-sm font-mono text-gray-500">{s.email}</td>
                                     <td className="p-4 flex gap-2">
                                         <button onClick={() => setEditingSupervisor(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="تعديل"><Edit size={16}/></button>
                                         <button onClick={() => handleDeleteSupervisor(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="حذف"><Trash2 size={16}/></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         )}
         
         {activeTab === 'plans' && (
             <div className="bg-white rounded-2xl shadow-sm p-6">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold">إدارة الخطط والبرامج</h3>
                     <div className="flex gap-2">
                         <button onClick={handlePrintPlans} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-900 shadow-md"><Printer size={16}/> معاينة وطباعة الخطط</button>
                         <button onClick={handlePrintReports} className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-purple-800 shadow-md"><FileText size={16}/> معاينة وطباعة التقارير</button>
                         <button onClick={() => setEditingPlan({ monthYear: new Date().toISOString().slice(0, 7) })} className="bg-green-600 text-white p-2 rounded-lg flex items-center justify-center hover:bg-green-700 shadow-md" title="إضافة خطة جديدة"><Plus size={16}/></button>
                     </div>
                 </div>

                 {filterSupervisorId && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 flex justify-between items-center animate-fade-in">
                        <div className="flex items-center gap-2"><Users size={18} /><span className="font-bold">عرض خطط المشرف: {supervisors.find(s => s.id === filterSupervisorId)?.name}</span></div><button onClick={() => setFilterSupervisorId(null)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded-full transition-colors" title="إلغاء الفلتر"><X size={18} /></button>
                    </div>
                 )}

                 {editingPlan && (
                     <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200 animate-fade-in">
                         <h4 className="font-bold mb-4 text-lg border-b pb-2">{editingPlan.id ? 'تعديل خطة برنامج' : 'إضافة خطة جديدة'}</h4>
                         <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">المشرف المسؤول</label><select className="w-full border rounded-lg p-2 bg-white" required value={editingPlan.supervisorId || ''} onChange={e => setEditingPlan({...editingPlan, supervisorId: e.target.value})}><option value="">اختر مشرفاً...</option>{supervisors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}</select></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">اسم البرنامج</label><input type="text" className="w-full border rounded-lg p-2 bg-white" required placeholder="اسم النشاط أو البرنامج" value={editingPlan.programName || ''} onChange={e => setEditingPlan({...editingPlan, programName: e.target.value})} /></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">التاريخ</label><input type="date" className="w-full border rounded-lg p-2 bg-white" required value={editingPlan.date || ''} onChange={e => setEditingPlan({...editingPlan, date: e.target.value})} /></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">المجال</label><select className="w-full border rounded-lg p-2 bg-white" value={editingPlan.domain || 'عام'} onChange={e => setEditingPlan({...editingPlan, domain: e.target.value})}><option>رياضي</option><option>ثقافي</option><option>اجتماعي</option><option>علمي</option><option>عام</option></select></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">الفئة المستهدفة</label><input type="text" className="w-full border rounded-lg p-2 bg-white" placeholder="الجميع، شباب، أطفال..." value={editingPlan.targetAudience || ''} onChange={e => setEditingPlan({...editingPlan, targetAudience: e.target.value})} /></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">الحالة</label><select className="w-full border rounded-lg p-2 bg-white" value={editingPlan.status || PlanStatus.PENDING} onChange={e => setEditingPlan({...editingPlan, status: e.target.value as PlanStatus})}>{Object.values(PlanStatus).map(status => (<option key={status} value={status}>{status}</option>))}</select></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">المدة</label><input type="text" className="w-full border rounded-lg p-2 bg-white" placeholder="ساعتين، يوم كامل..." value={editingPlan.duration || ''} onChange={e => setEditingPlan({...editingPlan, duration: e.target.value})} /></div>
                             <div><label className="block text-sm font-bold text-gray-700 mb-1">عدد المستفيدين</label><input type="number" className="w-full border rounded-lg p-2 bg-white" placeholder="0" value={editingPlan.participantsCount || ''} onChange={e => setEditingPlan({...editingPlan, participantsCount: Number(e.target.value)})} /></div>
                             <div className="lg:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t"><button type="button" onClick={() => setEditingPlan(null)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button><button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md">حفظ الخطة</button></div>
                         </form>
                     </div>
                 )}

                 <div className="space-y-8">
                     {sortedMonthKeys.map(month => (
                         <div key={month} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                             <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/><h4 className="font-bold text-gray-800 text-lg">{getMonthLabel(month)}</h4><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-mono">{groupedPlans[month].length} برامج</span></div>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-right">
                                     <thead>
                                         <tr className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100"><th className="p-4">البرنامج</th><th className="p-4">المجال</th><th className="p-4">التاريخ</th><th className="p-4">المشرف</th><th className="p-4">المستفيدين</th><th className="p-4">الميزانية</th><th className="p-4">الحالة</th><th className="p-4">إجراءات</th></tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-5">
                                         {groupedPlans[month].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                             <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                 <td className="p-4 font-bold text-gray-800">{p.programName}</td><td className="p-4 text-sm"><span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{p.domain}</span></td><td className="p-4 text-sm font-mono text-gray-500">{formatDate(p.date)}</td><td className="p-4 text-sm text-gray-600">{supervisors.find(s => s.id === p.supervisorId)?.name || p.supervisorName}</td><td className="p-4 text-sm flex items-center gap-1 font-mono"><Users size={14} className="text-gray-400"/> {p.participantsCount}</td><td className="p-4 text-sm font-mono">{p.budget} <span className="text-[10px] text-gray-400">ر.س</span></td>
                                                 <td className="p-4 text-sm">{p.status === PlanStatus.EXECUTED && <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">منفذ</span>}{p.status === PlanStatus.PENDING && <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded">انتظار</span>}{p.status === PlanStatus.IN_PROGRESS && <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">قيد التنفيذ</span>}{p.status === PlanStatus.NOT_EXECUTED && <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">لم ينفذ</span>}</td>
                                                 <td className="p-4 flex gap-2">{(() => { const report = reports.find(r => r.planId === p.id); return report ? (<button onClick={() => setViewProgramReport(report)} className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full text-sm font-bold transition-colors" title="عرض التقرير"><FileText size={16}/> عرض التقرير</button>) : (<span className="text-gray-400 text-xs italic">لا يوجد تقرير</span>); })()}<button onClick={() => setEditingPlan(p)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-full"><Edit size={16} /></button><button onClick={() => handleDeletePlan(p.id)} className="text-red-600 p-2 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button></td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     ))}
                     {plans.length === 0 && (<div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200"><Calendar size={48} className="mx-auto text-gray-300 mb-4"/><p className="text-gray-500">لا توجد خطط مسجلة في النظام</p></div>)}
                 </div>
             </div>
         )}

         {activeTab === 'members' && (
             <div className="bg-white rounded-2xl shadow-sm p-6">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">إدارة الأعضاء</h3><div className="flex items-center gap-2"><button onClick={handlePrintMembers} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-900 transition-colors"><Printer size={16}/> معاينة وطباعة الكل</button><div className="h-8 w-px bg-gray-300 mx-2"></div><span className="text-sm text-gray-500">إجمالي: {members.length}</span><span className="text-sm text-orange-500">انتظار: {members.filter(m => m.status === 'pending').length}</span></div></div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-right">
                         <thead>
                             <tr className="bg-gray-50 text-gray-500 text-xs uppercase"><th className="p-4 rounded-r-xl">الاسم / رقم العضوية</th><th className="p-4">رقم الهوية</th><th className="p-4">الحالة</th><th className="p-4 rounded-l-xl">إجراءات</th></tr>
                         </thead>
                         <tbody className="divide-y">
                             {members.map(m => (
                                 <tr key={m.id} className="hover:bg-gray-50">
                                     <td className="p-4"><div className="font-bold">{m.fullName}</div><div className="text-xs text-gray-400 font-mono">{m.membershipNumber}</div></td><td className="p-4 text-sm font-mono">{m.nationalId}</td><td className="p-4">{m.status === 'active' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">معتمد</span>}{m.status === 'pending' && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">بانتظار الموافقة</span>}{m.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">مرفوض</span>}</td>
                                     <td className="p-4 flex gap-2">
                                         <button onClick={() => setViewMember(m)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="عرض وطباعة"><Printer size={16}/></button>
                                         <button onClick={() => handleDeleteMember(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="حذف العضو"><Trash2 size={16}/></button>
                                         {m.status === 'pending' && (<><button onClick={() => handleMemberAction(m, 'active')} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="قبول"><CheckCircle size={16}/></button><button onClick={() => handleMemberAction(m, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="رفض"><X size={16}/></button></>)}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         )}

         {activeTab === 'daily' && (
             <div className="bg-white rounded-2xl shadow-sm p-6">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">التقارير اليومية</h3><div className="flex gap-2"><button onClick={handleOpenDailyReportModal} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700"><Plus size={16}/> إضافة تقرير</button><button onClick={handlePrintDailyReports} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-900"><Printer size={16}/> معاينة وطباعة الكل</button></div></div>
                 <div className="grid gap-4">
                     {dailyReports.map(report => (
                         <div key={report.id} className="border p-4 rounded-xl flex justify-between items-center">
                             <div><h4 className="font-bold">{report.dayName} <span className="text-gray-400 font-mono text-sm ml-2">{formatDate(report.reportDate)}</span></h4><p className="text-sm text-gray-500">حضور: {report.dailyAttendance}</p></div>
                             <div className="flex items-center gap-3"><div className="text-sm bg-gray-100 px-3 py-1 rounded">{report.activities?.length || 0} أنشطة</div><button onClick={() => setViewDailyReport(report)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="عرض التفاصيل"><Eye size={18}/></button><button onClick={() => handleEditDailyReport(report)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="تعديل التقرير"><Edit size={18}/></button><button onClick={() => handlePrintSingleReport(report)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="حفظ / طباعة"><Download size={18}/></button><button onClick={() => handleDeleteDailyReport(report.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="حذف"><Trash2 size={18}/></button></div>
                         </div>
                     ))}
                     {dailyReports.length === 0 && <p className="text-center text-gray-400 py-8">لا توجد تقارير يومية</p>}
                 </div>
             </div>
         )}

         {activeTab === 'distinguished' && (
             <div className="bg-white rounded-2xl shadow-sm p-6">
                 <h3 className="text-xl font-bold mb-6">لوحة الشرف (المشرف المتميز)</h3>
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                     <h4 className="font-bold mb-4">إضافة تكريم جديد</h4>
                     <form onSubmit={handleSaveDistinguished} className="flex flex-col md:flex-row gap-4 items-end">
                         <div className="flex gap-4 items-end"><div className="relative group cursor-pointer" onClick={() => distinguishedImageRef.current?.click()}><div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400 overflow-hidden hover:border-blue-500 transition-colors">{selectedDistinguished.awardImage ? (<img src={selectedDistinguished.awardImage} className="w-full h-full object-cover" alt="Award" />) : (<div className="text-center"><Upload size={20} className="text-gray-400 mx-auto" /><span className="text-[10px] text-gray-500 block">صورة</span></div>)}</div><input type="file" ref={distinguishedImageRef} className="hidden" accept="image/*" onChange={handleDistinguishedImageUpload} /></div></div>
                         <div className="flex-grow"><label className="text-xs font-bold text-gray-500 mb-1 block">الشهر</label><input type="month" className="w-full border rounded-lg p-2" required value={selectedDistinguished.monthYear} onChange={e => setSelectedDistinguished({...selectedDistinguished, monthYear: e.target.value})} /></div>
                         <div className="flex-grow"><label className="text-xs font-bold text-gray-500 mb-1 block">المشرف</label><select className="w-full border rounded-lg p-2" required value={selectedDistinguished.supervisorId || ''} onChange={e => setSelectedDistinguished({...selectedDistinguished, supervisorId: e.target.value})}><option value="">اختر مشرفاً...</option>{supervisors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}</select></div>
                         <div className="w-full md:w-auto"><button type="submit" className="w-full bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-600 font-bold flex items-center justify-center gap-2"><Trophy size={18} /> حفظ</button></div>
                     </form>
                     <div className="mt-4"><label className="text-xs font-bold text-gray-500 mb-1 block">كلمة شكر / ملاحظات (اختياري)</label><input type="text" className="w-full border rounded-lg p-2" placeholder="اكتب عبارة تظهر في لوحة الشرف..." value={selectedDistinguished.notes || ''} onChange={e => setSelectedDistinguished({...selectedDistinguished, notes: e.target.value})} /></div>
                 </div>
                 <div className="space-y-4">
                     {distinguished.sort((a,b) => b.monthYear.localeCompare(a.monthYear)).map(d => { const sup = supervisors.find(s => s.id === d.supervisorId); return (<div key={d.id} className="flex items-center gap-4 border p-4 rounded-xl hover:bg-yellow-50 transition-colors"><div className="relative"><img src={d.awardImage || sup?.image} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" alt="sup?.name" /><div className="absolute -bottom-1 -right-1 bg-yellow-100 text-yellow-700 p-1.5 rounded-full border border-white"><Trophy size={14} /></div></div><div className="flex-grow"><h4 className="font-bold text-lg">{sup?.name || 'مشرف غير موجود'}</h4><p className="text-sm text-gray-500">{d.monthYear} - {sup?.role}</p>{d.notes && <p className="text-xs text-gray-400 italic mt-1">"{d.notes}"</p>}</div><button onClick={() => handleDeleteDistinguished(d.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></div>); })}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default AdminPanel;
