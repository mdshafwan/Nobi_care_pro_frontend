import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  Receipt, 
  UserCog, 
  Activity, 
  FileCheck2, 
  ScanLine, 
  LayoutDashboard, 
  Stethoscope, 
  Bot,
  Plus,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  
  // Safely resolve role (lowercase) with fallback
  const rawRole = user?.role || localStorage.getItem('medmind_role') || 'patient';
  const role = rawRole.toLowerCase();

  // Role-specific navigation links
  const navLinks = {
    patient: [
      { name: 'Health Overview', path: '/patient-overview', icon: LayoutDashboard },
      { name: 'Symptom Checker', path: '/symptom-checker', icon: Stethoscope },
      { name: 'AI Clinical Assistant', path: '/ai-assistant', icon: Bot },
      { name: 'Lab Diagnostics OCR', path: '/lab-ocr', icon: ScanLine },
      { name: 'Settings & Profile', path: '/profile-settings', icon: UserCog },
    ],
    doctor: [
      { name: 'Emergency Triage', path: '/doctor-triage', icon: Activity },
      { name: 'AI Approvals (E-Rx)', path: '/doctor-approvals', icon: FileCheck2 },
      { name: 'Settings & Profile', path: '/profile-settings', icon: UserCog },
    ],
    admin: [
      { name: 'Hospital Analytics', path: '/admin-analytics', icon: BarChart3 },
      { name: 'Financial Ledger', path: '/admin-ledger', icon: Receipt },
      { name: 'System Masters', path: '/admin-masters', icon: Layers },
      { name: 'Settings & Profile', path: '/profile-settings', icon: UserCog },
    ]
  };

  const activeLinks = navLinks[role] || navLinks.patient;

  return (
    <aside className="w-72 my-4 ml-4 bg-[#0c1a30] text-slate-300 flex flex-col justify-between flex-shrink-0 rounded-[30px] border border-blue-900/30 shadow-2xl z-20 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none">
      <div>
        {/* Expanded Branding Header */}
        <div className="h-24 flex items-center px-7 gap-4 border-b border-blue-900/40">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/30 font-bold flex-shrink-0">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
              Nobi Care <span className="text-red-500 font-extrabold">Pro</span>
            </h1>
            <p className="text-[11px] text-blue-300/70 uppercase tracking-widest font-bold mt-0.5">
              Agentic Clinical AI
            </p>
          </div>
        </div>

        {/* Active Workspace Status Tag */}
        <div className="px-7 py-3.5 bg-blue-950/40 border-b border-blue-900/30 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-300/70 uppercase tracking-wider">
            Workspace
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {role.toUpperCase()}
          </span>
        </div>

        {/* Spacious Navigation Items */}
        <nav className="px-4 py-6 space-y-2">
          <div className="px-3 pb-2 text-[11px] font-extrabold text-blue-300/50 uppercase tracking-widest">
            {role === 'admin' ? 'Administration' : role === 'doctor' ? 'Clinical Workspace' : 'Patient Portal'}
          </div>

          {activeLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06] font-semibold'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Spacious User Footer Profile Card */}
      <div className="p-4 m-3 rounded-2xl bg-blue-950/50 border border-blue-900/40">
        <div className="flex items-center gap-3.5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80'}
            alt="Avatar"
            className="w-11 h-11 rounded-full border border-blue-800/60 object-cover flex-shrink-0 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {user?.name || user?.full_name || 'User'}
            </p>
            <p className="text-xs text-blue-300/70 font-semibold truncate mt-0.5 tracking-tight">
              {user?.badge || user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}