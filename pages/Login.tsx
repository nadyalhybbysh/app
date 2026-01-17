
import React from 'react';
import { Supervisor, SystemSettings, UserRole } from '../types';
import { LogIn, User, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
    users: Supervisor[];
    onLogin: (user: Supervisor) => void;
    settings: SystemSettings;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, settings }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Direct Database Synchronization:
            // Fetch the user directly from Supabase to ensure we have the latest Password and Role.
            const { data, error: dbError } = await supabase
                .from('supervisors')
                .select('*')
                .ilike('email', email.trim())
                .maybeSingle();

            // 2. Resolve User Data (DB Priority -> Local Fallback)
            let userToVerify = data as Supervisor | null;

            // If database fetch failed or returned nothing (e.g. offline or not found in DB), 
            // try to find in the local 'users' prop (which might contain mock data).
            if (!userToVerify) {
                userToVerify = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
            }

            if (userToVerify) {
                // 3. Confirm Role
                if (!userToVerify.role) {
                    setError('هذا الحساب ليس لديه صلاحية دخول (لا يوجد دور وظيفي).');
                    setLoading(false);
                    return;
                }

                // 4. Confirm Password (Database Sync)
                // Use the password from the DB, or default to '123456' if null
                const validPassword = userToVerify.password || '123456';
                
                if (password === validPassword) {
                    onLogin(userToVerify);
                } else {
                    setError('كلمة المرور غير صحيحة');
                }
            } else {
                setError('البريد الإلكتروني غير مسجل في النظام');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('حدث خطأ غير متوقع أثناء الاتصال بالنظام.');
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (role: UserRole) => {
        const foundUser = users.find(u => u.role === role);
        if (foundUser) {
            setEmail(foundUser.email);
            // Auto fill based on the user's current password
            setPassword(foundUser.password || '123456');
            setError('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
            
            {/* Background with Banner Image */}
            <div className="absolute inset-0 bg-brand-dark">
                <img 
                    src="https://lh3.googleusercontent.com/d/1jYLgNeJGU0D9bfzvt4fxzS_zdFGsPdb_" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-20 blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent"></div>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative z-10 border border-white/20 dark:border-gray-700 transition-colors duration-300">
                
                <Link to="/" className="absolute top-4 left-4 z-20 text-gray-400 hover:text-brand-dark dark:hover:text-white transition-colors" title="العودة للرئيسية">
                    <ArrowLeft size={24} />
                </Link>

                <div className="p-8 pb-0 text-center">
                    <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center mb-4 p-1 transition-colors">
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover"/>
                        ) : (
                            <User size={40} className="text-brand-dark dark:text-white" />
                        )}
                    </div>
                    <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white">{settings.clubName}</h1>
                    <div className="h-1 w-16 bg-gradient-to-r from-brand-teal to-brand-orange mx-auto mt-3 rounded-full"></div>
                </div>
                
                <div className="p-8">
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 text-center">بوابة دخول المشرفين</h2>
                    
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mr-1">البريد الإلكتروني</label>
                            <div className="relative group">
                                <Mail className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-brand-primary dark:group-focus-within:text-brand-teal transition-colors" size={18} />
                                <input 
                                    type="email"
                                    className="w-full border-2 border-gray-100 dark:border-gray-700 rounded-xl p-3 pr-10 outline-none focus:border-brand-primary/50 dark:focus:border-brand-teal/50 focus:bg-white dark:focus:bg-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all font-sans text-left placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    dir="ltr"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 mr-1">كلمة المرور</label>
                            <div className="relative group">
                                <Lock className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-brand-primary dark:group-focus-within:text-brand-teal transition-colors" size={18} />
                                <input 
                                    type="password"
                                    className="w-full border-2 border-gray-100 dark:border-gray-700 rounded-xl p-3 pr-10 outline-none focus:border-brand-primary/50 dark:focus:border-brand-teal/50 focus:bg-white dark:focus:bg-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all font-sans text-left placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    dir="ltr"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-brand-dark dark:bg-brand-primary text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-brand-primary/80 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />} 
                            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                        </button>
                    </form>

                    {/* Quick Access for Demo */}
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mb-3">دخول سريع (لأغراض التجربة فقط)</p>
                        <div className="flex justify-center gap-2 flex-wrap">
                            <button 
                                onClick={() => fillCredentials(UserRole.MANAGER)}
                                className="text-[10px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full transition-colors font-bold"
                            >
                                مدير النادي
                            </button>
                            <button 
                                onClick={() => fillCredentials(UserRole.SUPERVISOR)}
                                className="text-[10px] bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full transition-colors font-bold"
                            >
                                مساعد إداري
                            </button>
                             <button 
                                onClick={() => fillCredentials(UserRole.COACH)}
                                className="text-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full transition-colors font-bold"
                            >
                                مدرب رياضي
                            </button>
                             <button 
                                onClick={() => fillCredentials(UserRole.CULTURAL_SUPERVISOR)}
                                className="text-[10px] bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full transition-colors font-bold"
                            >
                                مشرف ثقافي
                            </button>
                            <button 
                                onClick={() => fillCredentials(UserRole.EMPLOYEE)}
                                className="text-[10px] bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-full transition-colors font-bold"
                            >
                                موظف النادي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
