import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  CreditCard, 
  Plus, 
  Trash2, 
  Bed, 
  Landmark, 
  Wallet, 
  Layers, 
  CheckCircle2, 
  X, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// --- DEFAULT INITIAL MASTER DATA ---
const INITIAL_PAYMENT_METHODS = [
  { id: 'PM-1', name: 'Credit Card', code: 'CC', active: true },
  { id: 'PM-2', name: 'Bank Transfer (NEFT/RTGS)', code: 'BANK', active: true },
  { id: 'PM-3', name: 'Digital / UPI / Online', code: 'UPI', active: true },
  { id: 'PM-4', name: 'Cash Counter', code: 'CASH', active: true }
];

const INITIAL_PAYMENT_TYPES = [
  { id: 'PT-1', methodId: 'PM-1', name: 'Axis Bank Credit Card Terminal', accountNo: 'TERM-AXIS-091', active: true },
  { id: 'PT-2', methodId: 'PM-1', name: 'HDFC Corporate Visa Card', accountNo: 'TERM-HDFC-441', active: true },
  { id: 'PT-3', methodId: 'PM-2', name: 'HDFC Hospital Operating A/C', accountNo: 'AC-50200019284', active: true },
  { id: 'PT-4', methodId: 'PM-2', name: 'SBI Medical Treasury A/C', accountNo: 'AC-30918290192', active: true },
  { id: 'PT-5', methodId: 'PM-3', name: 'Stripe Global Healthcare Gateway', accountNo: 'STRIPE-LIVE-INT', active: true },
  { id: 'PT-6', methodId: 'PM-3', name: 'Hospital UPI (GPay/PhonePe)', accountNo: 'nobicare@hdfcbank', active: true },
  { id: 'PT-7', methodId: 'PM-4', name: 'Emergency Triage Cash Desk', accountNo: 'DRAWER-ED-01', active: true }
];

const INITIAL_WARDS = [
  { id: 'W-1', name: 'Cardiology Intensive Care (ICU)', department: 'Cardiology', floor: '3rd Floor - Wing A', ratePerDay: 450 },
  { id: 'W-2', name: 'Emergency Trauma & Rapid Bay', department: 'Emergency Medicine', floor: 'Ground Floor', ratePerDay: 300 },
  { id: 'W-3', name: 'General Medical Inpatient Ward', department: 'Internal Medicine', floor: '2nd Floor - Wing B', ratePerDay: 150 },
  { id: 'W-4', name: 'Pediatric Care Unit', department: 'Pediatrics', floor: '4th Floor - Wing C', ratePerDay: 200 }
];

const INITIAL_BEDS = [
  { id: 'BED-101', wardId: 'W-1', roomNo: 'Room 301', bedNo: 'Bed 301-A', status: 'Occupied', patientName: 'Eleanor Vance', mrn: 'MRN-884920' },
  { id: 'BED-102', wardId: 'W-1', roomNo: 'Room 301', bedNo: 'Bed 301-B', status: 'Available', patientName: null, mrn: null },
  { id: 'BED-103', wardId: 'W-1', roomNo: 'Room 302', bedNo: 'Bed 302-A', status: 'Available', patientName: null, mrn: null },
  { id: 'BED-201', wardId: 'W-2', roomNo: 'Bay 1', bedNo: 'Bed ED-01 (Trauma)', status: 'Occupied', patientName: 'Marcus Brody', mrn: 'MRN-339102' },
  { id: 'BED-202', wardId: 'W-2', roomNo: 'Bay 2', bedNo: 'Bed ED-02 (Rapid)', status: 'Available', patientName: null, mrn: null },
  { id: 'BED-203', wardId: 'W-2', roomNo: 'Bay 3', bedNo: 'Bed ED-03 (Cardiac)', status: 'Occupied', patientName: 'Sophia Loren', mrn: 'MRN-551094' },
  { id: 'BED-301', wardId: 'W-3', roomNo: 'Room 201', bedNo: 'Bed 201-A', status: 'Available', patientName: null, mrn: null },
  { id: 'BED-302', wardId: 'W-3', roomNo: 'Room 201', bedNo: 'Bed 201-B', status: 'Occupied', patientName: 'David Hemmings', mrn: 'MRN-774102' },
  { id: 'BED-303', wardId: 'W-3', roomNo: 'Room 202', bedNo: 'Bed 202-A', status: 'Available', patientName: null, mrn: null },
  { id: 'BED-401', wardId: 'W-4', roomNo: 'Room 401', bedNo: 'Bed 401-A', status: 'Available', patientName: null, mrn: null }
];

export default function AdminMastersPage() {
  const [activeTab, setActiveTab] = useState('finance'); // 'finance' | 'infrastructure'

  // Master States
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('nobicare_payment_methods');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [paymentTypes, setPaymentTypes] = useState(() => {
    const saved = localStorage.getItem('nobicare_payment_types');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_TYPES;
  });

  const [wards, setWards] = useState(() => {
    const saved = localStorage.getItem('nobicare_wards');
    return saved ? JSON.parse(saved) : INITIAL_WARDS;
  });

  const [beds, setBeds] = useState(() => {
    const saved = localStorage.getItem('nobicare_beds');
    return saved ? JSON.parse(saved) : INITIAL_BEDS;
  });

  // Sync to localStorage so other pages (Ledger, Triage) can consume them
  useEffect(() => {
    localStorage.setItem('nobicare_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('nobicare_payment_types', JSON.stringify(paymentTypes));
  }, [paymentTypes]);

  useEffect(() => {
    localStorage.setItem('nobicare_wards', JSON.stringify(wards));
  }, [wards]);

  useEffect(() => {
    localStorage.setItem('nobicare_beds', JSON.stringify(beds));
  }, [beds]);

  // Modal States
  const [modalType, setModalType] = useState(null); // 'add_method' | 'add_type' | 'add_ward' | 'add_bed'

  // Form Fields
  const [methodName, setMethodName] = useState('');
  const [methodCode, setMethodCode] = useState('');

  const [typeMethodId, setTypeMethodId] = useState(paymentMethods[0]?.id || 'PM-1');
  const [typeName, setTypeName] = useState('');
  const [typeAccountNo, setTypeAccountNo] = useState('');

  const [wardName, setWardName] = useState('');
  const [wardDept, setWardDept] = useState('');
  const [wardFloor, setWardFloor] = useState('');
  const [wardRate, setWardRate] = useState('');

  const [bedWardId, setBedWardId] = useState(wards[0]?.id || 'W-1');
  const [bedRoomNo, setBedRoomNo] = useState('');
  const [bedNo, setBedNo] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Chart References
  const incomeChartRef = useRef(null);
  const expenseChartRef = useRef(null);
  const incomeChartInstance = useRef(null);
  const expenseChartInstance = useRef(null);

  // Initialize Custom Financial Master Breakdown Charts
  useEffect(() => {
    if (activeTab !== 'finance') return;

    if (incomeChartRef.current) {
      if (incomeChartInstance.current) incomeChartInstance.current.destroy();
      const ctx = incomeChartRef.current.getContext('2d');
      incomeChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Axis Bank CC', 'HDFC Visa', 'Stripe Online', 'UPI Gateway', 'Cash Desk'],
          datasets: [
            {
              label: 'Income Received ($ USD)',
              data: [14200, 9800, 18450, 12300, 4800],
              backgroundColor: '#10b981',
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } } }
          }
        }
      });
    }

    if (expenseChartRef.current) {
      if (expenseChartInstance.current) expenseChartInstance.current.destroy();
      const ctx = expenseChartRef.current.getContext('2d');
      expenseChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['HDFC Hospital A/C', 'SBI Medical Treasury', 'Stripe Vendor Fees', 'Direct Cash'],
          datasets: [
            {
              data: [18500, 12400, 3200, 1800],
              backgroundColor: ['#dc2626', '#f59e0b', '#2563eb', '#64748b'],
              borderWidth: 0,
              hoverOffset: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }, usePointStyle: true, pointStyle: 'circle' }
            }
          }
        }
      });
    }

    return () => {
      if (incomeChartInstance.current) incomeChartInstance.current.destroy();
      if (expenseChartInstance.current) expenseChartInstance.current.destroy();
    };
  }, [activeTab]);

  // Handlers for Add
  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    if (!methodName.trim() || !methodCode.trim()) return;
    const newMethod = {
      id: `PM-${Date.now().toString().slice(-4)}`,
      name: methodName.trim(),
      code: methodCode.toUpperCase().trim(),
      active: true
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
    setModalType(null);
    setMethodName('');
    setMethodCode('');
    showToast(`Payment Method "${newMethod.name}" added to master!`);
  };

  const handleAddPaymentType = (e) => {
    e.preventDefault();
    if (!typeName.trim() || !typeAccountNo.trim()) return;
    const newType = {
      id: `PT-${Date.now().toString().slice(-4)}`,
      methodId: typeMethodId,
      name: typeName.trim(),
      accountNo: typeAccountNo.trim(),
      active: true
    };
    setPaymentTypes((prev) => [...prev, newType]);
    setModalType(null);
    setTypeName('');
    setTypeAccountNo('');
    showToast(`Payment Account "${newType.name}" added successfully!`);
  };

  const handleAddWard = (e) => {
    e.preventDefault();
    if (!wardName.trim() || !wardDept.trim()) return;
    const newWard = {
      id: `W-${Date.now().toString().slice(-4)}`,
      name: wardName.trim(),
      department: wardDept.trim(),
      floor: wardFloor.trim() || 'Floor 1',
      ratePerDay: parseFloat(wardRate) || 150
    };
    setWards((prev) => [...prev, newWard]);
    setModalType(null);
    setWardName('');
    setWardDept('');
    setWardFloor('');
    setWardRate('');
    showToast(`Ward "${newWard.name}" created in hospital master!`);
  };

  const handleAddBed = (e) => {
    e.preventDefault();
    if (!bedNo.trim() || !bedRoomNo.trim()) return;
    const newBed = {
      id: `BED-${Date.now().toString().slice(-4)}`,
      wardId: bedWardId,
      roomNo: bedRoomNo.trim(),
      bedNo: bedNo.trim(),
      status: 'Available',
      patientName: null,
      mrn: null
    };
    setBeds((prev) => [...prev, newBed]);
    setModalType(null);
    setBedRoomNo('');
    setBedNo('');
    showToast(`Bed "${newBed.bedNo}" added to ward inventory!`);
  };

  // Calculations for Bed Master
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 custom-scrollbar space-y-6 bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
            Core Configuration Center
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Hospital System Master Modules
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure financial payment channels, accounts, inpatient ward structure, and hospital bed capacity.
          </p>
        </div>

        {/* Master Navigation Switcher */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl text-xs font-bold shadow-inner">
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>I. Financial Master</span>
          </button>
          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'infrastructure'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-red-600" />
            <span>II. Ward & Bed Master</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          MASTER MODULE I: FINANCIAL CHANNELS & ACCOUNTS
         ======================================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Custom Income & Expense by Payment Channel Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Income Distribution by Payment Channel
                  </h3>
                  <p className="text-xs text-slate-400">Total clinical collections across active credit cards & gateways</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  +$59,550 Total
                </span>
              </div>
              <div className="h-56 relative">
                <canvas ref={incomeChartRef}></canvas>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Operational Expense Outflow
                  </h3>
                  <p className="text-xs text-slate-400">Bank accounts debited for supplies & payroll</p>
                </div>
              </div>
              <div className="h-56 relative flex items-center justify-center">
                <canvas ref={expenseChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Financial Master Management Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Payment Methods */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">1. Payment Methods Master</h3>
                  <p className="text-xs text-slate-400">Core payment classifications</p>
                </div>
                <button
                  onClick={() => setModalType('add_method')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Method
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-5">Method Code</th>
                      <th className="p-3.5">Method Name</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paymentMethods.map((pm) => (
                      <tr key={pm.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 pl-5 font-bold text-slate-900">{pm.code}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{pm.name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <button
                            onClick={() => {
                              setPaymentMethods((prev) => prev.filter((m) => m.id !== pm.id));
                              showToast(`Removed method ${pm.name}`);
                            }}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Payment Types / Sub-accounts */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">2. Payment Types & Accounts</h3>
                  <p className="text-xs text-slate-400">Specific bank accounts & merchant terminals</p>
                </div>
                <button
                  onClick={() => setModalType('add_type')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Account
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-5">Account / Terminal Name</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Identifier / A/C No</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paymentTypes.map((pt) => {
                      const parentMethod = paymentMethods.find((m) => m.id === pt.methodId);
                      return (
                        <tr key={pt.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 pl-5 font-bold text-slate-900">{pt.name}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {parentMethod ? parentMethod.code : 'OTHER'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">{pt.accountNo}</td>
                          <td className="p-3.5 text-right pr-5">
                            <button
                              onClick={() => {
                                setPaymentTypes((prev) => prev.filter((t) => t.id !== pt.id));
                                showToast(`Removed account ${pt.name}`);
                              }}
                              className="text-slate-400 hover:text-red-600 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MASTER MODULE II: WARD, ROOM & BED INFRASTRUCTURE
         ======================================================== */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ward & Bed KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Hospital Wards</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{wards.length} Units</div>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Configured Departments</span>
              </div>
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Bed Inventory</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{totalBeds} Beds</div>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 block">{availableBeds} Available</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                <Bed className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Current Inpatients</span>
                <div className="text-3xl font-black text-red-600 mt-1">{occupiedBeds} Occupied</div>
                <span className="text-[11px] text-red-600 font-bold mt-1 block">Active Admitted Cases</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Occupancy Rate</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{occupancyRate}%</div>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Live Hospital Load</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Wards & Beds Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Wards List (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Hospital Wards Master</h3>
                  <p className="text-xs text-slate-400">Wings, departments & tariff</p>
                </div>
                <button
                  onClick={() => setModalType('add_ward')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Ward
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {wards.map((w) => {
                  const wardBeds = beds.filter((b) => b.wardId === w.id);
                  const wardOccupied = wardBeds.filter((b) => b.status === 'Occupied').length;

                  return (
                    <div key={w.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{w.name}</span>
                        <span className="text-[11px] font-bold text-slate-500 font-mono">${w.ratePerDay}/day</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{w.department} • {w.floor}</span>
                        <span className="font-bold text-slate-700">{wardOccupied}/{wardBeds.length} Beds Occupied</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Beds Live Matrix (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Room & Bed Master Matrix</h3>
                  <p className="text-xs text-slate-400">Live bed assignments connected to Doctor Triage</p>
                </div>
                <button
                  onClick={() => setModalType('add_bed')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bed
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-5">Bed & Room</th>
                      <th className="p-3.5">Ward Unit</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Current Patient</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {beds.map((b) => {
                      const ward = wards.find((w) => w.id === b.wardId);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 pl-5">
                            <div className="font-bold text-slate-900">{b.bedNo}</div>
                            <div className="text-[10px] text-slate-400">{b.roomNo}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[11px] font-semibold text-slate-700">{ward?.name || 'General'}</span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                b.status === 'Occupied'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {b.patientName ? (
                              <div>
                                <div className="font-bold text-slate-800">{b.patientName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{b.mrn}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Empty Bay</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right pr-5">
                            <button
                              onClick={() => {
                                setBeds((prev) => prev.filter((item) => item.id !== b.id));
                                showToast(`Bed ${b.bedNo} removed from master inventory`);
                              }}
                              className="text-slate-400 hover:text-red-600 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS FOR ALL 4 SUB-MASTERS
         ======================================================== */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                  Master Configuration
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {modalType === 'add_method' && 'Add Payment Method'}
                  {modalType === 'add_type' && 'Add Bank / Payment Account'}
                  {modalType === 'add_ward' && 'Create Hospital Ward'}
                  {modalType === 'add_bed' && 'Register New Bed Bay'}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form 1: Add Payment Method */}
            {modalType === 'add_method' && (
              <form onSubmit={handleAddPaymentMethod} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method Name</label>
                  <input
                    type="text"
                    required
                    value={methodName}
                    onChange={(e) => setMethodName(e.target.value)}
                    placeholder="e.g., Credit Card or Digital UPI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    value={methodCode}
                    onChange={(e) => setMethodCode(e.target.value)}
                    placeholder="e.g., CC, UPI, BANK"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold uppercase"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition cursor-pointer"
                  >
                    Save Method
                  </button>
                </div>
              </form>
            )}

            {/* Form 2: Add Payment Type */}
            {modalType === 'add_type' && (
              <form onSubmit={handleAddPaymentType} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Payment Method</label>
                  <select
                    value={typeMethodId}
                    onChange={(e) => setTypeMethodId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:border-red-600 transition"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account / Merchant Terminal Name</label>
                  <input
                    type="text"
                    required
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    placeholder="e.g., Axis Bank Credit Card Terminal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Number / Terminal ID</label>
                  <input
                    type="text"
                    required
                    value={typeAccountNo}
                    onChange={(e) => setTypeAccountNo(e.target.value)}
                    placeholder="e.g., AC-50200019284 or POS-09"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-mono"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition cursor-pointer"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            )}

            {/* Form 3: Add Ward */}
            {modalType === 'add_ward' && (
              <form onSubmit={handleAddWard} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ward Name</label>
                  <input
                    type="text"
                    required
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    placeholder="e.g., Cardiology ICU or Maternity Wing"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 transition font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={wardDept}
                      onChange={(e) => setWardDept(e.target.value)}
                      placeholder="e.g., Cardiology"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-red-600 transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor / Wing</label>
                    <input
                      type="text"
                      required
                      value={wardFloor}
                      onChange={(e) => setWardFloor(e.target.value)}
                      placeholder="e.g., 3rd Floor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-red-600 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Tariff ($ USD / day)</label>
                  <input
                    type="number"
                    required
                    value={wardRate}
                    onChange={(e) => setWardRate(e.target.value)}
                    placeholder="e.g., 250"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-red-600 transition font-bold"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition cursor-pointer"
                  >
                    Create Ward
                  </button>
                </div>
              </form>
            )}

            {/* Form 4: Add Bed */}
            {modalType === 'add_bed' && (
              <form onSubmit={handleAddBed} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign to Ward</label>
                  <select
                    value={bedWardId}
                    onChange={(e) => setBedWardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:border-red-600 transition"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Room / Bay No</label>
                    <input
                      type="text"
                      required
                      value={bedRoomNo}
                      onChange={(e) => setBedRoomNo(e.target.value)}
                      placeholder="e.g., Room 301"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-red-600 transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bed Identifier</label>
                    <input
                      type="text"
                      required
                      value={bedNo}
                      onChange={(e) => setBedNo(e.target.value)}
                      placeholder="e.g., Bed 301-A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-red-600 transition font-bold"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition cursor-pointer"
                  >
                    Register Bed
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}