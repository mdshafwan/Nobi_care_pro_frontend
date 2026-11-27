import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, LogOut } from 'lucide-react';

export default function TopHeader({ title, breadcrumbs = [] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    try {
      if (logout) {
        logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    // Clear storage and redirect to login
    localStorage.removeItem('medmind_role');
    localStorage.removeItem('medmind_user');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left: Dynamic Breadcrumb and Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-0.5">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              <span className={idx === breadcrumbs.length - 1 ? 'text-red-600 font-bold' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Clean User Profile & Sign Out */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80'}
            alt={user?.name || 'User Avatar'}
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name || 'System User'}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {user?.role || 'Admin'}
            </p>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs text-slate-500 hover:text-red-600 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Sign Out of session"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}