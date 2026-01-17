
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SupervisorPortal from './pages/SupervisorPortal';
import AdminPanel from './pages/AdminPanel';
import MembershipForm from './pages/MembershipForm';
import Login from './pages/Login';
import { Supervisor, ProgramPlan, Member, SystemSettings, ProgramReport, UserRole, DailyReport, DistinguishedSupervisor, PlanStatus } from './types';
import { storage } from './utils/storage';
import * as api from './services/api';
import { MOCK_SUPERVISORS, MOCK_SETTINGS } from './services/mockData';

// Moved ProtectedRoute outside to avoid re-creation and fix typing issues
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  currentUser: Supervisor | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, currentUser }) => {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
     return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  // Load initial state
  const [currentUser, setCurrentUser] = React.useState<Supervisor | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [supervisors, setSupervisors] = React.useState<Supervisor[]>([]);
  const [plans, setPlans] = React.useState<ProgramPlan[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [reports, setReports] = React.useState<ProgramReport[]>([]);
  const [dailyReports, setDailyReports] = React.useState<DailyReport[]>([]); 
  const [distinguished, setDistinguished] = React.useState<DistinguishedSupervisor[]>([]); 
  const [settings, setSettings] = React.useState<SystemSettings>(storage.getSettings()); // Default fallback

  // Fetch Data from Supabase
  const fetchData = async () => {
      try {
          const [fetchedSupervisors, fetchedPlans, fetchedMembers, fetchedReports, fetchedDaily, fetchedDistinguished, fetchedSettings] = await Promise.all([
              api.fetchSupervisors(),
              api.fetchPlans(),
              api.fetchMembers(),
              api.fetchReports(),
              api.fetchDailyReports(),
              api.fetchDistinguished(),
              api.fetchSettings()
          ]);

          // Handle First Time Admin Setup if DB is empty
          let finalSupervisors = fetchedSupervisors;
          if (finalSupervisors.length === 0) {
              const defaultAdmin = MOCK_SUPERVISORS.find(u => u.role === UserRole.ADMIN);
              if (defaultAdmin) {
                  // Try to save the admin, but if it fails (due to missing table), don't crash
                  await api.upsertSupervisor(defaultAdmin); 
                  finalSupervisors = [defaultAdmin];
              }
          }

          // --- AUTOMATED STATUS UPDATE LOGIC ---
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const updatedPlans = fetchedPlans.map(plan => {
              const planDate = new Date(plan.date);
              planDate.setHours(0, 0, 0, 0);
              const hasReport = fetchedReports.some(r => r.planId === plan.id);
              
              if (hasReport && plan.status !== PlanStatus.EXECUTED) {
                  const updated = { ...plan, status: PlanStatus.EXECUTED };
                  api.upsertPlan(updated); // Sync back to DB
                  return updated;
              }

              const diffTime = today.getTime() - planDate.getTime();
              const diffDays = diffTime / (1000 * 3600 * 24);

              if (diffDays > 14 && !hasReport && plan.status !== PlanStatus.NOT_EXECUTED) {
                  const updated = { ...plan, status: PlanStatus.NOT_EXECUTED };
                  api.upsertPlan(updated);
                  return updated;
              }

              if (today.getTime() >= planDate.getTime() && plan.status === PlanStatus.PENDING) {
                   const updated = { ...plan, status: PlanStatus.IN_PROGRESS };
                   api.upsertPlan(updated);
                   return updated;
              }

              return plan;
          });

          // FORCE NEW LOGO UPDATE
          // Ensure the app uses the new logo even if DB has old data
          if (fetchedSettings) {
              fetchedSettings.logoUrl = MOCK_SETTINGS.logoUrl;
          }

          setSupervisors(finalSupervisors);
          setPlans(updatedPlans);
          setMembers(fetchedMembers);
          setReports(fetchedReports);
          setDailyReports(fetchedDaily);
          setDistinguished(fetchedDistinguished);
          setSettings(fetchedSettings);

          // Restore User Session
          const storedUser = storage.getCurrentUser();
          if (storedUser) {
              const userExists = finalSupervisors.find(u => u.id === storedUser.id);
              setCurrentUser(userExists || null);
          }

      } catch (error) {
          console.warn("App initialized in Offline/Mock mode due to connection or setup issue:", error);
          // Fallback to minimal setup if everything fails hard
          setSupervisors(MOCK_SUPERVISORS); 
      } finally {
          setLoading(false);
      }
  };

  React.useEffect(() => {
      fetchData();
  }, []);

  // --- Wrapped Setters to Sync with Supabase ---
  
  const handleSetSupervisors: React.Dispatch<React.SetStateAction<Supervisor[]>> = (value) => {
      setSupervisors(prev => {
          const newVal = typeof value === 'function' ? value(prev) : value;
          return newVal;
      });
  };

  // User Session Handling
  const handleLogin = (user: Supervisor) => {
      setCurrentUser(user);
      storage.saveCurrentUser(user);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      storage.saveCurrentUser(null);
  };

  // --- API Wrappers for Child Components ---
  // These functions update Supabase AND Local State
  
  const saveSupervisor = async (s: Supervisor) => {
      await api.upsertSupervisor(s);
      setSupervisors(prev => {
          const exists = prev.find(i => i.id === s.id);
          return exists ? prev.map(i => i.id === s.id ? s : i) : [...prev, s];
      });
  };

  const removeSupervisor = async (id: string) => {
      await api.deleteSupervisor(id);
      setSupervisors(prev => prev.filter(s => s.id !== id));
  };

  const savePlan = async (p: ProgramPlan) => {
      await api.upsertPlan(p);
      setPlans(prev => {
          const exists = prev.find(i => i.id === p.id);
          return exists ? prev.map(i => i.id === p.id ? p : i) : [...prev, p];
      });
  };

  const removePlan = async (id: string) => {
      await api.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
  };

  const saveReport = async (r: ProgramReport) => {
      await api.upsertReport(r);
      setReports(prev => {
          const exists = prev.find(i => i.id === r.id);
          return exists ? prev.map(i => i.id === r.id ? r : i) : [...prev, r];
      });
      // Also update plan status if needed
      const relatedPlan = plans.find(p => p.id === r.planId);
      if (relatedPlan && relatedPlan.status !== PlanStatus.EXECUTED) {
          const updatedPlan = { ...relatedPlan, status: PlanStatus.EXECUTED };
          savePlan(updatedPlan);
      }
  };

  const saveMember = async (m: Member) => {
      await api.upsertMember(m);
      setMembers(prev => {
          const exists = prev.find(i => i.id === m.id);
          return exists ? prev.map(i => i.id === m.id ? m : i) : [...prev, m];
      });
  };
  
  const removeMember = async (id: string) => {
      await api.deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
  };

  const saveDailyReport = async (r: DailyReport) => {
      await api.upsertDailyReport(r);
      setDailyReports(prev => {
          const exists = prev.find(i => i.id === r.id);
          return exists ? prev.map(i => i.id === r.id ? r : i) : [r, ...prev];
      });
  };
  
  const removeDailyReport = async (id: string) => {
      await api.deleteDailyReport(id);
      setDailyReports(prev => prev.filter(r => r.id !== id));
  };

  const saveDistinguished = async (d: DistinguishedSupervisor) => {
      await api.upsertDistinguished(d);
      setDistinguished(prev => {
          const exists = prev.find(i => i.id === d.id);
          return exists ? prev.map(i => i.id === d.id ? d : i) : [...prev, d];
      });
  };

  const removeDistinguished = async (id: string) => {
      await api.deleteDistinguished(id);
      setDistinguished(prev => prev.filter(d => d.id !== id));
  };

  const saveSettingsData = async (s: SystemSettings) => {
      await api.updateSettings(s);
      setSettings(s);
  };

  if (loading) return <div className="flex h-screen items-center justify-center gap-2"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div> جاري الاتصال بقاعدة البيانات...</div>;

  return (
    <HashRouter>
      <Layout settings={settings} currentUser={currentUser || undefined} onLogout={handleLogout}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <Dashboard 
              plans={plans} 
              membersCount={members.length} 
              settings={settings} 
              supervisors={supervisors} 
              distinguished={distinguished} 
            />
          } />
          
          <Route path="/membership" element={
             <MembershipForm 
                members={members} 
                setMembers={(val) => {
                    if (typeof val === 'function') {
                        const newMembers = val(members);
                        const added = newMembers.find(m => !members.includes(m));
                        if(added) saveMember(added);
                    }
                }} 
                settings={settings} 
             />
          } />
          
          {/* Login Route */}
          <Route path="/login" element={
            !currentUser ? (
               <Login users={supervisors} onLogin={handleLogin} settings={settings} />
            ) : (
               <Navigate to={currentUser.role === UserRole.ADMIN ? "/admin" : "/supervisor"} replace />
            )
          } />

          {/* Protected Routes */}
          <Route 
            path="/supervisor" 
            element={
              <ProtectedRoute currentUser={currentUser}>
                 <SupervisorPortal 
                    plans={plans} 
                    setPlans={(val) => {
                        const newPlans = typeof val === 'function' ? val(plans) : val;
                        // Handle deletion logic for Supervisor Portal
                        if (newPlans.length < plans.length) {
                             const deleted = plans.find(p => !newPlans.includes(p));
                             if (deleted) removePlan(deleted.id);
                        } else {
                             const changed = newPlans.find(p => !plans.includes(p) || plans.find(old => old.id === p.id && old !== p));
                             if(changed) savePlan(changed);
                        }
                    }} 
                    reports={reports}
                    setReports={(val) => {
                        const newReports = typeof val === 'function' ? val(reports) : val;
                        const changed = newReports.find(r => !reports.includes(r) || reports.find(old => old.id === r.id && old !== r));
                        if(changed) saveReport(changed);
                    }}
                    supervisor={currentUser!} 
                    supervisors={supervisors} 
                    settings={settings}
                  />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute currentUser={currentUser} allowedRoles={[UserRole.ADMIN]}>
                <AdminPanel 
                  supervisors={supervisors}
                  setSupervisors={(val) => {
                      const newData = typeof val === 'function' ? val(supervisors) : val;
                      if(newData.length < supervisors.length) {
                          const deleted = supervisors.find(s => !newData.includes(s));
                          if(deleted) removeSupervisor(deleted.id);
                      } else {
                          const changed = newData.find(x => !supervisors.includes(x) || supervisors.find(old => old.id === x.id && old !== x));
                          if(changed) saveSupervisor(changed);
                      }
                  }}
                  plans={plans}
                  setPlans={(val) => {
                      const newData = typeof val === 'function' ? val(plans) : val;
                      const changed = newData.find(x => !plans.includes(x) || plans.find(old => old.id === x.id && old !== x));
                      if(changed) savePlan(changed);
                  }}
                  members={members}
                  setMembers={(val) => {
                      const newData = typeof val === 'function' ? val(members) : val;
                      if(newData.length < members.length) {
                          const deleted = members.find(m => !newData.includes(m));
                          if(deleted) removeMember(deleted.id);
                      } else {
                          const changed = newData.find(x => !members.includes(x) || members.find(old => old.id === x.id && old !== x));
                          if(changed) saveMember(changed);
                      }
                  }}
                  settings={settings}
                  setSettings={(val) => {
                      const newData = typeof val === 'function' ? val(settings) : val;
                      saveSettingsData(newData);
                  }}
                  dailyReports={dailyReports}
                  setDailyReports={(val) => {
                      const newData = typeof val === 'function' ? val(dailyReports) : val;
                      if(newData.length < dailyReports.length) {
                          const deleted = dailyReports.find(r => !newData.includes(r));
                          if(deleted) removeDailyReport(deleted.id);
                      } else {
                          const changed = newData.find(x => !dailyReports.includes(x) || dailyReports.find(old => old.id === x.id && old !== x));
                          if(changed) saveDailyReport(changed);
                      }
                  }}
                  reports={reports} 
                  distinguished={distinguished}
                  setDistinguished={(val) => {
                      const newData = typeof val === 'function' ? val(distinguished) : val;
                      if(newData.length < distinguished.length) {
                          const deleted = distinguished.find(d => !newData.includes(d));
                          if(deleted) removeDistinguished(deleted.id);
                      } else {
                          const changed = newData.find(x => !distinguished.includes(x) || distinguished.find(old => old.id === x.id && old !== x));
                          if(changed) saveDistinguished(changed);
                      }
                  }}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
