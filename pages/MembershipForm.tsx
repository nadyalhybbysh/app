
import React from 'react';
import { Member, SystemSettings } from '../types';
import { Printer, CheckCircle, PenTool, ArrowRight, X, AlertTriangle } from 'lucide-react';
import SignaturePadModal from '../components/SignaturePadModal';

interface MembershipFormProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  settings: SystemSettings;
  initialData?: Member; // For viewing/printing existing members
  readOnly?: boolean; // For Admin view mode
  onClose?: () => void; // Close modal if in admin panel
  hidePrintButton?: boolean; // Hide the floating print button (e.g. for batch printing)
}

const MembershipForm: React.FC<MembershipFormProps> = ({ 
    members, 
    setMembers, 
    settings, 
    initialData, 
    readOnly = false,
    onClose,
    hidePrintButton = false 
}) => {
  
  // State for form data
  const [formData, setFormData] = React.useState<Partial<Member>>({
    fullName: '',
    birthDate: '',
    nationality: 'سعودي',
    city: 'بيش',
    nationalId: '',
    gender: 'ذكر',
    phone: '',
    guardianPhone: '',
    emergencyPhone: '',
    address: '',
    email: '',
    hasSiblings: false,
    siblingsCount: 0,
    chronicDiseases: '',
    allergies: '',
    injuries: '',
    medications: '',
    specialCare: '',
    registrationGoal: [],
    desiredActivities: [],
    otherInterests: [],
    membershipType: 'شهري',
    status: 'pending',
    memberSignature: '',
    guardianSignature: '',
    guardianName: '',
    ...initialData // Pre-fill if viewing
  });

  const [activeSignatureType, setActiveSignatureType] = React.useState<'member' | 'guardian' | null>(null);
  const [generatedSerial, setGeneratedSerial] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Helper: Format Date
  const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      return dateString.split('-').reverse().join('/');
  };

  // Generate Serial Number on Mount (Only if creating new)
  React.useEffect(() => {
      if (!initialData && !generatedSerial) {
          const year = new Date().getFullYear();
          // Logic: Count existing members + 1 (In real app, backend handles this to avoid race conditions)
          const sequence = (members.length + 1).toString().padStart(4, '0');
          setGeneratedSerial(`MEM-${year}-${sequence}`);
      } else if (initialData) {
          setGeneratedSerial(initialData.membershipNumber);
      }
  }, [members.length, initialData, generatedSerial]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    
    // Strict Input Validation based on name (allow only numbers for certain fields)
    if (name === 'nationalId' || name === 'phone' || name.includes('Phone')) {
         if (value && !/^\d*$/.test(value)) return;
         if (name === 'nationalId' && value.length > 10) return;
         if (name.includes('Phone') && value.length > 10) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'registrationGoal' | 'desiredActivities' | 'otherInterests') => {
    if (readOnly) return;
    const { value, checked } = e.target;
    setFormData(prev => {
        const list = prev[category] || [];
        if (checked) {
            return { ...prev, [category]: [...list, value] };
        } else {
            return { ...prev, [category]: list.filter(item => item !== value) };
        }
    });
  };

  const handleSignatureSave = (signatureData: string) => {
      if (activeSignatureType === 'member') {
          setFormData(prev => ({ ...prev, memberSignature: signatureData }));
          if (errors.memberSignature) {
             setErrors(prev => { const e = {...prev}; delete e.memberSignature; return e; });
          }
      } else if (activeSignatureType === 'guardian') {
          setFormData(prev => ({ ...prev, guardianSignature: signatureData }));
      }
      setActiveSignatureType(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.trim().split(/\s+/).length < 3) {
        newErrors.fullName = 'يرجى كتابة الاسم الثلاثي كاملاً.';
    }
    if (!formData.birthDate) {
        newErrors.birthDate = 'يرجى اختيار تاريخ الميلاد.';
    }
    if (!formData.nationalId || formData.nationalId.length !== 10) {
        newErrors.nationalId = 'رقم الهوية يجب أن يتكون من 10 أرقام.';
    }
    if (!formData.phone || formData.phone.length !== 10 || !formData.phone.startsWith('05')) {
        newErrors.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.';
    }
    if (!formData.memberSignature) {
        newErrors.memberSignature = 'توقيع العضو مطلوب على التعهد.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
      if (readOnly) return;

      if (!validateForm()) {
          // Scroll to the error summary or top
          const errorSection = document.getElementById('error-summary');
          if (errorSection) errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
      }

      // Create new member object
      const newMember: Member = {
          ...formData as Member,
          id: Math.random().toString(36).substr(2, 9),
          membershipNumber: generatedSerial, // Save the generated serial
          photo: 'https://ui-avatars.com/api/?name=' + formData.fullName,
          registrationDate: new Date().toISOString().slice(0, 10),
          educationLevel: '',
          hobbies: '',
          skills: '',
          status: 'pending' // Force pending status for approval
      };

      setMembers(prev => [...prev, newMember]);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to get input class based on error
  const getInputClass = (fieldName: string, baseClass: string = "flex-grow bg-transparent outline-none border-b") => {
      return `${baseClass} ${errors[fieldName] ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-300 focus:border-blue-500'}`;
  };

  // Success Screen
  if (isSubmitted) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in max-w-2xl mx-auto my-10">
              <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6">
                  <CheckCircle size={64} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">تم إرسال طلب العضوية بنجاح!</h2>
              <p className="text-gray-600 mb-6">رقم طلبك هو: <span className="font-bold text-blue-600 font-mono text-xl">{generatedSerial}</span></p>
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-8 max-w-md">
                  سيتم مراجعة طلبك من قبل إدارة النادي واعتماده قريباً. يمكنك استخدام رقم الطلب للمراجعة.
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
              >
                 <ArrowRight size={18} /> العودة للرئيسية
              </button>
          </div>
      );
  }

  // --- COMPACT LAYOUT FOR 2 PAGES ---
  return (
    <div className={`mx-auto bg-white shadow-xl min-h-screen relative ${readOnly ? 'shadow-none w-full' : 'max-w-[210mm] print:w-full print:shadow-none'}`}>
      
      {/* Hide Browser Headers/Footers */}
      <style>{`@media print { @page { margin: 0; } body { margin: 0; } }`}</style>

      {/* Admin Close Button */}
      {readOnly && onClose && (
          <button onClick={onClose} className="absolute top-4 left-4 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 print:hidden z-50">
              <X size={20} />
          </button>
      )}

      <SignaturePadModal 
        isOpen={!!activeSignatureType}
        title={activeSignatureType === 'member' ? 'توقيع العضو' : 'توقيع ولي الأمر'}
        onClose={() => setActiveSignatureType(null)}
        onSave={handleSignatureSave}
      />

      {/* Header - Image Banner - Compact for Print */}
      <div className="w-full pt-4 mb-2 flex justify-center">
         <img 
            src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" 
            className="w-full h-16 object-contain" 
            alt="Header Banner"
            referrerPolicy="no-referrer"
         />
      </div>

      <div className="text-center py-1 relative">
          <h1 className="text-lg font-bold text-blue-700">استمارة تسجيل الأعضاء</h1>
          <div className="absolute left-8 top-1 border border-blue-900 px-2 py-0.5 rounded text-[10px] font-bold text-blue-900">
              رقم العضوية: {generatedSerial}
          </div>
      </div>

      <div className="px-8 pb-4 space-y-0 text-sm">
         
         {/* Club Info */}
         <div className="bg-blue-900 text-white p-0.5 font-bold text-center border border-black text-xs">معلومات النادي</div>
         <div className="border border-t-0 border-black p-1 flex items-center justify-between text-[10px]">
             <div className="flex items-center">
                 <span className="font-bold ml-2">اسم النادي :</span>
                 <span>{settings.clubName}</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="font-bold">رقم التواصل مع الإدارة :</span>
                 <span dir="ltr" className="font-mono font-bold">0554503545</span>
             </div>
         </div>

         {/* Personal Info - Reduced Padding */}
         <div className="bg-blue-900 text-white p-0.5 font-bold text-center border border-t-0 border-black text-xs">معلومات شخصية</div>
         <div className="border border-t-0 border-black grid grid-cols-2 text-[10px]">
             <div className="border-l border-black p-0.5 flex items-center relative">
                 <span className="font-bold ml-1 w-16">الاسم الثلاثي :</span>
                 <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={readOnly} className={getInputClass('fullName', "flex-grow bg-transparent outline-none")} placeholder={errors.fullName ? 'مطلوب *' : ''} />
             </div>
             <div className="p-0.5 flex items-center relative">
                 <span className="font-bold ml-1 w-16">تاريخ الميلاد :</span>
                 {readOnly ? (
                     <div className="flex-grow border-b border-gray-300">{formatDate(formData.birthDate)}</div>
                 ) : (
                     <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={getInputClass('birthDate', "flex-grow outline-none")} />
                 )}
             </div>
         </div>
         <div className="border border-t-0 border-black grid grid-cols-3 text-[10px]">
             <div className="border-l border-black p-0.5 flex items-center">
                 <span className="font-bold ml-1 w-10">الجنسية :</span>
                 <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} disabled={readOnly} className="flex-grow bg-transparent outline-none border-b border-gray-300 focus:border-blue-500" />
             </div>
             <div className="border-l border-black p-0.5 flex items-center">
                 <span className="font-bold ml-1 w-10">المدينة :</span>
                 <input type="text" name="city" value={formData.city} onChange={handleInputChange} disabled={readOnly} className="flex-grow bg-transparent outline-none border-b border-gray-300 focus:border-blue-500" />
             </div>
             <div className="p-0.5 flex items-center relative">
                 <span className="font-bold ml-1 w-14">رقم الهوية :</span>
                 <input type="text" name="nationalId" maxLength={10} placeholder="10 أرقام" value={formData.nationalId} onChange={handleInputChange} disabled={readOnly} className={getInputClass('nationalId', "flex-grow bg-transparent outline-none w-full")} />
             </div>
         </div>
         <div className="border border-t-0 border-black p-0.5 flex items-center gap-8 text-[10px]">
             <span className="font-bold ml-1">الجنس :</span>
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="radio" name="gender" value="ذكر" checked={formData.gender === 'ذكر'} onChange={handleInputChange} disabled={readOnly} className="accent-blue-900" /> ذكر
             </label>
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="radio" name="gender" value="أنثى" checked={formData.gender === 'أنثى'} onChange={handleInputChange} disabled={readOnly} className="accent-blue-900" /> أنثى
             </label>
         </div>

         {/* Contact Info - Reduced Padding */}
         <div className="bg-blue-900 text-white p-0.5 font-bold text-center border border-t-0 border-black text-xs">معلومات التواصل</div>
         <div className="border border-t-0 border-black grid grid-cols-2 text-[10px]">
             <div className="border-l border-black p-0.5 flex items-center relative">
                 <span className="font-bold ml-1">رقم التواصل :</span>
                 <input type="tel" name="phone" maxLength={10} placeholder="05xxxxxxxx" value={formData.phone} onChange={handleInputChange} disabled={readOnly} className={getInputClass('phone', "flex-grow bg-transparent outline-none")} />
             </div>
             <div className="p-0.5 flex items-center">
                 <span className="font-bold ml-1">رقم ولي الأمر :</span>
                 <input type="tel" name="guardianPhone" maxLength={10} placeholder="05xxxxxxxx" value={formData.guardianPhone} onChange={handleInputChange} disabled={readOnly} className="flex-grow bg-transparent outline-none border-b border-gray-300 focus:border-blue-500" />
             </div>
         </div>
         <div className="border border-t-0 border-black grid grid-cols-2 text-[10px]">
             <div className="border-l border-black p-0.5 flex items-center">
                 <span className="font-bold ml-1">رقم الطوارئ :</span>
                 <input type="tel" name="emergencyPhone" maxLength={10} placeholder="05xxxxxxxx" value={formData.emergencyPhone} onChange={handleInputChange} disabled={readOnly} className="flex-grow bg-transparent outline-none border-b border-gray-300 focus:border-blue-500" />
             </div>
             <div className="p-0.5 flex items-center">
                 <span className="font-bold ml-1">العنوان :</span>
                 <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={readOnly} className="flex-grow bg-transparent outline-none border-b border-gray-300 focus:border-blue-500" />
             </div>
         </div>
         <div className="border border-t-0 border-black p-0.5 flex items-center text-[10px]">
             <span className="font-bold ml-1">البريد الإلكتروني :</span>
             <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={readOnly} className="flex-grow bg-transparent outline-none border-b border-gray-300 focus:border-blue-500 text-left" dir="ltr" />
         </div>
         <div className="border border-t-0 border-black p-0.5 flex items-center flex-wrap gap-4 text-[10px]">
             <span className="font-bold">هل يوجد إخوة مشتركين في النادي :</span>
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="radio" name="hasSiblings" checked={formData.hasSiblings === false} onChange={() => setFormData(p => ({...p, hasSiblings: false}))} disabled={readOnly} className="accent-blue-900" /> لا
             </label>
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="radio" name="hasSiblings" checked={formData.hasSiblings === true} onChange={() => setFormData(p => ({...p, hasSiblings: true}))} disabled={readOnly} className="accent-blue-900" /> نعم
             </label>
             <div className="flex items-center gap-2 mr-4">
                <span>في حال الإجابة بنعم، كم العدد :</span>
                <input type="number" name="siblingsCount" disabled={!formData.hasSiblings || readOnly} value={formData.siblingsCount} onChange={(e) => setFormData(p => ({...p, siblingsCount: Number(e.target.value)}))} className="w-16 border-b border-black text-center bg-transparent outline-none" />
             </div>
         </div>

         {/* Medical Info - Very Compact */}
         <div className="bg-blue-900 text-white p-0.5 font-bold text-center border border-t-0 border-black text-xs">معلومات طبية</div>
         <div className="border border-t-0 border-black p-1 text-[10px]">
             <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                 <div className="flex items-center gap-1">
                     <input type="checkbox" className="accent-red-600" disabled={readOnly} checked={!!formData.chronicDiseases} onChange={(e) => setFormData(p => ({...p, chronicDiseases: e.target.checked ? 'نعم' : ''}))} />
                     <span className="font-bold whitespace-nowrap">أمراض مزمنة:</span>
                     <input type="text" name="chronicDiseases" value={formData.chronicDiseases} onChange={handleInputChange} disabled={readOnly} className="flex-grow border-b border-gray-300 outline-none p-0 h-4" />
                 </div>
                 <div className="flex items-center gap-1">
                     <input type="checkbox" className="accent-red-600" disabled={readOnly} checked={!!formData.allergies} onChange={(e) => setFormData(p => ({...p, allergies: e.target.checked ? 'نعم' : ''}))} />
                     <span className="font-bold whitespace-nowrap">حساسية:</span>
                     <input type="text" name="allergies" value={formData.allergies} onChange={handleInputChange} disabled={readOnly} className="flex-grow border-b border-gray-300 outline-none p-0 h-4" />
                 </div>
                 <div className="flex items-center gap-1">
                     <input type="checkbox" className="accent-red-600" disabled={readOnly} checked={!!formData.injuries} onChange={(e) => setFormData(p => ({...p, injuries: e.target.checked ? 'نعم' : ''}))} />
                     <span className="font-bold whitespace-nowrap">إصابات:</span>
                     <input type="text" name="injuries" value={formData.injuries} onChange={handleInputChange} disabled={readOnly} className="flex-grow border-b border-gray-300 outline-none p-0 h-4" />
                 </div>
                 <div className="flex items-center gap-1">
                     <input type="checkbox" className="accent-red-600" disabled={readOnly} checked={!!formData.medications} onChange={(e) => setFormData(p => ({...p, medications: e.target.checked ? 'نعم' : ''}))} />
                     <span className="font-bold whitespace-nowrap">أدوية:</span>
                     <input type="text" name="medications" value={formData.medications} onChange={handleInputChange} disabled={readOnly} className="flex-grow border-b border-gray-300 outline-none p-0 h-4" />
                 </div>
                 <div className="flex items-center gap-1 col-span-2">
                     <input type="checkbox" className="accent-red-600" disabled={readOnly} checked={!!formData.specialCare} onChange={(e) => setFormData(p => ({...p, specialCare: e.target.checked ? 'نعم' : ''}))} />
                     <span className="font-bold whitespace-nowrap w-auto">حالة طبية خاصة:</span>
                     <input type="text" name="specialCare" value={formData.specialCare} onChange={handleInputChange} disabled={readOnly} className="flex-grow border-b border-gray-300 outline-none p-0 h-4" />
                 </div>
             </div>
         </div>

         {/* Goals & Activities - Compact Grid */}
         <div className="bg-blue-900 text-white p-0.5 font-bold text-center border border-t-0 border-black text-xs">الاهتمامات والأنشطة</div>
         <div className="border border-t-0 border-black p-1 grid grid-cols-2 gap-1 text-[10px]">
             <div>
                 <p className="font-bold mb-0.5 underline">الهدف من التسجيل:</p>
                 {['اتباع نمط حياة صحي', 'تجربة رياضات جديدة', 'ممارسة الرياضة ضمن مجموعات', 'ترفيه'].map(goal => (
                     <label key={goal} className="flex items-center gap-1 cursor-pointer">
                         <input type="checkbox" className="accent-red-600 h-3 w-3" value={goal} 
                            disabled={readOnly}
                            checked={formData.registrationGoal?.includes(goal)} 
                            onChange={(e) => handleCheckboxChange(e, 'registrationGoal')} />
                         {goal}
                     </label>
                 ))}
             </div>
             <div>
                 <p className="font-bold mb-0.5 underline">الأنشطة المرغوبة:</p>
                 <div className="grid grid-cols-2 gap-0.5">
                    {['كرة قدم', 'كرة طائرة', 'كرة سلة', 'كرة يد', 'فنون القتال', 'اللياقة'].map(act => (
                        <label key={act} className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" className="accent-red-600 h-3 w-3" value={act}
                                disabled={readOnly}
                                checked={formData.desiredActivities?.includes(act)}
                                onChange={(e) => handleCheckboxChange(e, 'desiredActivities')} />
                            {act}
                        </label>
                    ))}
                 </div>
             </div>
         </div>

         {/* Other Interests - Very Compact */}
         <div className="border border-t-0 border-black p-1 text-[10px]">
             <div className="font-bold mb-0.5">أنشطة أخرى:</div>
             <div className="flex flex-wrap gap-2">
                 {['تعليمية', 'دينية', 'علوم', 'مهارات صيانة', 'تطوعي'].map(int => (
                     <label key={int} className="flex items-center gap-1 cursor-pointer">
                         <input type="checkbox" className="accent-red-600 h-3 w-3" value={int}
                            disabled={readOnly}
                            checked={formData.otherInterests?.includes(int)}
                            onChange={(e) => handleCheckboxChange(e, 'otherInterests')} />
                         {int}
                     </label>
                 ))}
             </div>
         </div>

         {/* Subscription Type & Terms - Compact */}
         <div className="bg-blue-900 text-white p-0.5 font-bold text-center border border-t-0 border-black text-xs">نوع الاشتراك والتعهد</div>
         <div className="border border-t-0 border-black p-1 text-[10px]">
             <div className="flex gap-4 justify-center mb-2 font-bold">
                 <label className="flex items-center gap-1 cursor-pointer">
                     <input type="radio" name="membershipType" value="يومي" checked={formData.membershipType === 'يومي'} onChange={handleInputChange} disabled={readOnly} className="accent-red-600 w-3 h-3" /> اشتراك يومي
                 </label>
                 <label className="flex items-center gap-1 cursor-pointer">
                     <input type="radio" name="membershipType" value="شهري" checked={formData.membershipType === 'شهري'} onChange={handleInputChange} disabled={readOnly} className="accent-red-600 w-3 h-3" /> اشتراك شهري
                 </label>
             </div>
             
             <div className="text-justify leading-tight bg-gray-50 p-2 rounded border border-gray-200">
                 <p className="font-bold underline mb-1">الشروط والأحكام:</p>
                 <ol className="list-decimal list-inside space-y-0.5 text-[9px] text-gray-700">
                     <li>أقر بأن جميع البيانات المدونة أعلاه صحيحة وعلى مسؤوليتي الشخصية.</li>
                     <li>أتعهد بالالتزام بجميع أنظمة وتعليمات النادي والمحافظة على مرافقه وممتلكاته.</li>
                     <li>أوافق على المشاركة في الأنشطة والبرامج حسب الجدول المعد من قبل إدارة النادي.</li>
                     <li>أقر بخلوّي من الأمراض المعدية التي قد تضر بالآخرين، وأتحمل مسؤولية حالتي الصحية.</li>
                     <li>لإدارة النادي الحق في إلغاء العضوية في حال مخالفة الأنظمة أو السلوك غير اللائق.</li>
                     <li>رسوم الاشتراك غير مستردة بعد بدء النشاط.</li>
                 </ol>
             </div>
         </div>

         {/* Signatures */}
         <div className="border border-t-0 border-black p-2 flex justify-between items-end text-[10px] min-h-[80px]">
             <div className="text-center w-1/3">
                 <p className="font-bold mb-1">توقيع العضو</p>
                 <div className="h-12 flex items-center justify-center border-b border-dashed border-gray-400 cursor-pointer hover:bg-gray-50" onClick={() => !readOnly && setActiveSignatureType('member')}>
                     {formData.memberSignature ? (
                         <img src={formData.memberSignature} alt="Signature" className="max-h-full" />
                     ) : (
                         <span className="text-gray-300 text-[8px] print:hidden">اضغط للتوقيع</span>
                     )}
                 </div>
                 {errors.memberSignature && <p className="text-red-500 text-[8px]">{errors.memberSignature}</p>}
             </div>
             <div className="text-center w-1/3">
                 <p className="font-bold mb-1">توقيع ولي الأمر</p>
                 <div className="h-12 flex items-center justify-center border-b border-dashed border-gray-400 cursor-pointer hover:bg-gray-50" onClick={() => !readOnly && setActiveSignatureType('guardian')}>
                     {formData.guardianSignature ? (
                         <img src={formData.guardianSignature} alt="Signature" className="max-h-full" />
                     ) : (
                         <span className="text-gray-300 text-[8px] print:hidden">اضغط للتوقيع</span>
                     )}
                 </div>
             </div>
             <div className="text-center w-1/3">
                 <p className="font-bold mb-1">اعتماد مدير النادي</p>
                 <div className="h-12 flex items-end justify-center">
                     <span className="font-bold text-gray-800">أحمد محمد علي</span>
                 </div>
             </div>
         </div>

         {/* Footer / Buttons */}
         {!readOnly && (
             <div className="mt-4 flex justify-center gap-4 print:hidden">
                 <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">إرسال الطلب</button>
             </div>
         )}
         
         {!hidePrintButton && readOnly && (
             <div className="fixed bottom-8 left-8 print:hidden">
                 <button onClick={handlePrint} className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition-transform hover:scale-110 flex items-center gap-2">
                     <Printer size={24} /> <span className="font-bold">طباعة</span>
                 </button>
             </div>
         )}
      </div>
    </div>
  );
};

export default MembershipForm;
