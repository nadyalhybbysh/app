import React from 'react';
import { ProgramPlan, PlanStatus, SystemSettings, Supervisor, DistinguishedSupervisor } from '../types';
import { Users, Calendar, Trophy, ArrowLeft, CheckCircle2, Star, Quote, X, Download, UserCheck } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DashboardProps {
  plans: ProgramPlan[];
  membersCount: number;
  settings: SystemSettings;
  supervisors: Supervisor[];
  distinguished: DistinguishedSupervisor[];
}

const Dashboard: React.FC<DashboardProps> = ({ plans, membersCount, settings, supervisors, distinguished }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [showCertificate, setShowCertificate] = React.useState(false);
  const slides = settings.sliderImages;

  // Get the latest Distinguished Supervisor
  const latestDistinguished = React.useMemo(() => {
    if (!distinguished || distinguished.length === 0) return null;
    // Sort by Month descending (latest first)
    const sorted = [...distinguished].sort((a, b) => b.monthYear.localeCompare(a.monthYear));
    const entry = sorted[0];
    const supervisorData = supervisors.find(s => s.id === entry.supervisorId);
    return supervisorData ? { ...entry, supervisor: supervisorData } : null;
  }, [distinguished, supervisors]);

  // Carousel Auto-play
  React.useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Helper: Format Date
  const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      return dateString.split('-').reverse().join('/');
  };

  // --- Real Stats Calculation ---
  
  // 1. Filter Upcoming Programs (Pending or In Progress)
  const upcomingPrograms = plans
    .filter(p => p.status === PlanStatus.PENDING || p.status === PlanStatus.IN_PROGRESS)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date nearest
    .slice(0, 5);

  // 2. Filter Executed Programs (For Achievements) - LATEST 5 BY DATE
  const executedPrograms = plans
    .filter(p => p.status === PlanStatus.EXECUTED)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date newest (Descending)
    .slice(0, 5); // Take only top 5

  // 3. Calculate Program Distribution by Domain
  const sportsCount = plans.filter(p => p.domain === 'رياضي').length;
  const culturalCount = plans.filter(p => p.domain === 'ثقافي').length;
  const socialCount = plans.filter(p => p.domain === 'اجتماعي').length;
  const scientificCount = plans.filter(p => p.domain === 'علمي').length;

  // 4. Prepare Chart Data
  const statsData = [
    { name: 'رياضي', value: sportsCount, color: '#0ea5e9' }, // Blue
    { name: 'ثقافي', value: culturalCount, color: '#8b5cf6' }, // Purple
    { name: 'اجتماعي', value: socialCount, color: '#2dd4bf' }, // Teal
    { name: 'علمي', value: scientificCount, color: '#fb923c' }, // Orange
  ].filter(item => item.value > 0); // Only show categories with data

  // If no data, add a placeholder
  if (statsData.length === 0) {
      statsData.push({ name: 'لا يوجد بيانات', value: 1, color: '#e5e7eb' });
  }

  // Helper date formatter
  const formatDateMonth = (dateStr: string) => {
      try {
        const [year, month] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });
      } catch (e) { return dateStr; }
  };

  // Helper for status badge
  const getStatusBadge = (status: PlanStatus) => {
      switch (status) {
          case PlanStatus.EXECUTED: return 'text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400';
          case PlanStatus.NOT_EXECUTED: return 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
          case PlanStatus.IN_PROGRESS: return 'text-sky-700 bg-sky-50 border border-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800';
          default: return 'text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400';
      }
  };

  const handlePrintCertificate = () => {
      window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-32 print:pb-0">
      
      {/* Certificate Modal */}
      {showCertificate && latestDistinguished && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden relative animate-fade-in print:shadow-none print:max-w-none print:w-full print:rounded-none">
                
                {/* Modal Controls */}
                <div className="absolute top-4 left-4 flex gap-2 print:hidden z-10">
                    <button onClick={handlePrintCertificate} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors" title="طباعة">
                        <Download size={20} />
                    </button>
                    <button onClick={() => setShowCertificate(false)} className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors" title="إغلاق">
                        <X size={20} />
                    </button>
                </div>

                {/* Certificate Content */}
                <div className="p-1 print:p-0">
                    <div className="border-8 border-double border-brand-dark/20 p-8 h-full relative bg-[#fffdf5] print:border-none">
                        
                        {/* Corners Decor */}
                        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-[#cbb06a] rounded-tl-3xl opacity-50 print:hidden"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-[#cbb06a] rounded-tr-3xl opacity-50 print:hidden"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-[#cbb06a] rounded-bl-3xl opacity-50 print:hidden"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-[#cbb06a] rounded-br-3xl opacity-50 print:hidden"></div>

                        {/* Header Image */}
                        <div className="w-full mb-8 flex justify-center">
                            <img 
                                src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" 
                                className="h-24 md:h-32 object-contain" 
                                alt="Header" 
                            />
                        </div>

                        <div className="text-center space-y-6 relative z-10">
                            
                            <div className="mb-8">
                                <h2 className="text-4xl font-extrabold text-brand-dark mb-2 font-serif">شهادة شكر وتقدير</h2>
                                <div className="h-1 w-32 bg-[#cbb06a] mx-auto rounded-full"></div>
                            </div>

                            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                                تتقدم إدارة نادي الحي ببيش الترفيهي التعليمي بخالص الشكر والتقدير إلى
                            </p>

                            <div className="py-4">
                                <h1 className="text-3xl md:text-5xl font-bold text-brand-primary mb-2">
                                    {latestDistinguished.supervisor.name}
                                </h1>
                                <p className="text-[#cbb06a] text-xl font-bold">{latestDistinguished.supervisor.role}</p>
                            </div>

                            <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
                                وذلك نظير جهوده المتميزة وتفانيه في العمل وحصوله على لقب <span className="font-bold text-brand-dark">"المشرف المتميز"</span> لشهر <span className="font-bold text-brand-dark">{formatDateMonth(latestDistinguished.monthYear)}</span>.
                                <br/>
                                متمنين له دوام التوفيق والنجاح.
                            </p>

                            {latestDistinguished.notes && (
                                <div className="bg-brand-dark/5 p-4 rounded-xl max-w-2xl mx-auto mt-6 border border-brand-dark/10">
                                    <Quote className="text-[#cbb06a] w-6 h-6 mb-2 mx-auto rotate-180" />
                                    <p className="text-gray-700 italic">"{latestDistinguished.notes}"</p>
                                </div>
                            )}

                            <div className="mt-16 flex justify-between items-end px-12 md:px-32">
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-2 opacity-10">
                                        <img src={settings.logoUrl} className="w-full h-full object-contain grayscale" alt="Seal" />
                                    </div>
                                    <p className="font-bold text-gray-400 text-sm">ختم النادي</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-brand-dark text-lg mb-8">مدير النادي</p>
                                    <p className="font-bold text-xl border-t-2 border-brand-dark pt-2 px-8">أحمد محمد علي</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Members - Blue/Teal */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-teal/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">المسجلين بالنادي</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">{membersCount}</h3>
             </div>
             <div className="p-3 bg-brand-teal/20 text-brand-teal rounded-xl"><Users size={24} /></div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-teal w-[70%]"></div>
          </div>
        </div>

        {/* Supervisors - Purple */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">المشرفين</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">{supervisors.length}</h3>
             </div>
             <div className="p-3 bg-brand-primary/20 text-brand-primary rounded-xl"><UserCheck size={24} /></div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary w-[40%]"></div>
          </div>
        </div>

        {/* Programs - Orange */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-orange/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">إجمالي البرامج</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">{plans.length}</h3>
             </div>
             <div className="p-3 bg-brand-orange/20 text-brand-orange rounded-xl"><Calendar size={24} /></div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange w-[60%]"></div>
          </div>
        </div>

        {/* Achievements (Executed Programs) - Pink/Gold */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-pink/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">البرامج المنفذة</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">{plans.filter(p => p.status === PlanStatus.EXECUTED).length}</h3>
             </div>
             <div className="p-3 bg-brand-pink/20 text-brand-pink rounded-xl"><Trophy size={24} /></div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Calculate percentage of executed vs total */}
              <div className="h-full bg-brand-pink" style={{ width: plans.length > 0 ? `${(plans.filter(p => p.status === PlanStatus.EXECUTED).length / plans.length) * 100}%` : '0%' }}></div>
          </div>
        </div>
      </div>

      {/* Hero Carousel */}
      {slides.length > 0 && (
        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg group border-4 border-white dark:border-gray-800 transition-colors print:hidden">
          <img 
            src={slides[currentSlide].url} 
            alt="Slide" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent flex items-end p-8">
            <div className="animate-fade-in">
              <span className="bg-brand-orange text-white text-xs px-3 py-1 rounded-full mb-2 inline-block font-bold shadow-sm">مميز</span>
              <h2 className="text-white text-3xl font-bold mb-2">{slides[currentSlide].title}</h2>
              <p className="text-gray-200 text-sm md:text-base max-w-2xl font-light">نادي الحي ببيش يقدم مجموعة متميزة من البرامج والفعاليات التي تخدم جميع شرائح المجتمع.</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 flex gap-2">
             {slides.map((_, idx) => (
               <button 
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-brand-orange w-8' : 'bg-white/50 w-2'}`}
                  onClick={() => setCurrentSlide(idx)}
               />
             ))}
          </div>
        </div>
      )}

      {/* --- ROW 1: Upcoming Programs (2/3) & Distinguished Supervisor (1/3) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch print:hidden">
        
        {/* Left: Upcoming Programs Table */}
        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-full flex flex-col transition-colors">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-8 bg-brand-teal rounded-full"></div>
                  البرامج الأسبوعية القادمة
                </h3>
                <button className="text-gray-400 hover:text-brand-dark dark:hover:text-brand-teal text-sm flex items-center gap-1 transition-colors">عرض الجدول الكامل <ArrowLeft size={14}/></button>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b-2 border-gray-100 dark:border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="pb-4 pt-2 font-medium">البرنامج</th>
                      <th className="pb-4 pt-2 font-medium">المجال</th>
                      <th className="pb-4 pt-2 font-medium">التاريخ</th>
                      <th className="pb-4 pt-2 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-5 dark:divide-gray-700">
                    {upcomingPrograms.map(program => (
                      <tr key={program.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <td className="py-4 font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-primary dark:group-hover:text-brand-teal transition-colors">{program.programName}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">{program.domain}</span>
                        </td>
                        <td className="py-4 text-gray-500 dark:text-gray-400 text-sm font-mono">{formatDate(program.date)}</td>
                        <td className="py-4">
                          <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full w-fit ${getStatusBadge(program.status)}`}>
                            {program.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {upcomingPrograms.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                                <Calendar size={48} className="mb-2 stroke-1"/>
                                <p>لا توجد برامج قادمة مسجلة حالياً</p>
                            </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>

        {/* Right: Distinguished Supervisor (Matching Height) */}
        <div className="lg:col-span-1">
             {latestDistinguished ? (
                <div 
                    onClick={() => setShowCertificate(true)}
                    className="bg-gradient-to-br from-[#cbb06a] to-[#a88d45] rounded-3xl shadow-lg p-1 text-white relative overflow-hidden group h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.02]"
                >
                     {/* Shine Effect */}
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-[-150%] transition-transform duration-1000 rotate-45 transform-gpu pointer-events-none"></div>
                     
                     <div className="bg-brand-dark/95 backdrop-blur-sm rounded-[20px] p-6 h-full flex flex-col items-center justify-center relative z-10 text-center gap-4">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Star size={80} /></div>
                        
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#cbb06a] to-[#f3eacb] shadow-lg mb-2 relative">
                            <img 
                                src={latestDistinguished.supervisor.image} 
                                alt={latestDistinguished.supervisor.name} 
                                className="w-full h-full rounded-full object-cover border-4 border-brand-dark"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-[#cbb06a] text-white p-2 rounded-full border-4 border-brand-dark">
                                <Trophy size={16} fill="currentColor" />
                            </div>
                        </div>

                        <div>
                           <h3 className="text-xl font-bold text-[#cbb06a] mb-1">{latestDistinguished.supervisor.name}</h3>
                           <p className="text-gray-400 text-sm">{latestDistinguished.supervisor.role}</p>
                        </div>

                        <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 w-full">
                           <p className="text-xs text-gray-300">المشرف المتميز لشهر <span className="text-white font-bold">{formatDateMonth(latestDistinguished.monthYear)}</span></p>
                        </div>
                     </div>
                </div>
             ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                        <Trophy size={32} className="opacity-50" />
                    </div>
                    <p className="font-medium">لوحة الشرف</p>
                    <p className="text-xs mt-1">لم يتم تحديد المشرف المتميز لهذا الشهر</p>
                </div>
             )}
        </div>
      </div>

      {/* --- ROW 2: Program Distribution (2/3) & Achievements (1/3) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch print:hidden">
        
        {/* Left: Program Distribution Chart */}
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-full flex flex-col transition-colors">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <div className="w-2 h-8 bg-brand-primary rounded-full"></div>
                    توزيع البرامج حسب المجال
                </h3>
                <div className="flex-grow flex flex-col justify-center">
                    {/* Fixed Height Container to prevent Recharts -1 width error */}
                    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <PieChart>
                                <Pie
                                data={statsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                >
                                {statsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)'}} 
                                  itemStyle={{ color: '#374151' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-brand-dark dark:text-white">{plans.length}</span>
                                <span className="text-sm text-gray-400">إجمالي البرامج</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-6 text-sm mt-6 flex-wrap">
                      {statsData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                          <span className="font-bold text-gray-600 dark:text-gray-200">{d.name}</span>
                        </div>
                      ))}
                </div>
            </div>
        </div>

        {/* Right: Achievements List (Matching Height) */}
        <div className="lg:col-span-1">
            <div className="bg-brand-dark dark:bg-black rounded-3xl shadow-lg border border-brand-primary dark:border-gray-800 p-8 text-white relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                    <Trophy className="text-brand-orange" /> آخر 5 إنجازات
                </h3>
                
                <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                    <ul className="space-y-4 relative z-10">
                    {executedPrograms.map((plan, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-brand-teal/20 rounded-lg shrink-0 text-center border border-brand-teal/30 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                                <CheckCircle2 size={18} className="text-brand-teal group-hover:text-white" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-white text-sm leading-snug">{plan.programName}</h4>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-gray-300 font-mono bg-black/20 px-2 py-0.5 rounded">{formatDate(plan.date)}</span>
                                    <span className="text-[10px] text-brand-orange font-medium">{plan.domain}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                    {executedPrograms.length === 0 && (
                        <li className="text-sm text-gray-400 italic text-center py-12 bg-black/20 rounded-xl border border-white/5 flex flex-col items-center justify-center h-full">
                            <Trophy size={32} className="mb-2 opacity-50"/>
                            لا توجد برامج منفذة حتى الآن
                        </li>
                    )}
                    </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-400">يتم تحديث الإنجازات تلقائياً عند تنفيذ الخطط</p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;