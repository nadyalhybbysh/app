
import React from 'react';
import { Supervisor, ProgramPlan, PlanStatus, ProgramReport, SystemSettings, UserRole } from '../types';
import { Plus, Clock, Save, FileText, Image as ImageIcon, ArrowRight, Printer, Download, ArrowLeft, CloudUpload, Eye, Edit, HelpCircle, Trash2, PenTool, X, Check, Users, Banknote, Calendar } from 'lucide-react';
import SignaturePadModal from '../components/SignaturePadModal';

interface SupervisorPortalProps {
  plans: ProgramPlan[];
  setPlans: React.Dispatch<React.SetStateAction<ProgramPlan[]>>;
  reports: ProgramReport[];
  setReports: React.Dispatch<React.SetStateAction<ProgramReport[]>>;
  supervisor: Supervisor; // This is the Current Logged In User
  supervisors: Supervisor[]; // List of all for manager lookup
  settings: SystemSettings;
}

const SupervisorPortal: React.FC<SupervisorPortalProps> = ({ plans, setPlans, reports, setReports, supervisor, supervisors, settings }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'add-plan' | 'reports'>('overview');
  const [showReportForm, setShowReportForm] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Signature State
  const [signingType, setSigningType] = React.useState<'executor' | 'manager' | null>(null);

  // Editing State
  const [editingPlanId, setEditingPlanId] = React.useState<string | null>(null);

  // New Plan State
  const [newPlan, setNewPlan] = React.useState<Partial<ProgramPlan>>({
    monthYear: new Date().toISOString().slice(0, 7),
    domain: 'ثقافي',
    status: PlanStatus.PENDING,
  });

  // New Report State
  const [newReport, setNewReport] = React.useState<Partial<ProgramReport>>({
      images: [],
      executorName: supervisor.name,
      managerName: 'أحمد محمد علي', // Default manager name
  });

  // Strict Filtering: Only show plans/reports belonging to this supervisor
  const myPlans = plans.filter(p => p.supervisorId === supervisor.id);
  const myReports = reports.filter(r => r.executorName === supervisor.name); // Using name for now, ideally ID
  const pendingPlans = myPlans.filter(p => p.status === PlanStatus.PENDING || p.status === PlanStatus.IN_PROGRESS);
  const executedPlans = myPlans.filter(p => p.status === PlanStatus.EXECUTED);

  // Helper: Format Date
  const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      return dateString.split('-').reverse().join('/');
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

  const groupPlansByMonth = (plansList: ProgramPlan[]) => {
      const grouped = plansList.reduce((acc, plan) => {
          const monthKey = plan.monthYear || plan.date.slice(0, 7); // YYYY-MM
          if (!acc[monthKey]) {
              acc[monthKey] = [];
          }
          acc[monthKey].push(plan);
          return acc;
      }, {} as Record<string, ProgramPlan[]>);

      // Sort keys (Months) Descending
      const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      
      return { grouped, sortedKeys };
  };

  // Auto-generate Report Number when opening form AND auto-fill signatures
  React.useEffect(() => {
    if (showReportForm && !newReport.reportNumber && !newReport.id) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const year = new Date().getFullYear();
        
        // Find saved signatures
        // 1. Current Supervisor's Signature (from the logged in profile)
        const myProfile = supervisors.find(s => s.id === supervisor.id);
        const mySignature = myProfile?.signature;

        // 2. Manager's Signature
        const managerProfile = supervisors.find(s => s.role === UserRole.MANAGER);
        const managerSignature = managerProfile?.signature;
        const managerName = managerProfile?.name || 'مدير النادي';

        setNewReport(prev => ({ 
            ...prev, 
            reportNumber: `REP-${year}-${randomNum}`,
            executorName: supervisor.name,
            // Auto-fill signatures if available
            executorSignature: mySignature || prev.executorSignature,
            managerSignature: managerSignature || prev.managerSignature,
            managerName: managerName
        }));
    }
  }, [showReportForm, supervisor.id, supervisor.name, newReport.id, newReport.reportNumber, supervisors]);

  // Reset Plan Form
  const resetPlanForm = () => {
    setNewPlan({
      monthYear: new Date().toISOString().slice(0, 7),
      domain: 'ثقافي',
      status: PlanStatus.PENDING,
      programName: '',
      date: '',
      targetAudience: '',
      participantsCount: 0,
      budget: 0,
      duration: '',
    });
    setEditingPlanId(null);
  };

  // Handle Edit Plan Click
  const handleEditPlan = (plan: ProgramPlan) => {
    setNewPlan(plan);
    setEditingPlanId(plan.id);
    setActiveTab('add-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete Plan Click
  const handleDeletePlan = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
      setPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  // Add or Update Plan Handler
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0,0,0,0);
    const planDate = new Date(newPlan.date || '');
    planDate.setHours(0,0,0,0);

    // Logic: If date < today (shouldn't happen for new plans usually, but just in case) -> PENDING (Wait)
    // If date >= today -> IN_PROGRESS
    // Default to PENDING if in future.
    
    let currentStatus = newPlan.status || PlanStatus.PENDING;
    // Only apply auto-status logic if it's a new plan or if the date changed significantly
    if (!editingPlanId) {
        if (planDate.getTime() <= today.getTime()) {
            currentStatus = PlanStatus.IN_PROGRESS;
        } else {
            currentStatus = PlanStatus.PENDING;
        }
    }

    const planData: ProgramPlan = {
        id: editingPlanId || Math.random().toString(36).substr(2, 9),
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        date: newPlan.date || '',
        monthYear: newPlan.monthYear || '',
        programName: newPlan.programName || 'برنامج جديد',
        domain: newPlan.domain || 'عام',
        duration: newPlan.duration || '0',
        targetAudience: newPlan.targetAudience || 'الجميع',
        participantsCount: Number(newPlan.participantsCount) || 0,
        budget: Number(newPlan.budget) || 0,
        executorName: supervisor.name,
        status: currentStatus,
        notes: newPlan.notes || '',
    };

    if (editingPlanId) {
        // Update existing
        setPlans(prev => prev.map(p => p.id === editingPlanId ? planData : p));
        alert('تم تحديث الخطة بنجاح');
    } else {
        // Create new
        setPlans([...plans, planData]);
        alert('تم إضافة الخطة بنجاح');
    }
    
    resetPlanForm();
    setActiveTab('overview');
  };

  // Add or Update Report Handler
  const handleAddReport = (e: React.FormEvent) => {
      e.preventDefault();
      
      const isEditing = !!newReport.id;
      
      const reportData: ProgramReport = {
          id: newReport.id || Math.random().toString(36).substr(2, 9),
          reportNumber: newReport.reportNumber || '0000',
          planId: newReport.planId || '',
          programName: newReport.programName || 'تقرير برنامج',
          domain: newReport.domain || 'عام',
          date: newReport.date || new Date().toISOString().slice(0, 10),
          targetAudience: newReport.targetAudience || 'الجميع',
          participantsCount: Number(newReport.participantsCount) || 0,
          budget: Number(newReport.budget) || 0,
          objectives: newReport.objectives || '',
          description: newReport.description || '',
          images: newReport.images || [],
          executorName: newReport.executorName || supervisor.name,
          managerName: newReport.managerName || 'مدير النادي',
          executorSignature: newReport.executorSignature,
          managerSignature: newReport.managerSignature,
      };

      // UPDATE PLAN STATUS TO EXECUTED
      if (newReport.planId) {
          setPlans(prevPlans => prevPlans.map(p => 
              p.id === newReport.planId ? { ...p, status: PlanStatus.EXECUTED } : p
          ));
      }

      if (isEditing) {
          // Update existing report
          setReports(prev => prev.map(r => r.id === reportData.id ? reportData : r));
          alert('تم تحديث بيانات التقرير بنجاح');
      } else {
          // Create new report
          setReports([...reports, reportData]);
          alert('تم حفظ التقرير في سجلات النظام وتحديث حالة البرنامج إلى "منفذ"');
      }

      setShowReportForm(false);
      setNewReport({ images: [], executorName: supervisor.name, managerName: 'أحمد محمد علي' });
  };

  const handlePlanSelect = (planId: string) => {
      const selectedPlan = myPlans.find(p => p.id === planId);
      if (selectedPlan) {
          setNewReport({
              ...newReport,
              planId: selectedPlan.id,
              programName: selectedPlan.programName,
              domain: selectedPlan.domain,
              date: selectedPlan.date,
              targetAudience: selectedPlan.targetAudience,
              budget: selectedPlan.budget,
              participantsCount: selectedPlan.participantsCount, // Auto-fill participants count
              description: selectedPlan.notes || '', // Auto-fill notes if available
          });
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const fileReaders: Promise<string>[] = [];

      // Loop through selected files
      for (let i = 0; i < files.length; i++) {
          fileReaders.push(new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(files[i]);
          }));
      }

      // Wait for all files to be read then update state
      Promise.all(fileReaders).then((base64Images) => {
          setNewReport(prev => ({
              ...prev,
              images: [...(prev.images || []), ...base64Images].slice(0, 4) // Limit to 4 images max for layout
          }));
      });
      
      // Reset input value to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove: number) => {
      setNewReport(prev => ({
          ...prev,
          images: prev.images?.filter((_, index) => index !== indexToRemove)
      }));
  };

  // Handle saving signature from modal
  const handleSaveSignature = (signatureData: string) => {
      if (signingType === 'executor') {
          setNewReport(prev => ({ ...prev, executorSignature: signatureData }));
      } else if (signingType === 'manager') {
          setNewReport(prev => ({ ...prev, managerSignature: signatureData }));
      }
      setSigningType(null);
  };

  // View Existing Report
  const handleViewReport = (report: ProgramReport) => {
      setNewReport(report);
      setShowReportForm(true);
  };

  // Handle Save to Drive / Print
  const handlePrint = () => {
      // Set meaningful title for the PDF file name
      const originalTitle = document.title;
      document.title = `${newReport.programName || 'تقرير'} - ${newReport.date}`;
      
      // Print immediately without blocking alerts
      window.print();
      
      // Restore title
      document.title = originalTitle;
  };

  // Helper function for status styles
  const getStatusStyle = (status: PlanStatus) => {
      switch (status) {
          case PlanStatus.EXECUTED: return 'bg-green-100 text-green-700'; // Green
          case PlanStatus.NOT_EXECUTED: return 'bg-red-100 text-red-700'; // Red
          case PlanStatus.IN_PROGRESS: return 'bg-sky-100 text-sky-700 border border-sky-200'; // Sky Blue
          default: return 'bg-yellow-100 text-yellow-700 border border-yellow-200'; // Yellow (Pending)
      }
  };

  const { grouped: groupedPlans, sortedKeys: sortedMonthKeys } = groupPlansByMonth(myPlans);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Signature Modal */}
      <SignaturePadModal 
        isOpen={!!signingType}
        title={signingType === 'executor' ? 'توقيع المشرف المنفذ' : 'توقيع مدير النادي'}
        onClose={() => setSigningType(null)}
        onSave={handleSaveSignature}
      />

      {/* Sidebar Profile - Hidden when printing report */}
      <div className="lg:col-span-1 space-y-6 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
            <img src={supervisor.image} alt={supervisor.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{supervisor.name}</h2>
          <p className="text-blue-600 text-sm font-medium mb-4">{supervisor.role}</p>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 border-t pt-4">
             <div className="bg-green-50 p-2 rounded-lg">
                <span className="block font-bold text-green-700 text-lg">{executedPlans.length}</span>
                <span>منفذة</span>
             </div>
             <div className="bg-sky-50 p-2 rounded-lg">
                <span className="block font-bold text-sky-700 text-lg">{pendingPlans.length}</span>
                <span>متبقية</span>
             </div>
          </div>
        </div>

        <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
             onClick={() => { setActiveTab('overview'); resetPlanForm(); }}
             className={`w-full text-right px-6 py-4 border-b hover:bg-gray-50 flex items-center gap-3 ${activeTab === 'overview' ? 'border-r-4 border-r-blue-500 bg-blue-50' : ''}`}
          >
             <Clock size={18}/> برامجي هذا الأسبوع
          </button>
          <button 
             onClick={() => { setActiveTab('add-plan'); resetPlanForm(); }}
             className={`w-full text-right px-6 py-4 border-b hover:bg-gray-50 flex items-center gap-3 ${activeTab === 'add-plan' ? 'border-r-4 border-r-blue-500 bg-blue-50' : ''}`}
          >
             <Plus size={18}/> {editingPlanId ? 'تعديل الخطة' : 'إضافة خطة شهرية'}
          </button>
          <button 
             onClick={() => { setActiveTab('reports'); setShowReportForm(false); }}
             className={`w-full text-right px-6 py-4 hover:bg-gray-50 flex items-center gap-3 ${activeTab === 'reports' ? 'border-r-4 border-r-blue-500 bg-blue-50' : ''}`}
          >
             <FileText size={18}/> التقارير (توثيق)
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={`lg:col-span-3 ${showReportForm ? 'print:w-full print:col-span-4' : ''}`}>
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 print:hidden">
             <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">برامجي (إجمالي: {myPlans.length})</h3>
             
             <div className="space-y-8">
                {sortedMonthKeys.map(month => (
                    <div key={month}>
                        <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                             <Calendar className="text-blue-500" size={20}/>
                             <h4 className="font-bold text-gray-700 text-lg">{getMonthLabel(month)}</h4>
                        </div>
                        
                        <div className="space-y-4">
                            {groupedPlans[month].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(plan => (
                              <div key={plan.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                 <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                       <span className="font-bold text-lg text-gray-800">{plan.programName}</span>
                                       <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{plan.domain}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                       <span className="flex items-center gap-1"><Clock size={14}/> {formatDate(plan.date)} | {plan.duration}</span>
                                       <span className="flex items-center gap-1 text-gray-600 font-mono"><Users size={14}/> {plan.participantsCount} مستفيد</span>
                                       <span className="flex items-center gap-1 text-gray-600 font-mono"><Banknote size={14}/> {plan.budget} ريال</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3 self-end md:self-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(plan.status)}`}>
                                       {plan.status}
                                    </span>
                                    
                                    {/* Edit Button */}
                                    <button 
                                         onClick={() => handleEditPlan(plan)}
                                         className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                         title="تعديل الخطة"
                                    >
                                         <Edit size={16} />
                                    </button>

                                    {/* Delete Button */}
                                    <button 
                                         onClick={() => handleDeletePlan(plan.id)}
                                         className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                         title="حذف الخطة"
                                    >
                                         <Trash2 size={16} />
                                    </button>

                                    {(plan.status === PlanStatus.PENDING || plan.status === PlanStatus.IN_PROGRESS) && (
                                        <button 
                                            onClick={() => {
                                                setActiveTab('reports');
                                                setNewReport({ images: [], executorName: supervisor.name, managerName: 'أحمد محمد علي' }); // Reset form first
                                                setShowReportForm(true);
                                                handlePlanSelect(plan.id);
                                            }}
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            توثيق
                                        </button>
                                    )}
                                 </div>
                              </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {myPlans.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <Clock size={40} className="mx-auto mb-2 opacity-50"/>
                        <p>لا توجد خطط مسجلة</p>
                    </div>
                )}
             </div>
          </div>
        )}

        {/* ... Add Plan Form ... (Simplified for this snippet to focus on date display) */}
        {activeTab === 'add-plan' && (
           <div className="bg-white rounded-2xl shadow-sm p-8 print:hidden animate-fade-in">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                 <div>
                    <div className="flex items-center gap-2">
                        {editingPlanId && <Edit className="text-blue-600" size={24} />}
                        <h3 className="text-xl font-bold text-gray-800">{editingPlanId ? 'تعديل بيانات الخطة' : 'إضافة خطة شهرية جديدة'}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">العام: 1445هـ</p>
                 </div>
                 {/* Logo */}
              </div>

              <form onSubmit={handleAddPlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
                    <input required type="month" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={newPlan.monthYear || ''}
                      onChange={e => setNewPlan({...newPlan, monthYear: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اليوم والتاريخ</label>
                    <input required type="date" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPlan.date || ''}
                      onChange={e => setNewPlan({...newPlan, date: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم البرنامج</label>
                    <input required type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="مثال: دوري كرة القدم"
                      value={newPlan.programName || ''}
                      onChange={e => setNewPlan({...newPlan, programName: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المجال</label>
                    <select className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPlan.domain || 'رياضي'}
                      onChange={e => setNewPlan({...newPlan, domain: e.target.value})}>
                       <option>رياضي</option>
                       <option>ثقافي</option>
                       <option>اجتماعي</option>
                       <option>علمي</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة المستهدفة</label>
                    <input type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPlan.targetAudience || ''}
                      onChange={e => setNewPlan({...newPlan, targetAudience: e.target.value})} />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">عدد المستفيدين (المتوقع)</label>
                     <input type="number" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                       placeholder="مثال: 50"
                       value={newPlan.participantsCount || ''}
                       onChange={e => setNewPlan({...newPlan, participantsCount: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المدة</label>
                    <input type="text" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="مثال: ساعتين"
                      value={newPlan.duration || ''}
                      onChange={e => setNewPlan({...newPlan, duration: e.target.value})} />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية التقديرية (ريال)</label>
                     <input type="number" className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                       value={newPlan.budget || ''}
                       onChange={e => setNewPlan({...newPlan, budget: Number(e.target.value)})} />
                 </div>
                 
                 <div className="md:col-span-2 pt-4 border-t flex justify-end gap-3">
                    {editingPlanId && (
                         <button 
                            type="button" 
                            onClick={() => { resetPlanForm(); setActiveTab('overview'); }}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200"
                         >
                            إلغاء
                         </button>
                    )}
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                       <Save size={18} /> {editingPlanId ? 'حفظ التعديلات' : 'حفظ الخطة'}
                    </button>
                 </div>
              </form>
           </div>
        )}

        {activeTab === 'reports' && (
            <div className={`bg-white rounded-2xl shadow-sm ${showReportForm ? 'p-0 print:shadow-none' : 'p-6 min-h-[500px]'}`}>
                {!showReportForm ? (
                    // LIST VIEW (Standard)
                    <div className="print:hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">تقارير البرامج المنفذة</h3>
                            <button 
                                onClick={() => {
                                    setNewReport({ images: [], executorName: supervisor.name, managerName: 'أحمد محمد علي' }); // Clean state for new report
                                    setShowReportForm(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={18} /> إنشاء تقرير جديد
                            </button>
                        </div>
                        
                        {myReports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myReports.map((report) => (
                                    <div 
                                        key={report.id} 
                                        onClick={() => handleViewReport(report)}
                                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative bg-white"
                                    >
                                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                                                <Eye size={16} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-gray-800">{report.programName}</h4>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{formatDate(report.date)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">رقم التقرير: {report.reportNumber}</p>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{report.description}</p>
                                        <div className="border-t pt-2 mt-2 flex justify-end text-blue-600 text-xs font-medium">
                                            عرض التفاصيل / طباعة
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                <FileText size={48} className="mx-auto text-gray-300 mb-4"/>
                                <p className="text-gray-500">لا توجد تقارير حالياً</p>
                                <button 
                                    onClick={() => {
                                        setNewReport({ images: [], executorName: supervisor.name, managerName: 'أحمد محمد علي' });
                                        setShowReportForm(true);
                                    }}
                                    className="text-blue-600 font-medium mt-2 hover:underline"
                                >
                                    اضغط هنا لإنشاء أول تقرير
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // FORM VIEW WITH OFFICIAL HEADER (Print Friendly)
                    <div className="animate-fade-in">
                        {/* Control Bar (Hidden on print) */}
                        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-xl mb-4 print:hidden">
                             <div className="flex items-center gap-2">
                                <button onClick={() => setShowReportForm(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                    <ArrowRight className="text-gray-600" />
                                </button>
                                <span className="font-bold text-gray-700">
                                    {newReport.id ? 'معاينة / تعديل التقرير' : 'إنشاء تقرير جديد'}
                                </span>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                                <button 
                                    onClick={handlePrint} 
                                    className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm shadow-sm transition-colors"
                                    title="طباعة التقرير أو حفظه كملف PDF"
                                >
                                    <CloudUpload size={16}/> طباعة / حفظ في Drive
                                </button>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <HelpCircle size={10} /> اختر "Save to Google Drive" من نافذة الطباعة
                                </span>
                             </div>
                        </div>

                        {/* Official A4 Container - Matches Admin Panel Layout */}
                        <div className="bg-white p-4 md:p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:px-8 print:py-6 print:m-0 border-gray-200">
                            
                            {/* Header - Image Banner */}
                            <div className="relative w-full mb-8 flex justify-center">
                                 <img 
                                    src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" 
                                    className="w-full h-20 object-contain bg-white" 
                                    alt="Header Banner"
                                    referrerPolicy="no-referrer"
                                 />
                            </div>

                            {/* Report Title & Number (Absolute Positioned) */}
                            <div className="flex justify-between items-start mb-4 relative">
                                <div className="flex-grow text-center">
                                    <h2 className="text-2xl font-bold text-black decoration-2 underline decoration-blue-200 underline-offset-8 inline-block mt-2">
                                        تقرير برنامج {newReport.programName || '....................'}
                                    </h2>
                                </div>
                                <div className="absolute left-0 -top-2 border border-black p-2 rounded text-[10px] font-bold text-black text-center min-w-[100px] bg-white">
                                    <p className="border-b border-gray-300 pb-1 mb-1">رقم التقرير: {newReport.reportNumber}</p>
                                    <p>التاريخ: {formatDate(newReport.date || new Date().toISOString().slice(0, 10))}</p>
                                </div>
                            </div>

                            {/* Form Fields - Replicating the Colored Grid Layout */}
                            <form onSubmit={handleAddReport} className="space-y-6">
                                
                                {/* Selection (Hidden on Print if empty) */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 print:hidden mb-6">
                                    <label className="block text-sm font-medium text-blue-800 mb-2">استيراد بيانات من الخطة (اختياري)</label>
                                    <select 
                                        className="w-full border-blue-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        onChange={(e) => handlePlanSelect(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>اختر البرنامج...</option>
                                        {myPlans.map(p => (
                                            <option key={p.id} value={p.id}>{p.programName} ({p.date})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Detailed Data Grid with Colors */}
                                <div className="border border-black rounded-lg overflow-hidden mb-4 text-sm text-black">
                                    {/* Row 1 */}
                                    <div className="flex border-b border-black">
                                        <div className="w-1/2 flex border-l border-black">
                                            <div className="w-1/3 bg-[#2dd4bf]/20 p-2 font-bold flex items-center justify-center print:bg-[#2dd4bf]/20 flex-shrink-0">اسم البرنامج</div>
                                            <div className="w-2/3 p-0 bg-[#2dd4bf]/5 print:bg-[#2dd4bf]/5 flex items-center justify-center">
                                                <input required type="text" className="w-full h-full p-2 text-center bg-transparent outline-none font-bold"
                                                    value={newReport.programName || ''}
                                                    placeholder="اسم البرنامج"
                                                    onChange={e => setNewReport({...newReport, programName: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="w-1/2 flex">
                                            <div className="w-1/3 bg-[#fb923c]/20 p-2 font-bold flex items-center justify-center border-r border-black print:bg-[#fb923c]/20 flex-shrink-0">التاريخ</div>
                                            <div className="w-2/3 p-0 bg-[#fb923c]/5 print:bg-[#fb923c]/5 relative flex items-center justify-center">
                                                <input required type="date" className="w-full h-full p-2 text-center bg-transparent outline-none font-mono"
                                                    value={newReport.date || ''}
                                                    onChange={e => setNewReport({...newReport, date: e.target.value})} />
                                                {/* Fallback text for print if browser doesn't show input value correctly */}
                                                <span className="hidden print:block absolute inset-0 flex items-center justify-center pointer-events-none">{formatDate(newReport.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Row 2 */}
                                    <div className="flex">
                                        <div className="w-1/2 flex border-l border-black">
                                            <div className="w-1/3 bg-[#4338ca]/20 p-2 font-bold flex items-center justify-center print:bg-[#4338ca]/20 flex-shrink-0">المجال</div>
                                            <div className="w-2/3 p-0 bg-[#4338ca]/5 print:bg-[#4338ca]/5 flex items-center justify-center">
                                                <select className="w-full h-full p-2 text-center bg-transparent outline-none font-bold appearance-none cursor-pointer"
                                                    value={newReport.domain || 'عام'}
                                                    onChange={e => setNewReport({...newReport, domain: e.target.value})}>
                                                    <option>رياضي</option>
                                                    <option>ثقافي</option>
                                                    <option>اجتماعي</option>
                                                    <option>علمي</option>
                                                    <option>عام</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="w-1/2 flex">
                                            <div className="w-1/3 bg-[#f472b6]/20 p-2 font-bold flex items-center justify-center border-r border-black print:bg-[#f472b6]/20 flex-shrink-0">المستفيدين</div>
                                            <div className="w-2/3 p-0 bg-[#f472b6]/5 print:bg-[#f472b6]/5 flex items-center justify-center">
                                                <input type="number" className="w-full h-full p-2 text-center bg-transparent outline-none font-bold font-mono"
                                                    value={newReport.participantsCount || ''}
                                                    placeholder="0"
                                                    onChange={e => setNewReport({...newReport, participantsCount: Number(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Compact Text Areas */}
                                <div className="border border-black rounded p-2 mb-2 min-h-[60px]">
                                    <label className="font-bold text-black block mb-1 border-b border-gray-300 pb-1 w-full text-xs">وصف البرنامج وما تم تنفيذه:</label>
                                    <textarea className="w-full bg-transparent p-1 outline-none text-xs font-bold text-black resize-none min-h-[50px]"
                                        value={newReport.description || ''}
                                        placeholder="اكتب وصفاً تفصيلياً..."
                                        onChange={e => setNewReport({...newReport, description: e.target.value})}></textarea>
                                </div>

                                <div className="border border-black rounded p-2 mb-2 min-h-[60px]">
                                    <label className="font-bold text-black block mb-1 border-b border-gray-300 pb-1 w-full text-xs">أبرز الإيجابيات والمنجزات:</label>
                                    <textarea className="w-full bg-transparent p-1 outline-none text-xs font-bold text-black resize-none min-h-[50px]"
                                        value={newReport.objectives || ''}
                                        placeholder="اكتب الإيجابيات..."
                                        onChange={e => setNewReport({...newReport, objectives: e.target.value})}></textarea>
                                </div>

                                {/* Images Section - Double Border & Reduced Height to h-48 */}
                                <div className="flex-grow mb-0 page-break-inside-avoid">
                                    <label className="font-bold text-black block mb-2 text-sm">التوثيق الصوري (4 صور كحد أقصى):</label>
                                    
                                    {/* Hidden File Input */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleImageUpload} 
                                    />

                                    <div className="grid grid-cols-2 gap-6">
                                        {newReport.images && newReport.images.map((img, idx) => (
                                            <div key={idx} className="relative h-48 border-4 border-double border-[#2e2344] rounded-xl overflow-hidden bg-gray-100 shadow-md group">
                                                <img src={img} className="w-full h-full object-cover" alt="توثيق" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                                    title="حذف الصورة"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {/* Add Image Button (Visible only if less than 4 images) */}
                                        {(!newReport.images || newReport.images.length < 4) && (
                                            <button 
                                                type="button" 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-48 border-4 border-double border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 transition-colors print:hidden bg-gray-50"
                                            >
                                                <CloudUpload size={32} className="mb-2"/>
                                                <span>رفع صورة من الجهاز</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Signatures - Anchored Bottom Style */}
                                <div className="flex justify-between items-end mt-auto pt-4 border-t border-black page-break-inside-avoid">
                                    <div className="text-center w-1/3">
                                        <p className="font-bold text-black mb-2 text-sm">مشرف البرنامج</p>
                                        <input
                                            type="text"
                                            className="w-full text-center border-b border-dashed border-gray-400 focus:border-blue-500 outline-none bg-transparent mb-1 text-xs font-bold text-black"
                                            value={newReport.executorName || ''}
                                            onChange={e => setNewReport({...newReport, executorName: e.target.value})}
                                            placeholder="الاسم"
                                        />
                                        <div className="h-16 flex items-center justify-center relative group">
                                            {newReport.executorSignature ? (
                                                <>
                                                    <img 
                                                        src={newReport.executorSignature} 
                                                        alt="Signature" 
                                                        className="h-full max-w-full object-contain"
                                                    />
                                                    <button
                                                        type="button" 
                                                        onClick={() => setSigningType('executor')}
                                                        className="absolute top-0 right-0 bg-blue-100 text-blue-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                                        title="تعديل التوقيع"
                                                    >
                                                        <Edit size={12}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setSigningType('executor')}
                                                    className="text-xs text-gray-400 hover:text-blue-600 border border-dashed border-gray-300 hover:border-blue-500 rounded px-2 py-1 transition-colors print:hidden"
                                                >
                                                    <PenTool size={12} className="inline mr-1"/> اضغط للتوقيع
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-center w-1/3">
                                        <p className="font-bold text-black mb-2 text-sm">مدير النادي</p>
                                        <input
                                            type="text"
                                            className="w-full text-center border-b border-dashed border-gray-400 focus:border-blue-500 outline-none bg-transparent mb-1 text-xs font-bold text-black"
                                            value={newReport.managerName || ''}
                                            onChange={e => setNewReport({...newReport, managerName: e.target.value})}
                                            placeholder="الاسم"
                                        />
                                        <div className="h-16 flex items-center justify-center relative group">
                                            {newReport.managerSignature ? (
                                                <>
                                                    <img 
                                                        src={newReport.managerSignature} 
                                                        alt="Signature" 
                                                        className="h-full max-w-full object-contain"
                                                    />
                                                    <button
                                                        type="button" 
                                                        onClick={() => setSigningType('manager')}
                                                        className="absolute top-0 right-0 bg-blue-100 text-blue-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                                        title="تعديل التوقيع"
                                                    >
                                                        <Edit size={12}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setSigningType('manager')}
                                                    className="text-xs text-gray-400 hover:text-blue-600 border border-dashed border-gray-300 hover:border-blue-500 rounded px-2 py-1 transition-colors print:hidden"
                                                >
                                                    <PenTool size={12} className="inline mr-1"/> اضغط للتوقيع
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button (Hidden on Print) */}
                                <div className="pt-8 border-t flex justify-center print:hidden">
                                    <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all">
                                        {newReport.id ? (
                                            <><Edit size={20} /> تحديث بيانات التقرير</>
                                        ) : (
                                            <><Save size={20} /> حفظ التقرير وتحديث الحالة</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorPortal;
