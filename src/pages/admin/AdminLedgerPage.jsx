import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  Plus, 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Calendar,
  Building2,
  BedDouble
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const INITIAL_TRANSACTIONS = [
  { id: 1, date: '2025-02-23', desc: 'Patient Consultation & CBC Triage', type: 'income', accountName: 'Axis Bank Credit Card Terminal', amount: 150.00 },
  { id: 2, date: '2025-02-23', desc: 'Emergency Trauma Care & Bed Tariff Settlement', type: 'income', accountName: 'Emergency Triage Cash Desk', amount: 650.00 },
  { id: 3, date: '2025-02-22', desc: 'MRI Machine Cryocooler Maintenance', type: 'expense', accountName: 'HDFC Hospital Operating A/C', amount: 1200.00 },
  { id: 4, date: '2025-02-22', desc: 'Automated Hematology Lab Reagents', type: 'expense', accountName: 'SBI Medical Treasury A/C', amount: 450.50 },
  { id: 5, date: '2025-02-21', desc: 'Cardiology Telemetry & Lipid Panel Batch', type: 'income', accountName: 'Stripe Healthcare Gateway', amount: 800.00 },
  { id: 6, date: '2025-02-20', desc: 'Attending Physician On-Call Roster Stipend', type: 'expense', accountName: 'HDFC Hospital Operating A/C', amount: 2800.00 }
];

export default function AdminLedgerPage() {
  // 1. Transactions state linked to localStorage
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('hospital_ledger_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // 2. Read Payment Accounts from System Masters
  const [paymentAccounts, setPaymentAccounts] = useState(() => {
    const saved = localStorage.getItem('hospital_payment_types');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Read Ward Master to compute Inpatient Bed Tariffs & Capacity
  const [wardMaster, setWardMaster] = useState(() => {
    const saved = localStorage.getItem('hospital_ward_master');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transType, setTransType] = useState('income');
  const [transDesc, setTransDesc] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transAccount, setTransAccount] = useState('');

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Chart Ref
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Sync transactions to localStorage on update
  useEffect(() => {
    localStorage.setItem('hospital_ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Keep Masters data synchronized across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAccounts = localStorage.getItem('hospital_payment_types');
      if (savedAccounts) setPaymentAccounts(JSON.parse(savedAccounts));

      const savedWards = localStorage.getItem('hospital_ward_master');
      if (savedWards) setWardMaster(JSON.parse(savedWards));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // --- Dynamic Room & Bed Tariff Calculations Connected to Masters ---
  let dailyRoomRevenuePotential = 0;
  let activeInpatientRoomAccruals = 0;
  let totalOccupiedBeds = 0;

  wardMaster.forEach((ward) => {
    const tariff = Number(ward.tariff || ward.ratePerDay) || 0;
    const beds = ward.beds || [];
    const occupied = beds.filter(b => b.status === 'Occupied').length;
    
    dailyRoomRevenuePotential += (beds.length * tariff);
    activeInpatientRoomAccruals += (occupied * tariff);
    totalOccupiedBeds += occupied;
  });

  // --- Financial Calculations ---
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // --- Chart Sync ---
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Revenue', 'Operational Cost'],
        datasets: [
          {
            data: [totalIncome, totalExpense],
            backgroundColor: ['#10b981', '#dc2626'],
            hoverBackgroundColor: ['#059669', '#b91c1c'],
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 11 },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return ` ${label}: ${formatCurrency(value)}`;
              }
            }
          }
        },
        cutout: '72%'
      }
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [totalIncome, totalExpense]);

  // --- Record New Transaction ---
  const handleSaveTransaction = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(transAmount);

    if (!transDesc.trim() || isNaN(amountNum) || amountNum <= 0) {
      showToast('Please provide a valid description and amount.', 'danger');
      return;
    }

    const defaultAcc = paymentAccounts[0]?.name || 'Hospital Operating Account';
    const newTrans = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      desc: transDesc.trim(),
      type: transType,
      accountName: transAccount || defaultAcc,
      amount: amountNum
    };

    setTransactions((prev) => [newTrans, ...prev]);
    setIsModalOpen(false);
    setTransDesc('');
    setTransAmount('');
    setTransAccount('');
    showToast(
      `${transType === 'income' ? 'Income' : 'Expense'} entry of ${formatCurrency(amountNum)} recorded!`,
      'success'
    );
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === 'danger'
                  ? 'bg-red-500'
                  : toast.type === 'info'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* ADD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                  Financial Ledger
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">Post Financial Entry</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Type</label>
                <select
                  value={transType}
                  onChange={(e) => setTransType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 font-bold transition"
                >
                  <option value="income">Income (Hospital Collections / Billing)</option>
                  <option value="expense">Expense (Operational Cost / Payroll / Reagents)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Settlement Account / Channel <span className="text-red-500 font-normal">(from Masters)</span>
                </label>
                <select
                  value={transAccount}
                  onChange={(e) => setTransAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 font-bold transition"
                >
                  {paymentAccounts.length > 0 ? (
                    paymentAccounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} ({acc.accountNo})
                      </option>
                    ))
                  ) : (
                    <option value="General Operating A/C">General Operating A/C (Default)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Clinical Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Inpatient Room Settlement, Lab OCR Reagent Purchase"
                  value={transDesc}
                  onChange={(e) => setTransDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={transAmount}
                  onChange={(e) => setTransAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 font-bold transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition"
                >
                  Save to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD BODY */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-6">
        {/* Page Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Hospital Operational Ledger</span>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full uppercase tracking-wider">
                Audited Matrix
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Synchronized tracking of clinical collections, ward tariff accruals, and merchant settlements.
            </p>
          </div>

          <button
            onClick={() => {
              if (paymentAccounts.length > 0) setTransAccount(paymentAccounts[0].name);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Entry</span>
          </button>
        </div>

        {/* Dynamic KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Income */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Collections
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {formatCurrency(totalIncome)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Consultations, Labs & Settlements
            </span>
          </div>

          {/* Inpatient Tariff Accrual from Masters */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-blue-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Inpatient Bed Accruals
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">
              {formatCurrency(activeInpatientRoomAccruals)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              {totalOccupiedBeds} Active Beds @ Ward Tariffs
            </span>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-red-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Operating Cost
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-red-600 mt-2">
              {formatCurrency(totalExpense)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Salaries, Reagents & Overheads
            </span>
          </div>

          {/* Net Margin */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Operating Margin
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {netProfit < 0 ? `-${formatCurrency(Math.abs(netProfit))}` : formatCurrency(netProfit)}
            </div>
            <span className={`text-[11px] font-bold mt-1 block ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Operating Margin: {margin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Main Grid: Chart & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Column (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Financial Ratio Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Total Realized Collections vs Debits</p>
            </div>

            <div className="relative w-full h-[260px] flex items-center justify-center">
              <canvas ref={chartRef}></canvas>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Audited with Masters Bank Matrix
              </span>
              <span className="font-bold text-slate-800">FY 2025</span>
            </div>
          </div>

          {/* Table Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Transaction History</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronized ledger entries mapped to payment channels
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                {transactions.length} Total Records
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Description & Channel</th>
                    <th className="py-3.5 px-5">Type</th>
                    <th className="py-3.5 px-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sortedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{t.desc}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{t.accountName || 'Operating A/C'}</div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            t.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-5 text-right font-bold whitespace-nowrap ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {sortedTransactions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                        No transactions recorded yet. Click "Add New Entry" to post a record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}