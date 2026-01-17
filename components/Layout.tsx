
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, UserCheck, Menu, X, Facebook, Twitter, Instagram, Youtube, LogOut, LogIn, ChevronLeft } from 'lucide-react';
import { SystemSettings, Supervisor, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  settings: SystemSettings;
  currentUser?: Supervisor;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, settings, currentUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: <Home size={20} />, public: true },
    { name: 'طلب عضوية', path: '/membership', icon: <Users size={20} />, public: true },
    { name: 'بوابة المشرف', path: '/supervisor', icon: <UserCheck size={20} />, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.COACH, UserRole.CULTURAL_SUPERVISOR, UserRole.KEEPER, UserRole.EMPLOYEE] },
    { name: 'لوحة التحكم', path: '/admin', icon: <Settings size={20} />, roles: [UserRole.ADMIN] },
  ];

  // Filter items based on auth state
  const allowedNavItems = navItems.filter(item => {
    if (item.public) return true;
    if (!currentUser) return false;
    return item.roles?.includes(currentUser.role);
  });

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      {/* Identity Top Bar */}
      <div className="h-2 w-full flex print:hidden">
          <div className="h-full w-1/4 bg-brand-teal"></div>
          <div className="h-full w-1/4 bg-brand-orange"></div>
          <div className="h-full w-1/4 bg-brand-pink"></div>
          <div className="h-full w-1/4 bg-brand-primary"></div>
      </div>

      {/* Header */}
      <header className="bg-brand-dark text-white shadow-lg sticky top-0 z-50 print:hidden transition-all border-b border-white/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <Link to="/" className="relative group block rounded-full">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt="Club Logo" 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover bg-white/10 border-2 border-white/20 transition-all" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                      ن
                  </div>
                )}
              </Link>
              <div className="hidden md:block">
                <h1 className="text-lg md:text-xl font-bold leading-tight">{settings.clubName}</h1>
                <p className="text-xs text-gray-300">الترفيهي التعليمي</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center bg-white/5 rounded-full px-2 p-1 backdrop-blur-md border border-white/10">
              {allowedNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-white text-brand-dark shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Profile / Login */}
            <div className="flex items-center gap-4">
                
                {currentUser ? (
                    <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                        <div className="text-left hidden lg:block">
                            <p className="text-sm font-bold text-white">{currentUser.name}</p>
                            <p className="text-[10px] text-brand-teal">{currentUser.role}</p>
                        </div>
                        <img 
                          src={currentUser.image} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full border-2 border-brand-teal object-cover" 
                        />
                        <button 
                            onClick={onLogout} 
                            className="p-2 text-red-400 hover:bg-white/10 rounded-full transition-colors"
                            title="تسجيل الخروج"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <Link 
                        to="/login" 
                        className="flex items-center gap-2 bg-gradient-to-r from-brand-teal to-teal-500 text-white px-5 py-2 rounded-full hover:shadow-lg hover:shadow-teal-500/30 transition-all text-sm font-bold transform hover:-translate-y-0.5"
                    >
                        <LogIn size={18} /> <span className="hidden sm:inline">دخول المشرفين</span>
                    </Link>
                )}

                {/* Mobile Toggle */}
                <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg" onClick={toggleSidebar}>
                  {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-brand-dark/95 backdrop-blur-sm print:hidden" onClick={toggleSidebar}>
          <div className="bg-white dark:bg-gray-800 w-72 h-full p-6 shadow-2xl flex flex-col gap-6 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-brand-dark dark:bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">ن</div>
                   <span className="text-xl font-bold text-brand-dark dark:text-white">القائمة</span>
                </div>
                <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <ChevronLeft />
                </button>
            </div>
            
            {currentUser && (
                <div className="bg-brand-dark/5 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3">
                    <img src={currentUser.image} alt="Profile" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-brand-primary dark:text-brand-teal">{currentUser.role}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
              {allowedNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium ${
                    location.pathname === item.path
                      ? 'bg-brand-dark text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={location.pathname === item.path ? 'text-brand-orange' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

             {currentUser ? (
                <button 
                  onClick={() => { onLogout?.(); toggleSidebar(); }}
                  className="mt-auto flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </button>
             ) : (
                <Link
                  to="/login"
                  onClick={toggleSidebar}
                  className="mt-auto flex items-center gap-4 px-4 py-3 rounded-xl bg-brand-dark text-white font-medium"
                >
                  <LogIn size={20} />
                  <span>دخول المشرفين</span>
                </Link>
             )}

          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 print:p-0 print:w-full print:max-w-none">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 print:hidden mt-auto border-t border-gray-800">
         <div className="container mx-auto px-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="col-span-1 md:col-span-2">
                     <div className="flex items-center gap-3 mb-4">
                        {settings.logoUrl ? (
                            <img 
                                src={settings.logoUrl} 
                                alt="Logo" 
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain bg-white/10 border-2 border-white/20 transition-all" 
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-bold">ن</div>
                        )}
                        <h3 className="text-xl font-bold">{settings.clubName}</h3>
                     </div>
                     <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                        {settings.clubMission || 'نسعى لتوفير بيئة تربوية ترفيهية جاذبة لأفراد المجتمع، لاستثمار أوقات فراغهم بما يعود عليهم بالنفع والفائدة.'}
                     </p>
                 </div>
                 
                 <div>
                     <h4 className="font-bold mb-4 text-gray-200">روابط سريعة</h4>
                     <ul className="space-y-2 text-sm text-gray-400">
                         <li><Link to="/" className="hover:text-white">الرئيسية</Link></li>
                         <li><Link to="/membership" className="hover:text-white">طلب عضوية</Link></li>
                         <li><Link to="/login" className="hover:text-white">بوابة المشرفين</Link></li>
                     </ul>
                 </div>

                 <div>
                     <h4 className="font-bold mb-4 text-gray-200">تواصل معنا</h4>
                     <div className="flex gap-4">
                         {settings.socialLinks.twitter && <a href={settings.socialLinks.twitter} className="text-gray-400 hover:text-white"><Twitter size={20} /></a>}
                         {settings.socialLinks.facebook && <a href={settings.socialLinks.facebook} className="text-gray-400 hover:text-white"><Facebook size={20} /></a>}
                         {settings.socialLinks.instagram && <a href={settings.socialLinks.instagram} className="text-gray-400 hover:text-white"><Instagram size={20} /></a>}
                         {settings.socialLinks.youtube && <a href={settings.socialLinks.youtube} className="text-gray-400 hover:text-white"><Youtube size={20} /></a>}
                     </div>
                 </div>
             </div>
             <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
                 &copy; {new Date().getFullYear()} {settings.clubName}. جميع الحقوق محفوظة.
             </div>
         </div>
      </footer>
    </div>
  );
};

export default Layout;
