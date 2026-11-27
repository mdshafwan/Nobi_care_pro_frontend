import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  X, 
  Edit3, 
  Receipt,
  Key
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const INITIAL_ADMIN_USERS = [
  {
    name: 'System Administrator',
    email: 'admin@nobicare.org',
    role: 'admin',
    spec: 'Multi-Tenant Root Control',
    id: 'ADM-0001',
    status: 'Active',
    scans: 512,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Dr. Safan, MD',
    email: 'doctor@nobicare.org',
    role: 'doctor',
    spec: 'Internal Medicine & AI Triage',
    id: 'DOC-8821',
    status: 'Active',
    scans: 142,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Nurse Clara Oswald, RN',
    email: 'clara@nobicare.org',
    role: 'doctor',
    spec: 'Emergency & Critical Care',
    id: 'DOC-3021',
    status: 'Active',
    scans: 87,
    avatar: 'https://images.unsplash.com/photo-1594824813511-14c11b1c6742?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Dr. Elena Rostova',
    email: 'elena@nobicare.org',
    role: 'doctor',
    spec: 'Cardiology',
    id: 'DOC-4192',
    status: 'Active',
    scans: 98,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Dr. Marcus Vance',
    email: 'marcus@nobicare.org',
    role: 'doctor',
    spec: 'Hematology & Pathology',
    id: 'DOC-5011',
    status: 'Active',
    scans: 114,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Safan Patient',
    email: 'safan@patient.org',
    role: 'patient',
    spec: 'Dengue / Lipid Monitoring',
    id: 'PAT-1001',
    status: 'Active',
    scans: 6,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Johnathan Doe',
    email: 'jdoe@patient.org',
    role: 'patient',
    spec: 'Cardiac Triage',
    id: 'PAT-1089',
    status: 'Active',
    scans: 9,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    name: 'Priya Nair',
    email: 'priya@patient.org',
    role: 'patient',
    spec: 'Anemia Care Plan',
    id: 'PAT-1104',
    status: 'Active',
    scans: 4,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80'
  }
];

export default function AdminAnalyticsPage() {
  const [usersList, setUsersList] = useState(INITIAL_ADMIN_USERS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'doctor' | 'patient'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('doctor');

  // Toast state
  const [toast, setToast] = useState(null);

  // Chart refs
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const doughnutChartInstance = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Setup Charts
  useEffect(() => {
    // 1. Bar Chart (AI Utilization)
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();

      const ctxBar = barChartRef.current.getContext('2d');
      barChartInstance.current = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Symptom Checks',
              data: [420, 680, 950, 1420, 2150, 3420],
              backgroundColor: '#dc2626',
              borderRadius: 6,
            },
            {
              label: 'OCR Lab Reports Parsed',
              data: [180, 310, 490, 780, 1120, 1640],
              backgroundColor: '#2563eb',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                padding: 12,
                usePointStyle: true,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
            },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
            },
          },
        },
      });
    }

    // 2. Doughnut Chart (AI Concordance)
    if (doughnutChartRef.current) {
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();

      const ctxPie = doughnutChartRef.current.getContext('2d');
      doughnutChartInstance.current = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: ['Full Agreement (96.8%)', 'Clinical Adjusted (2.4%)', 'Rejected (0.8%)'],
          datasets: [
            {
              data: [1372, 34, 12],
              backgroundColor: ['#10b981', '#f59e0b', '#dc2626'],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                padding: 10,
                usePointStyle: true,
              },
            },
          },
        },
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
    };
  }, []);

  // Filter Users
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = activeFilter === 'all' || u.role === activeFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.spec.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  // Toggle user status (Active / Suspended)
  const toggleUserStatus = (uid) => {
    setUsersList((prev) =>
      prev.map((user) => {
        if (user.id === uid) {
          const updatedStatus = user.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`Account ${user.id} status changed to ${updatedStatus}`);
          return { ...user, status: updatedStatus };
        }
        return user;
      })
    );
  };

  // Handle New User Provision
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;

    const prefix = newUserRole === 'doctor' ? 'DOC-' : newUserRole === 'admin' ? 'ADM-' : 'PAT-';
    const newId = prefix + Math.floor(1000 + Math.random() * 9000);

    const defaultRoleSpec = {
      doctor: 'Clinical Staff (Doctor / Nurse) • Pending Setup',
      patient: 'General Health Profile • Pending Setup',
      admin: 'Hospital Operations Administrator'
    };

    const newUser = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      spec: defaultRoleSpec[newUserRole] || 'Pending Setup',
      id: newId,
      status: 'Active',
      scans: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80'
    };

    setUsersList((prev) => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    showToast(`Provisioned ${newUserRole.toUpperCase()} credentials for ${newUserName}! Initial password assigned.`);
  };

  // Counts
  const clinicalCount = usersList.filter((u) => u.role === 'doctor').length;
  const patCount = usersList.filter((u) => u.role === 'patient').length + 1410;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 custom-scrollbar space-y-6 bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-bounce">
          <div
            className={`${
              toast.type === 'danger'
                ? 'bg-red-600'
                : toast.type === 'info'
                ? 'bg-slate-900'
                : 'bg-emerald-600'
            } text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 pointer-events-auto`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
            Hospital Operations & Intelligence
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Hospital Analytics & User Provisioning
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time throughput analytics, clinical AI accuracy monitoring, and credential management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin-ledger"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Financial Entry</span>
          </Link>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Clinical Staff</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{clinicalCount}</div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Doctors & Nurses</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-extrabold text-sm">
            MD/RN
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Registered Patients</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{patCount.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">+18.4% this month</span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-extrabold text-sm">
            PT
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Symptom & OCR Checks</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">3,420</div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">384 checks today</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-extrabold text-sm">
            AI
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Emergency Escalations</span>
            <div className="text-3xl font-extrabold text-red-600 mt-1">12</div>
            <span className="text-[11px] text-red-600 font-bold mt-1 block">100% Triaged &lt; 2m</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-extrabold text-sm">
            ER
          </div>
        </div>
      </div>

      {/* Admin Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital AI Utilization & Patient Growth</h3>
              <p className="text-xs text-slate-400">Monthly Symptom Checks vs OCR Lab Reports Parsed</p>
            </div>
          </div>
          <div className="h-64 relative">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">AI Diagnostic Concordance</h3>
          <p className="text-xs text-slate-400 mb-4">Clinical staff sign-off agreement rates</p>
          <div className="h-64 relative">
            <canvas ref={doughnutChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* User Management Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Multi-Tenant User Directory</h3>
            <p className="text-xs text-slate-500">Filter users, edit accounts directly, or provision credentials</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, email..."
                className="pl-8 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-red-600 transition"
              />
            </div>

            {/* Filter Tabs (Strict 3-Role View) */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('doctor')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'doctor'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clinical (Doctors / Nurses)
              </button>
              <button
                onClick={() => setActiveFilter('patient')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'patient'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patients
              </button>
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition cursor-pointer"
            >
              + Provision User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Role & Specialty</th>
                <th className="p-4">System ID</th>
                <th className="p-4">AI Checks / Activity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No users matched your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={u.avatar} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" alt="Avatar" />
                      <div>
                        <div className="font-extrabold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                          u.role === 'doctor'
                            ? 'bg-blue-100 text-blue-700'
                            : u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role === 'doctor' ? 'CLINICAL' : u.role.toUpperCase()} • {u.spec}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-600">{u.id}</td>
                    <td className="p-4 font-bold text-slate-800">{u.scans} sessions</td>
                    <td className="p-4">
                      <span className={`font-bold ${u.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to="/profile-settings"
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New User Modal (Strictly 3 Core System Roles) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                  Account Provisioning
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">Create User Credentials</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  User will complete their medical / clinical details upon login.
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name / Username</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g., Dr. Aris Thorne or Nurse Clara"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address / Login ID</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g., staff@nobicare.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Set temporary initial password..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:border-red-600 transition cursor-pointer"
                >
                  <option value="doctor">Clinical Staff (Doctor / Nurse)</option>
                  <option value="patient">Patient (Health Member)</option>
                  <option value="admin">Hospital Administrator</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500">
                🔒 Once created, the user logs in with this email & password. They will enter their clinical license or personal medical records directly in their own Profile Settings.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition cursor-pointer"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}