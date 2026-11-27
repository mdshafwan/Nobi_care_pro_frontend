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
  Check,
  MessageSquare,
  Send,
  PlusCircle,
  Thermometer,
  Radio,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
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
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  const clinicalContext = useClinical();
  const { showToast } = useToast();

  // Admission & ER Triage State
  const [admissionInfo, setAdmissionInfo] = useState(null);
  const [triageStatus, setTriageStatus] = useState(null);

  // Vitals State (Synced from Doctor Admission, Triage or Patient Manual Log)
  const [vitals, setVitals] = useState({
    systolic: 118,
    diastolic: 76,
    heartRate: 74,
    spo2: 99,
    bloodSugar: 104,
    lastUpdated: '10:30 AM'
  });
  const [isLogVitalsModalOpen, setIsLogVitalsModalOpen] = useState(false);
  const [inputSystolic, setInputSystolic] = useState('118');
  const [inputDiastolic, setInputDiastolic] = useState('76');
  const [inputHeartRate, setInputHeartRate] = useState('74');
  const [inputSpo2, setInputSpo2] = useState('99');
  const [inputBloodSugar, setInputBloodSugar] = useState('104');

  // Medication & Daily Reminders State
  const [medications, setMedications] = useState([]);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);

  // New Custom Medication Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 Tablet');
  const [newMedTiming, setNewMedTiming] = useState('Morning');
  const [newMedMeal, setNewMedMeal] = useState('After Food');

  // Load admission, triage tickets, vitals & prescriptions from localStorage
  const loadClinicalRecords = () => {
    const userMrn = activeUser?.mrn || 'MRN-884920';

    // 1. Check if patient is currently waiting in Doctor Triage Queue (e.g. sent from Symptom Checker)
    const triageQueue = JSON.parse(localStorage.getItem('hospital_triage_queue') || '[]');
    const myTriageTicket = triageQueue.find((t) => t.mrn === userMrn || t.name?.toLowerCase() === activeUser?.name?.toLowerCase());

    if (myTriageTicket) {
      setTriageStatus(myTriageTicket);
    } else {
      setTriageStatus(null);
    }

    // 2. Load Admission status strictly for THIS patient
    const savedAdmissions = JSON.parse(localStorage.getItem('hospital_patient_admissions') || '{}');
    const myAdmission = savedAdmissions[userMrn];

    if (myAdmission) {
      const isCurrentlyAdmitted = 
        myAdmission.status && 
        myAdmission.status.toLowerCase().includes('admitted') &&
        !myAdmission.status.toLowerCase().includes('discharged');

      setAdmissionInfo({
        ...myAdmission,
        isAdmitted: isCurrentlyAdmitted
      });

      // Parse Doctor Triage Vitals if available
      if (myAdmission.vitals) {
        let sys = 118, dia = 76, hr = 74, ox = 99;
        if (typeof myAdmission.vitals === 'object') {
          if (myAdmission.vitals.bp) {
            const parts = myAdmission.vitals.bp.split('/');
            sys = parseInt(parts[0], 10) || 118;
            dia = parseInt(parts[1], 10) || 76;
          }
          if (myAdmission.vitals.hr) hr = parseInt(myAdmission.vitals.hr, 10) || 74;
          if (myAdmission.vitals.spo2) ox = parseInt(myAdmission.vitals.spo2, 10) || 99;
        }

        const savedPatientLogs = JSON.parse(localStorage.getItem('patient_vitals_log') || 'null');
        if (!savedPatientLogs) {
          setVitals((prev) => ({
            ...prev,
            systolic: sys,
            diastolic: dia,
            heartRate: hr,
            spo2: ox,
            lastUpdated: 'From Doctor Triage'
          }));
        }
      }
    } else {
      // Clean outpatient state when no admission exists or beds are released
      setAdmissionInfo({
        isAdmitted: false,
        careType: 'Outpatient',
        ward: 'Ambulatory Care',
        bed: 'None (Bed Released)',
        status: 'Discharged & Recovered',
        admittedAt: null,
        attendingPhysician: 'Dr. Sarah Jenkins, MD',
        diagnosis: 'Routine Clinical Follow-Up'
      });
    }

    // 3. Load Patient Logged Vitals if user logged recently
    const savedVitals = JSON.parse(localStorage.getItem('patient_vitals_log') || 'null');
    if (savedVitals) {
      setVitals(savedVitals);
      setInputSystolic(String(savedVitals.systolic));
      setInputDiastolic(String(savedVitals.diastolic));
      setInputHeartRate(String(savedVitals.heartRate));
      setInputSpo2(String(savedVitals.spo2));
      setInputBloodSugar(String(savedVitals.bloodSugar || 104));
    }

    // 4. Load Doctor Prescriptions + Custom Patient Meds
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

    const uniqueMeds = Array.from(new Map(combinedMeds.map((item) => [item.name, item])).values());
    setMedications(uniqueMeds);
  };

  useEffect(() => {
    loadClinicalRecords();

    const handleStorage = () => {
      loadClinicalRecords();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [activeUser]);

  // Handle Dose Check-off / Toggle & Sync with Doctor Prescriptions
  const handleToggleMed = (med) => {
    const nextTaken = !med.taken;
    const updated = medications.map((m) =>
      m.id === med.id ? { ...m, taken: nextTaken } : m
    );
    setMedications(updated);

    // Sync back to doctor prescriptions store
    try {
      const doctorPrescriptions = JSON.parse(localStorage.getItem('hospital_prescriptions') || '[]');
      const updatedDoctorPrescriptions = doctorPrescriptions.map((rx) =>
        rx.medication === med.name ? { ...rx, takenToday: nextTaken } : rx
      );
      localStorage.setItem('hospital_prescriptions', JSON.stringify(updatedDoctorPrescriptions));
    } catch (e) {
      console.error('Error syncing prescriptions:', e);
    }

    if (clinicalContext?.toggleMedication) {
      clinicalContext.toggleMedication(med.id);
    }

    showToast(`${med.name} marked as ${nextTaken ? 'Taken ✓' : 'Pending'}`);
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

  // Handle Save Patient Self-Logged Vitals
  const handleSaveVitals = (e) => {
    e.preventDefault();
    const updated = {
      systolic: Number(inputSystolic) || 120,
      diastolic: Number(inputDiastolic) || 80,
      heartRate: Number(inputHeartRate) || 72,
      spo2: Number(inputSpo2) || 98,
      bloodSugar: Number(inputBloodSugar) || 100,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setVitals(updated);
    localStorage.setItem('patient_vitals_log', JSON.stringify(updated));
    setIsLogVitalsModalOpen(false);
    showToast('Telemetry updated: Your daily vitals have been logged and synced!', 'success');
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    datasets: [
      {
        label: 'Systolic BP (mmHg)',
        data: [122, 120, 124, 119, 121, 118, vitals.systolic],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointRadius: 4
      },
      {
        label: 'Heart Rate (BPM)',
        data: [78, 76, 82, 75, 74, 72, vitals.heartRate],
        borderColor: '#2563eb',
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4
      },
      {
        label: 'Diastolic BP (mmHg)',
        data: [80, 78, 82, 77, 79, 76, vitals.diastolic],
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

  const completedCount = medications.filter((m) => m.taken).length;
  const adherencePercent = Math.round((completedCount / (medications.length || 1)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 rounded-3xl p-7 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800/60">
              Personal Health Intelligence
            </span>
            <span className="text-[10px] font-bold text-slate-400">MRN: {activeUser?.mrn || 'MRN-884920'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {activeUser?.name?.split(' ')[0] || 'Safan'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Your telemetry stream is active. Clinical findings from Dr. Sarah Jenkins and live prescription updates are synced below.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/symptom-checker"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            Check Symptoms
          </Link>
          <Link
            to="/lab-ocr"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-red-300" />
            View Lab OCR
          </Link>
          <Link
            to="/care-messages"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Care Team Desk
          </Link>
        </div>
      </div>

      {/* EMERGENCY TRIAGE PENDING BANNER (Visible if user sent symptoms to Doctor Triage) */}
      {triageStatus && !admissionInfo?.isAdmitted && (
        <div className="rounded-3xl p-6 border shadow-sm transition bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-300 ring-2 ring-amber-500/10 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                    Emergency Triage Active
                  </span>
                  <span className="text-xs font-bold text-amber-800">
                    Priority: <strong>{triageStatus.esi || 'ESI-2'}</strong> ({triageStatus.risk || 'High Risk'})
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Case Dispatched to Emergency Physician Caseload
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Chief Complaint: <span className="font-semibold text-slate-800">{triageStatus.complaint}</span> • Attending ER Physician: <span className="font-semibold text-slate-800">Dr. Sarah Jenkins</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Queue Status</span>
                <span className="text-xs font-extrabold text-amber-700">Awaiting Bed Assignment</span>
              </div>
              <Link
                to="/care-messages"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span>Contact Nurse Desk</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC ADMISSION & BED MASTER BANNER (Switches between Inpatient and Discharged) */}
      {admissionInfo && !triageStatus && (
        <div className={`rounded-3xl p-6 border shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-5 ${
          admissionInfo.isAdmitted
            ? 'bg-gradient-to-r from-red-50/90 via-white to-slate-50 border-red-200 ring-2 ring-red-500/10'
            : 'bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border-emerald-200'
        }`}>
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              admissionInfo.isAdmitted
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {admissionInfo.isAdmitted ? (
                <Bed className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  admissionInfo.isAdmitted
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {admissionInfo.isAdmitted ? 'Active Inpatient Admission' : 'Outpatient / Discharged Status'}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${admissionInfo.isAdmitted ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  {admissionInfo.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {admissionInfo.isAdmitted 
                  ? `${admissionInfo.ward} • ${admissionInfo.bed}` 
                  : 'No Active Inpatient Hospitalization'}
              </h3>

              <p className="text-xs text-slate-500 mt-0.5">
                {admissionInfo.isAdmitted ? (
                  <>
                    Primary Diagnosis: <span className="font-semibold text-slate-700">{admissionInfo.diagnosis || 'Clinical Observation'}</span> • Attending: <span className="font-semibold text-slate-700">{admissionInfo.attendingPhysician || 'Dr. Sarah Jenkins'}</span>
                  </>
                ) : (
                  <>
                    Recovery Status: <span className="font-semibold text-emerald-700">All Master Beds Released</span> • Attending: <span className="font-semibold text-slate-700">{admissionInfo.attendingPhysician || 'Dr. Sarah Jenkins'}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {admissionInfo.isAdmitted ? 'Admission Time' : 'Care Pathway'}
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {admissionInfo.isAdmitted ? (admissionInfo.admittedAt || 'Active Session') : 'Home Recovery'}
              </span>
            </div>
            <Link
              to="/care-messages"
              className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer ${
                admissionInfo.isAdmitted ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{admissionInfo.isAdmitted ? 'Contact Nurse Station' : 'Message Doctor'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Vitals KPI Row with "Log Vitals" Action Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Live Biometrics & Vitals
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Updated: {vitals.lastUpdated}
            </span>
          </div>

          <button
            onClick={() => setIsLogVitalsModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" />
            <span>Log Daily Vitals</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {vitals.systolic} / {vitals.diastolic} <span className="text-xs font-semibold text-slate-400">mmHg</span>
            </div>
            <span className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
              vitals.systolic > 140 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> 
              {vitals.systolic > 140 ? 'Stage 2 Hypertension Flag' : 'Optimal Clinical Range'}
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
              {vitals.heartRate} <span className="text-xs font-semibold text-slate-400">BPM</span>
            </div>
            <span className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
              vitals.heartRate > 100 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> 
              {vitals.heartRate > 100 ? 'Tachycardia Alert' : 'Normal Sinus Rhythm'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SpO2 Oxygen</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {vitals.spo2}% <span className="text-xs font-semibold text-slate-400">Saturation</span>
            </div>
            <span className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
              vitals.spo2 < 95 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> 
              {vitals.spo2 < 95 ? 'Hypoxemia Caution' : 'Healthy Room Air'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Sugar (Fasting)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {vitals.bloodSugar} <span className="text-xs font-semibold text-slate-400">mg/dL</span>
            </div>
            <span className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
              vitals.bloodSugar > 125 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> 
              {vitals.bloodSugar > 125 ? 'Elevated Glycemic Alert' : 'Target Glycemic Index'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Medication Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-Day Vitals Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Vitals & Biometric Trend</h3>
              <p className="text-xs text-slate-400">Continuous telemetry feed from synced smart monitors & daily logs</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Synced Live
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
            to="/care-messages"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Message Care Team</span>
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

      {/* MODAL 1: LOG DAILY VITALS */}
      {isLogVitalsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-red-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Log Daily Health Vitals</h3>
                  <p className="text-xs text-slate-400">Record your current blood pressure & biometric readings</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogVitalsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    required
                    value={inputSystolic}
                    onChange={(e) => setInputSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    required
                    value={inputDiastolic}
                    onChange={(e) => setInputDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Pulse (BPM)
                  </label>
                  <input
                    type="number"
                    required
                    value={inputHeartRate}
                    onChange={(e) => setInputHeartRate(e.target.value)}
                    placeholder="74"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    SpO2 (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={inputSpo2}
                    onChange={(e) => setInputSpo2(e.target.value)}
                    placeholder="99"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    required
                    value={inputBloodSugar}
                    onChange={(e) => setInputBloodSugar(e.target.value)}
                    placeholder="104"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsLogVitalsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save & Sync Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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