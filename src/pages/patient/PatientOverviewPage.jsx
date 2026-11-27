import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClinical } from '../../context/ClinicalContext';
import { useToast } from '../../context/ToastContext';
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
  Calendar,
  Sparkles,
  Bed,
  Building,
  Pill,
  Plus,
  Clock,
  ShieldAlert,
  X,
  Check
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

const DEFAULT_MEDICATIONS = [
  { id: 'm1', name: 'Atorvastatin 20mg', schedule: '1 tablet with dinner (Night)', meal: 'After Food', prescribedBy: 'Dr. Sarah Jenkins', taken: true },
  { id: 'm2', name: 'Metformin 500mg', schedule: '1 tablet twice daily (Morning, Night)', meal: 'With Food', prescribedBy: 'Dr. Sarah Jenkins', taken: false },
  { id: 'm3', name: 'Vitamin D3 2000 IU', schedule: '1 capsule morning', meal: 'After Food', prescribedBy: 'Self-Added Routine', taken: true }
];

export default function PatientOverviewPage() {
  const { currentUser } = useAuth();
  const clinicalContext = useClinical();
  const { showToast } = useToast();

  // Admission info from Doctor Triage / Master Bed Matrix
  const [admissionInfo, setAdmissionInfo] = useState(null);

  // Medication & Daily Reminders State
  const [medications, setMedications] = useState([]);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);

  // New Custom Medication Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 Tablet');
  const [newMedTiming, setNewMedTiming] = useState('Morning');
  const [newMedMeal, setNewMedMeal] = useState('After Food');

  // Load admission and prescriptions from localStorage
  const loadClinicalRecords = () => {
    // 1. Load Admission status
    const savedAdmissions = JSON.parse(localStorage.getItem('hospital_patient_admissions') || '{}');
    // Check by user MRN or get the latest active admission
    const userMrn = currentUser?.mrn || 'MRN-884920';
    let currentAdmission = savedAdmissions[userMrn];

    if (!currentAdmission) {
      const allAdmissions = Object.values(savedAdmissions);
      if (allAdmissions.length > 0) {
        currentAdmission = allAdmissions[allAdmissions.length - 1];
      }
    }

    if (currentAdmission) {
      setAdmissionInfo(currentAdmission);
    } else {
      // Default fallback
      setAdmissionInfo({
        careType: 'Inpatient',
        ward: 'Emergency & Trauma Bay',
        bed: 'ED-Observation 05',
        status: 'Admitted & Under Active Treatment',
        admittedAt: '09:15 AM',
        attendingPhysician: 'Dr. Sarah Jenkins',
        diagnosis: 'Substernal chest tightness & elevated lipid markers'
      });
    }

    // 2. Load Doctor Authored Prescriptions + Combine with Default Meds
    const doctorPrescriptions = JSON.parse(localStorage.getItem('hospital_prescriptions') || '[]');
    const formattedDoctorMeds = doctorPrescriptions.map((rx) => ({
      id: rx.id || `rx-${Date.now()}`,
      name: rx.medication,
      schedule: `${rx.dosage} (${Array.isArray(rx.timing) ? rx.timing.join(', ') : rx.timing})`,
      meal: rx.meal || 'After Food',
      prescribedBy: rx.prescribedBy || 'Dr. Sarah Jenkins',
      taken: rx.takenToday || false
    }));

    const savedCustomMeds = JSON.parse(localStorage.getItem('patient_custom_medications') || '[]');

    const combinedMeds = [
      ...formattedDoctorMeds,
      ...savedCustomMeds,
      ...DEFAULT_MEDICATIONS
    ];

    // Deduplicate by name
    const uniqueMeds = Array.from(new Map(combinedMeds.map(item => [item.name, item])).values());
    setMedications(uniqueMeds);
  };

  useEffect(() => {
    loadClinicalRecords();

    const handleStorage = () => {
      loadClinicalRecords();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentUser]);

  // Handle Dose Check-off / Toggle
  const handleToggleMed = (med) => {
    const updated = medications.map((m) =>
      m.id === med.id ? { ...m, taken: !m.taken } : m
    );
    setMedications(updated);

    if (clinicalContext?.toggleMedication) {
      clinicalContext.toggleMedication(med.id);
    }

    showToast(`${med.name} marked as ${!med.taken ? 'Taken ✓' : 'Pending'}`);
  };

  // Handle Add Custom Patient Medication
  const handleAddCustomMedication = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newMed = {
      id: `custom-${Date.now()}`,
      name: newMedName.trim(),
      schedule: `${newMedDosage} (${newMedTiming})`,
      meal: newMedMeal,
      prescribedBy: 'Self-Added Reminder',
      taken: false
    };

    const savedCustomMeds = JSON.parse(localStorage.getItem('patient_custom_medications') || '[]');
    const updatedCustom = [newMed, ...savedCustomMeds];
    localStorage.setItem('patient_custom_medications', JSON.stringify(updatedCustom));

    setMedications([newMed, ...medications]);
    setNewMedName('');
    setIsAddMedModalOpen(false);
    showToast(`Added ${newMed.name} to your daily schedule!`);
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
    <div className="space-y-6 animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 rounded-3xl p-7 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800/60">
              Personal Health Intelligence
            </span>
            <span className="text-[10px] font-bold text-slate-400">MRN: {currentUser?.mrn || '#NC-98402'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Safan'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Your telemetry stream is active. Clinical findings from Dr. Sarah Jenkins and live prescription updates are synced below.
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

      {/* LIVE ADMISSION & BED MASTER BANNER */}
      {admissionInfo && (
        <div className={`rounded-3xl p-6 border shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-5 ${
          admissionInfo.careType === 'Inpatient'
            ? 'bg-gradient-to-r from-red-50/80 via-white to-slate-50 border-red-200 ring-2 ring-red-500/10'
            : 'bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border-blue-200'
        }`}>
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              admissionInfo.careType === 'Inpatient'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              {admissionInfo.careType === 'Inpatient' ? (
                <Bed className="w-6 h-6" />
              ) : (
                <Stethoscope className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  admissionInfo.careType === 'Inpatient'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {admissionInfo.careType === 'Inpatient' ? 'Active Inpatient Admission' : 'Outpatient Consultation Status'}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {admissionInfo.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {admissionInfo.ward} • <span className="text-red-600">{admissionInfo.bed}</span>
              </h3>

              <p className="text-xs text-slate-500 mt-0.5">
                Primary Diagnosis: <span className="font-semibold text-slate-700">{admissionInfo.diagnosis || 'Clinical Observation'}</span> • Attending: <span className="font-semibold text-slate-700">{admissionInfo.attendingPhysician || 'Dr. Sarah Jenkins'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admission Time</span>
              <span className="text-xs font-extrabold text-slate-800">{admissionInfo.admittedAt || 'Active Session'}</span>
            </div>
            <Link
              to="/ai-assistant"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4 text-red-400" />
              <span>Contact Nurse Station</span>
            </Link>
          </div>
        </div>
      )}

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
        {/* 7-Day Vitals Trend */}
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

        {/* Daily Medication Regimen & Doctor Prescriptions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Daily Medication Regimen</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">{completedCount}/{medications.length}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Syncs directly with Doctor Prescriptions & Reminders</p>

            <button
              onClick={() => setIsAddMedModalOpen(true)}
              className="w-full mb-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Dose Reminder</span>
            </button>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
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
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.schedule} • {m.meal}</div>
                    <span className="text-[9px] font-semibold text-purple-600 block">{m.prescribedBy}</span>
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
              <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Primary Attending Physician</div>
              <h4 className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins, MD</h4>
              <p className="text-xs text-slate-500">Internal Medicine & Emergency Cardiology</p>
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

      {/* ADD CUSTOM MEDICATION REMINDER MODAL */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 bg-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shadow-sm">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Add Medication Reminder</h3>
                  <p className="text-xs text-purple-200">Set daily dose schedule and alerts</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMedModalOpen(false)}
                className="text-purple-200 hover:text-white p-1.5 rounded-lg hover:bg-purple-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomMedication} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Medication / Supplement Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Omega-3 Fish Oil 1000mg"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Dosage
                  </label>
                  <select
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="1 Tablet">1 Tablet</option>
                    <option value="2 Tablets">2 Tablets</option>
                    <option value="1 Capsule">1 Capsule</option>
                    <option value="5 ml">5 ml Syrup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Timing
                  </label>
                  <select
                    value={newMedTiming}
                    onChange={(e) => setNewMedTiming(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                    <option value="Morning, Night">Morning & Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Instruction
                </label>
                <select
                  value={newMedMeal}
                  onChange={(e) => setNewMedMeal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                  <option value="With Food">With Food</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save Dose Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}