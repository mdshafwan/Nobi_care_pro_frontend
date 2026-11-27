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

// Default Master Payment Methods
const INITIAL_PAYMENT_METHODS = [
  { id: 'PM-1', name: 'Credit Card / Terminal', code: 'CC', active: true },
  { id: 'PM-2', name: 'Bank Transfer (NEFT/RTGS)', code: 'BANK', active: true },
  { id: 'PM-3', name: 'Digital / UPI Gateway', code: 'UPI', active: true },
  { id: 'PM-4', name: 'Cash Counter / Desk', code: 'CASH', active: true }
];

// Default Payment Sub-Accounts / Merchant Terminals
const INITIAL_PAYMENT_TYPES = [
  { id: 'PT-1', methodId: 'PM-1', name: 'Axis Bank Credit Card Terminal', accountNo: 'TERM-AXIS-091', active: true },
  { id: 'PT-2', methodId: 'PM-1', name: 'HDFC Corporate Visa Terminal', accountNo: 'TERM-HDFC-441', active: true },
  { id: 'PT-3', methodId: 'PM-2', name: 'HDFC Hospital Operating A/C', accountNo: 'AC-50200019284', active: true },
  { id: 'PT-4', methodId: 'PM-2', name: 'SBI Medical Treasury A/C', accountNo: 'AC-30918290192', active: true },
  { id: 'PT-5', methodId: 'PM-3', name: 'Stripe Healthcare Gateway', accountNo: 'STRIPE-LIVE-INT', active: true },
  { id: 'PT-6', methodId: 'PM-3', name: 'Hospital Quick-UPI Desk', accountNo: 'nobicare@hdfcbank', active: true },
  { id: 'PT-7', methodId: 'PM-4', name: 'Emergency Triage Cash Desk', accountNo: 'DRAWER-ED-01', active: true }
];

// Standardized Ward Inventory Contract (Compatible with Doctor Triage)
const INITIAL_WARD_MASTER = [
  { 
    id: 'W-1', 
    name: 'Cardiology Intensive Care (ICU)', 
    department: 'Cardiology', 
    floor: '3rd Floor - Wing A', 
    tariff: 450,
    ratePerDay: 450,
    beds: [
      { id: 'BED-101', roomNo: 'Room 301', bedNo: 'Bed 301-A', status: 'Occupied', patient: 'Eleanor Vance', mrn: 'MRN-884920' },
      { id: 'BED-102', roomNo: 'Room 301', bedNo: 'Bed 301-B', status: 'Available', patient: null, mrn: null },
      { id: 'BED-103', roomNo: 'Room 302', bedNo: 'Bed 302-A', status: 'Available', patient: null, mrn: null }
    ]
  },
  { 
    id: 'W-2', 
    name: 'Emergency Trauma & Rapid Bay', 
    department: 'Emergency Medicine', 
    floor: 'Ground Floor', 
    tariff: 300,
    ratePerDay: 300,
    beds: [
      { id: 'BED-201', roomNo: 'Bay 1', bedNo: 'Bed ED-01 (Trauma)', status: 'Occupied', patient: 'Marcus Brody', mrn: 'MRN-339102' },
      { id: 'BED-202', roomNo: 'Bay 2', bedNo: 'Bed ED-02 (Rapid)', status: 'Available', patient: null, mrn: null },
      { id: 'BED-203', roomNo: 'Bay 3', bedNo: 'Bed ED-03 (Cardiac)', status: 'Occupied', patient: 'Sophia Loren', mrn: 'MRN-551094' }
    ]
  },
  { 
    id: 'W-3', 
    name: 'General Medical Inpatient Ward', 
    department: 'Internal Medicine', 
    floor: '2nd Floor - Wing B', 
    tariff: 150,
    ratePerDay: 150,
    beds: [
      { id: 'BED-301', roomNo: 'Room 201', bedNo: 'Bed 201-A', status: 'Available', patient: null, mrn: null },
      { id: 'BED-302', roomNo: 'Room 201', bedNo: 'Bed 201-B', status: 'Occupied', patient: 'David Hemmings', mrn: 'MRN-774102' },
      { id: 'BED-303', roomNo: 'Room 202', bedNo: 'Bed 202-A', status: 'Available', patient: null, mrn: null }
    ]
  },
  { 
    id: 'W-4', 
    name: 'Pediatric Care Unit', 
    department: 'Pediatrics', 
    floor: '4th Floor - Wing C', 
    tariff: 200,
    ratePerDay: 200,
    beds: [
      { id: 'BED-401', roomNo: 'Room 401', bedNo: 'Bed 401-A', status: 'Available', patient: null, mrn: null }
    ]
  }
];

export default function AdminMastersPage() {
  const [activeTab, setActiveTab] = useState('finance'); // 'finance' | 'infrastructure'

  // Master State synchronized with standard localStorage keys
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('hospital_payment_methods');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [paymentTypes, setPaymentTypes] = useState(() => {
    const saved = localStorage.getItem('hospital_payment_types');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_TYPES;
  });

  const [wardMaster, setWardMaster] = useState(() => {
    const saved = localStorage.getItem('hospital_ward_master');
    return saved ? JSON.parse(saved) : INITIAL_WARD_MASTER;
  });

  // Keep localStorage continuously synchronized
  useEffect(() => {
    localStorage.setItem('hospital_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('hospital_payment_types', JSON.stringify(paymentTypes));
  }, [paymentTypes]);

  useEffect(() => {
    localStorage.setItem('hospital_ward_master', JSON.stringify(wardMaster));
  }, [wardMaster]);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'add_method' | 'add_type' | 'add_ward' | 'add_bed'

  // Form Fields
  const [methodName, setMethodName] = useState('');
  const [methodCode, setMethodCode] = useState('');

  const [typeMethodId, setTypeMethodId] = useState('');
  const [typeName, setTypeName] = useState('');
  const [typeAccountNo, setTypeAccountNo] = useState('');

  const [wardName, setWardName] = useState('');
  const [wardDept, setWardDept] = useState('');
  const [wardFloor, setWardFloor] = useState('');
  const [wardRate, setWardRate] = useState('');

  const [bedWardId, setBedWardId] = useState('');
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

  // Read transactions from Ledger to dynamically power Finance Tab Charts
  useEffect(() => {
    if (activeTab !== 'finance') return;

    const rawTransactions = localStorage.getItem('hospital_ledger_transactions');
    const transactions = rawTransactions ? JSON.parse(rawTransactions) : [];

    // Aggregate Income by Payment Account
    const incomeByAccount = {};
    const expenseByAccount = {};

    paymentTypes.forEach((pt) => {
      incomeByAccount[pt.name] = 0;
      expenseByAccount[pt.name] = 0;
    });

    transactions.forEach((t) => {
      const accName = t.accountName || 'General Operating';
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        incomeByAccount[accName] = (incomeByAccount[accName] || 0) + amt;
      } else {
        expenseByAccount[accName] = (expenseByAccount[accName] || 0) + amt;
      }
    });

    // Provide sensible defaults if ledger transactions are fresh
    const allIncomeKeys = Object.keys(incomeByAccount);
    const incomeLabels = allIncomeKeys.length > 0 ? allIncomeKeys : ['Axis Bank CC', 'HDFC Visa', 'HDFC Operating', 'SBI Treasury', 'Stripe'];
    const incomeData = incomeLabels.map(lbl => (incomeByAccount[lbl] && incomeByAccount[lbl] > 0) ? incomeByAccount[lbl] : Math.floor(Math.random() * 8000 + 3000));

    const allExpenseKeys = Object.keys(expenseByAccount);
    const expenseLabels = allExpenseKeys.length > 0 ? allExpenseKeys : ['HDFC Operating A/C', 'SBI Medical Treasury', 'Stripe Gateway', 'Direct Cash'];
    const expenseData = expenseLabels.map(lbl => (expenseByAccount[lbl] && expenseByAccount[lbl] > 0) ? expenseByAccount[lbl] : Math.floor(Math.random() * 6000 + 2000));

    // 1. Horizontal Bar Chart (Cannot Collapse even with 20+ accounts!)
    if (incomeChartRef.current) {
      if (incomeChartInstance.current) incomeChartInstance.current.destroy();
      const ctx = incomeChartRef.current.getContext('2d');
      incomeChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: incomeLabels,
          datasets: [{
            label: 'Collections ($ USD)',
            data: incomeData,
            backgroundColor: '#10b981',
            borderRadius: 6,
            maxBarThickness: 16
          }]
        },
        options: {
          indexAxis: 'y', // <--- Horizontal layout solves label collapse!
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Total: $${Number(context.parsed.x).toLocaleString()}`
              }
            }
          },
          scales: {
            x: { 
              grid: { color: '#f1f5f9' }, 
              ticks: { 
                font: { family: 'Plus Jakarta Sans', size: 10 },
                callback: (val) => `$${val >= 1000 ? `${val / 1000}k` : val}`
              } 
            },
            y: { 
              grid: { display: false }, 
              ticks: { 
                font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
                color: '#334155'
              } 
            }
          }
        }
      });
    }

    // 2. Balanced Doughnut Chart with Right-Aligned Legend
    if (expenseChartRef.current) {
      if (expenseChartInstance.current) expenseChartInstance.current.destroy();
      const ctx = expenseChartRef.current.getContext('2d');
      expenseChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: expenseLabels,
          datasets: [{
            data: expenseData,
            backgroundColor: ['#dc2626', '#f59e0b', '#2563eb', '#10b981', '#64748b', '#8b5cf6'],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'right', // <--- Right alignment prevents doughnut compression!
              labels: { 
                font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }, 
                usePointStyle: true, 
                pointStyle: 'circle',
                boxWidth: 8,
                padding: 10
              } 
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: $${Number(context.parsed).toLocaleString()}`
              }
            }
          }
        }
      });
    }

    return () => {
      if (incomeChartInstance.current) incomeChartInstance.current.destroy();
      if (expenseChartInstance.current) expenseChartInstance.current.destroy();
    };
  }, [activeTab, paymentTypes]);

  // Master Actions: Methods & Accounts
  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    if (!methodName.trim() || !methodCode.trim()) return;
    const newMethod = {
      id: `PM-${Date.now().toString().slice(-4)}`,
      name: methodName.trim(),
      code: methodCode.toUpperCase().trim(),
      active: true
    };
    setPaymentMethods(prev => [...prev, newMethod]);
    setModalType(null);
    setMethodName('');
    setMethodCode('');
    showToast(`Payment Method "${newMethod.name}" registered in master!`);
  };

  const handleAddPaymentType = (e) => {
    e.preventDefault();
    if (!typeName.trim() || !typeAccountNo.trim()) return;
    const selectedMethodId = typeMethodId || paymentMethods[0]?.id;
    const newType = {
      id: `PT-${Date.now().toString().slice(-4)}`,
      methodId: selectedMethodId,
      name: typeName.trim(),
      accountNo: typeAccountNo.trim(),
      active: true
    };
    setPaymentTypes(prev => [...prev, newType]);
    setModalType(null);
    setTypeName('');
    setTypeAccountNo('');
    showToast(`Payment Account "${newType.name}" added to Ledger master!`);
  };

  // Master Actions: Wards & Beds
  const handleAddWard = (e) => {
    e.preventDefault();
    if (!wardName.trim() || !wardDept.trim()) return;
    const rate = parseFloat(wardRate) || 150;
    const newWard = {
      id: `W-${Date.now().toString().slice(-4)}`,
      name: wardName.trim(),
      department: wardDept.trim(),
      floor: wardFloor.trim() || 'Floor 1',
      tariff: rate,
      ratePerDay: rate,
      beds: []
    };
    setWardMaster(prev => [...prev, newWard]);
    setModalType(null);
    setWardName('');
    setWardDept('');
    setWardFloor('');
    setWardRate('');
    showToast(`Hospital Ward "${newWard.name}" created at $${rate}/day!`);
  };

  const handleAddBed = (e) => {
    e.preventDefault();
    if (!bedNo.trim() || !bedRoomNo.trim()) return;
    const targetWardId = bedWardId || wardMaster[0]?.id;
    const newBed = {
      id: `BED-${Date.now().toString().slice(-4)}`,
      roomNo: bedRoomNo.trim(),
      bedNo: bedNo.trim(),
      status: 'Available',
      patient: null,
      mrn: null
    };

    setWardMaster(prev => prev.map(ward => {
      if (ward.id === targetWardId) {
        return {
          ...ward,
          beds: [...(ward.beds || []), newBed]
        };
      }
      return ward;
    }));

    setModalType(null);
    setBedRoomNo('');
    setBedNo('');
    showToast(`Bed "${newBed.bedNo}" added to ward inventory!`);
  };

  // Delete Bed Bay
  const handleDeleteBed = (wardId, bedId, bedNoText) => {
    setWardMaster(prev => prev.map(w => {
      if (w.id === wardId) {
        return { ...w, beds: (w.beds || []).filter(b => b.id !== bedId) };
      }
      return w;
    }));
    showToast(`Bed ${bedNoText} decommissioned.`);
  };

  // Infrastructure Calculations
  const flattenedBeds = wardMaster.flatMap(w => (w.beds || []).map(b => ({ ...b, wardId: w.id, wardName: w.name })));
  const totalBeds = flattenedBeds.length;
  const occupiedBeds = flattenedBeds.filter(b => b.status === 'Occupied').length;
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
            System Configuration Matrix
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Hospital Masters & Bed Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage financial ledger settlement channels, department structures, and inpatient room tariffs.
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

      {/* ==================== MODULE I: FINANCIAL MASTER ==================== */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Horizontal Bar Chart (Resilient to any number of accounts) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Income Distribution by Payment Channel
                  </h3>
                  <p className="text-xs text-slate-400">Total ledger receipts distributed across active channels</p>
                </div>
              </div>
              <div className="h-64 relative w-full">
                <canvas ref={incomeChartRef}></canvas>
              </div>
            </div>

            {/* Doughnut Chart with Right Legend (Never squashes into an oval) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Operational Expense Outflow
                  </h3>
                  <p className="text-xs text-slate-400">Settlement accounts debited for supplies & payroll</p>
                </div>
              </div>
              <div className="h-64 relative flex items-center justify-center w-full">
                <canvas ref={expenseChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Master */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">1. Payment Methods Master</h3>
                  <p className="text-xs text-slate-400">Classifications for patient invoices & billing desk</p>
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
                      <th className="p-3.5 pl-5">Code</th>
                      <th className="p-3.5">Method Classification</th>
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
                              setPaymentMethods(prev => prev.filter(m => m.id !== pm.id));
                              showToast(`Removed method ${pm.name}`);
                            }}
                            className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
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

            {/* Payment Types / Sub-accounts */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">2. Ledger Accounts & Terminals</h3>
                  <p className="text-xs text-slate-400">Available accounts linked to Ledger Entries</p>
                </div>
                <button
                  onClick={() => {
                    setTypeMethodId(paymentMethods[0]?.id || '');
                    setModalType('add_type');
                  }}
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
                      <th className="p-3.5">Account / Terminal ID</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paymentTypes.map((pt) => {
                      const parentMethod = paymentMethods.find(m => m.id === pt.methodId);
                      return (
                        <tr key={pt.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 pl-5 font-bold text-slate-900">{pt.name}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {parentMethod ? parentMethod.code : 'GATEWAY'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">{pt.accountNo}</td>
                          <td className="p-3.5 text-right pr-5">
                            <button
                              onClick={() => {
                                setPaymentTypes(prev => prev.filter(t => t.id !== pt.id));
                                showToast(`Removed account ${pt.name}`);
                              }}
                              className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
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

      {/* ==================== MODULE II: WARD & BED MASTER ==================== */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Hospital Wards</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{wardMaster.length} Units</div>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Active Clinical Wings</span>
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
                <span className="text-[11px] text-red-600 font-bold mt-1 block">Triage Assigned Beds</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Wards Master with Tariff */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Hospital Wards Master</h3>
                  <p className="text-xs text-slate-400">Department tariffs tied directly to Ledger billing</p>
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
                {wardMaster.map((w) => {
                  const bCount = (w.beds || []).length;
                  const occCount = (w.beds || []).filter(b => b.status === 'Occupied').length;
                  return (
                    <div key={w.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{w.name}</span>
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          ${w.tariff || w.ratePerDay}/day
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{w.department} • {w.floor}</span>
                        <span className="font-bold text-slate-700">{occCount}/{bCount} Beds Occupied</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Beds Matrix */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Room & Bed Master Matrix</h3>
                  <p className="text-xs text-slate-400">Live bed assignments connected with Doctor Triage</p>
                </div>
                <button
                  onClick={() => {
                    setBedWardId(wardMaster[0]?.id || '');
                    setModalType('add_bed');
                  }}
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
                    {flattenedBeds.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-slate-900">{b.bedNo}</div>
                          <div className="text-[10px] text-slate-400">{b.roomNo}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{b.wardName}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            b.status === 'Occupied'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {b.patient || b.patientName ? (
                            <div>
                              <div className="font-bold text-slate-800">{b.patient || b.patientName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{b.mrn || 'ER Admission'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Empty Bay</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <button
                            onClick={() => handleDeleteBed(b.wardId, b.id, b.bedNo)}
                            className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}
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
                  {modalType === 'add_type' && 'Add Ledger Account / Terminal'}
                  {modalType === 'add_ward' && 'Create Hospital Ward & Tariff'}
                  {modalType === 'add_bed' && 'Register Bed Bay to Matrix'}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal: Add Payment Method */}
            {modalType === 'add_method' && (
              <form onSubmit={handleAddPaymentMethod} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Method Name</label>
                  <input
                    type="text"
                    required
                    value={methodName}
                    onChange={(e) => setMethodName(e.target.value)}
                    placeholder="e.g., Insurance TPA Direct Settlement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    value={methodCode}
                    onChange={(e) => setMethodCode(e.target.value)}
                    placeholder="e.g., TPA, CASH, UPI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600 font-semibold uppercase"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                  >
                    Save Method
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Add Payment Account */}
            {modalType === 'add_type' && (
              <form onSubmit={handleAddPaymentType} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Method</label>
                  <select
                    value={typeMethodId}
                    onChange={(e) => setTypeMethodId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:border-red-600"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
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
                    placeholder="e.g., Emergency Cash Desk Drawer 2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account No / Terminal ID</label>
                  <input
                    type="text"
                    required
                    value={typeAccountNo}
                    onChange={(e) => setTypeAccountNo(e.target.value)}
                    placeholder="e.g., AC-99102481 or POS-04"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Add Ward */}
            {modalType === 'add_ward' && (
              <form onSubmit={handleAddWard} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ward Name</label>
                  <input
                    type="text"
                    required
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    placeholder="e.g., Neurology High Dependency Unit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
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
                      placeholder="e.g., Neurology"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor / Wing</label>
                    <input
                      type="text"
                      required
                      value={wardFloor}
                      onChange={(e) => setWardFloor(e.target.value)}
                      placeholder="e.g., 5th Floor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
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
                    placeholder="e.g., 350"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                  >
                    Create Ward
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Add Bed */}
            {modalType === 'add_bed' && (
              <form onSubmit={handleAddBed} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign to Ward</label>
                  <select
                    value={bedWardId}
                    onChange={(e) => setBedWardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    {wardMaster.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} (${w.tariff || w.ratePerDay}/day)</option>
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
                      placeholder="e.g., Room 502"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bed Identifier</label>
                    <input
                      type="text"
                      required
                      value={bedNo}
                      onChange={(e) => setBedNo(e.target.value)}
                      placeholder="e.g., Bed 502-A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
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