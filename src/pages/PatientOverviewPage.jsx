import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClinical } from '../context/ClinicalContext';
import { useToast } from '../context/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Activity, 
  Heart, 
  Droplet, 
  ArrowUpRight, 
  CheckCircle2, 
  Stethoscope, 
  FileText, 
  Bot, 
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PatientOverviewPage() {
  const { currentUser } = useAuth();
  const clinicalContext = useClinical();
  const { showToast } = useToast();

  // Safely fallback between patientMedications and patientMeds
  const medications = clinicalContext?.patientMedications || clinicalContext?.patientMeds || [
    { id: 'm1', name: 'Atorvastatin 20mg', schedule: '1 tablet with dinner', taken: true },
    { id: 'm2', name: 'Metformin 500mg', schedule: '1 tablet twice daily with meals', taken: false },
    { id: 'm3', name: 'Vitamin D3 2000 IU', schedule: '1 capsule morning', taken: true }
  ];

  const handleToggleMed = (med) => {
    if (clinicalContext?.toggleMedication) {
      clinicalContext.toggleMedication(med.id);
    }
    showToast(`${med.name} marked as ${!med.taken ? 'Taken' : 'Pending'}`);
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    datasets: [
      {
        label: 'Systolic BP (mmHg)',
        data: [122, 120, 124, 119, 121, 118, 118],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointRadius: 4
      },
      {
        label: 'Heart Rate (BPM)',
        data: [78, 76, 82, 75, 74, 72, 74],
        borderColor: '#2563eb',
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4
      },
      {
        label: 'Diastolic BP (mmHg)',
        data: [80, 78, 82, 77, 79, 76, 76],
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        tension: 0.4,
        pointBackgroundColor: '#94a3b8',
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
      }
    }
  };

  const completedCount = medications.filter(m => m.taken).length;
  const adherencePercent = Math.round((completedCount / (medications.length || 1)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 rounded-3xl p-7 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800/60">
              Personal Health Intelligence
            </span>
            <span className="text-[10px] font-bold text-slate-400">MRN: #NC-98402</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Safan'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Your latest lab report has been synthesized by our BioMistral OCR pipeline. Dr. Sarah Jenkins is reviewing your metabolic markers.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/symptom-checker"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Check Symptoms
          </Link>
          <Link
            to="/lab-ocr"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-red-300" />
            View Lab OCR
          </Link>
          <Link
            to="/ai-assistant"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-red-300" />
            AI Copilot
          </Link>
        </div>
      </div>

      {/* Vitals KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            118 / 76 <span className="text-xs font-semibold text-slate-400">mmHg</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Range (AHA)
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resting Heart Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            74 <span className="text-xs font-semibold text-slate-400">BPM</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normal Sinus Rhythm
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hemoglobin (OCR)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            11.2 <span className="text-xs font-semibold text-slate-400">g/dL</span>
          </div>
          <span className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
            ⚠️ Mildly Low (Microcytic)
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cholesterol</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            240 <span className="text-xs font-semibold text-slate-400">mg/dL</span>
          </div>
          <span className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
            ↑ Elevated Lipid Flag
          </span>
        </div>
      </div>

      {/* Charts & Medication Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Vitals & Biometric Trend</h3>
              <p className="text-xs text-slate-400">Continuous telemetry feed from synced smart monitors</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              ● Synced Live
            </span>
          </div>
          <div className="h-64 relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Daily Medication Regimen */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Daily Medication Regimen</h3>
              <span className="text-xs font-bold text-slate-400">{completedCount}/{medications.length}</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Click any dose to log your adherence</p>
            
            <div className="space-y-2.5">
              {medications.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleToggleMed(m)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    m.taken 
                      ? 'bg-emerald-50/70 border-emerald-200 text-slate-800' 
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="pr-2">
                    <div className={`text-xs font-bold ${m.taken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {m.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.schedule}</div>
                  </div>
                  <button
                    type="button"
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide flex items-center gap-1 transition ${
                      m.taken 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {m.taken ? <CheckCircle2 className="w-3 h-3" /> : null}
                    {m.taken ? 'TAKEN' : 'MARK'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Adherence Score
            </div>
            <span className={`text-sm font-black ${adherencePercent >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {adherencePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Care Team & Next Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Primary Physician</div>
              <h4 className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins, MD</h4>
              <p className="text-xs text-slate-500">Internal Medicine & Clinical Cardiology</p>
            </div>
          </div>
          <Link
            to="/ai-assistant"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            Message Care Team
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Upcoming Review</div>
              <h4 className="text-sm font-bold text-slate-900">Cardiovascular & Lipid Tele-Consult</h4>
              <p className="text-xs text-slate-500">Friday, 10:30 AM (EST) • Virtual Bay</p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            Confirmed
          </span>
        </div>
      </div>
    </div>
  );
}