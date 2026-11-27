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
  Calendar
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminLedgerPage() {
  // --- Transaction State ---
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2023-10-24', desc: 'Patient Consultation Fee (CBC)', type: 'income', amount: 150.00 },
    { id: 2, date: '2023-10-24', desc: 'MRI Machine Maintenance', type: 'expense', amount: 1200.00 },
    { id: 3, date: '2023-10-23', desc: 'Lab Reagent Purchase', type: 'expense', amount: 450.50 },
    { id: 4, date: '2023-10-23', desc: 'Lipid Profile Test Batch', type: 'income', amount: 800.00 },
    { id: 5, date: '2023-10-22', desc: 'Doctor On-Call Stipend', type: 'expense', amount: 3000.00 }
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transType, setTransType] = useState('income');
  const [transDesc, setTransDesc] = useState('');
  const [transAmount, setTransAmount] = useState('');

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Chart Ref
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // --- Toast Notification Helper ---
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // --- Currency Formatter ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // --- Live Calculations ---
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // --- Chart.js Sync ---
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Income', 'Total Expense'],
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
              font: {
                family: 'Plus Jakarta Sans',
                weight: 'bold',
                size: 11
              },
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
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [totalIncome, totalExpense]);

  // --- Save New Ledger Entry ---
  const handleSaveTransaction = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(transAmount);

    if (!transDesc.trim() || isNaN(amountNum) || amountNum <= 0) {
      showToast('Please provide a valid description and amount.', 'danger');
      return;
    }

    const newTrans = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      desc: transDesc.trim(),
      type: transType,
      amount: amountNum
    };

    setTransactions((prev) => [newTrans, ...prev]);
    setIsModalOpen(false);
    setTransDesc('');
    setTransAmount('');
    showToast(
      `${transType === 'income' ? 'Income' : 'Expense'} entry of ${formatCurrency(amountNum)} recorded!`,
      'success'
    );
  };

  // Sorted reverse-chronological transaction stream
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
                <h3 className="text-lg font-extrabold text-slate-900">Add New Entry</h3>
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
                  <option value="income">Income (Revenue)</option>
                  <option value="expense">Expense (Cost)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Patient Consultation Fee, MRI Machine Repair"
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
                  Save Ledger Entry
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Hospital Operational Ledger</span>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full uppercase tracking-wider">
                Real-time Stream
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Track clinical revenue streams, equipment depreciations, lab consumable procurement, and net margins.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Entry</span>
          </button>
        </div>

        {/* Top 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total Income */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Income (Revenue)
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {formatCurrency(totalIncome)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Consultations, Lab Tests, Pharmacy
            </span>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-red-600 mt-2">
              {formatCurrency(totalExpense)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Salaries, Equipment, Lab Reagents
            </span>
          </div>

          {/* Net Operating Profit */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Operating Profit
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-extrabold mt-2 ${netProfit >= 0 ? 'text-slate-900' : 'text-slate-900'}`}>
              {netProfit < 0 ? `-${formatCurrency(Math.abs(netProfit))}` : formatCurrency(netProfit)}
            </div>
            <span
              className={`text-[11px] font-bold mt-1 block ${
                netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              Margin: {margin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Main Grid: Chart & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart Column (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Financial Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Income vs Expense Ratio Breakdown</p>
            </div>

            <div className="relative w-full h-[260px] flex items-center justify-center">
              <canvas ref={chartRef}></canvas>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Audited under GAAP Standards
              </span>
              <span className="font-bold text-slate-800">FY 2023-2024</span>
            </div>
          </div>

          {/* Table Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Transaction History</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recent clinical income and operational expense entries
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                {transactions.length} Total Entries
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Description</th>
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
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {t.desc}
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
                        No transactions recorded yet. Click "Add New Entry" to begin.
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