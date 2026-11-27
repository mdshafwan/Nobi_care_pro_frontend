import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  Activity, 
  Bed, 
  Clock, 
  Search, 
  X, 
  Zap, 
  ShieldAlert,
  FileCheck,
  Check,
  Pill,
  Plus,
  Trash2,
  Building,
  Stethoscope,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Fallback Ward Master Data
const DEFAULT_WARD_MASTER = [
  {
    id: 'W-1',
    name: 'Intensive Care Unit (ICU)',
    code: 'ICU-A',
    floor: '3rd Floor - Wing B',
    tariff: 8500,
    type: 'Critical Care',
    totalBeds: 12,
    occupiedBeds: 3,
    beds: [
      { id: 'B-101', name: 'ICU-Bed 01', status: 'Occupied', patient: 'Arthur Pendelton' },
      { id: 'B-102', name: 'ICU-Bed 02', status: 'Available', patient: null },
      { id: 'B-103', name: 'ICU-Bed 03', status: 'Available', patient: null },
      { id: 'B-104', name: 'ICU-Bed 04', status: 'Occupied', patient: 'Marcus Brody' },
      { id: 'B-105', name: 'ICU-Bed 05', status: 'Available', patient: null },
      { id: 'B-106', name: 'ICU-Bed 06', status: 'Occupied', patient: 'Sophia Loren' }
    ]
  },
  {
    id: 'W-2',
    name: 'Emergency & Trauma Bay',
    code: 'ED-T',
    floor: 'Ground Floor',
    tariff: 3500,
    type: 'Emergency',
    totalBeds: 8,
    occupiedBeds: 2,
    beds: [
      { id: 'B-201', name: 'ED-Trauma Bay 01', status: 'Occupied', patient: 'George Weasley' },
      { id: 'B-202', name: 'ED-Rapid Assessment 02', status: 'Available', patient: null },
      { id: 'B-203', name: 'ED-Rapid Assessment 03', status: 'Available', patient: null },
      { id: 'B-204', name: 'ED-Cardiac Monitored 04', status: 'Available', patient: null },
      { id: 'B-205', name: 'ED-Observation 05', status: 'Occupied', patient: 'Eleanor Vance' }
    ]
  },
  {
    id: 'W-3',
    name: 'General Medical Ward',
    code: 'GEN-M',
    floor: '2nd Floor - Wing A',
    tariff: 2200,
    type: 'General Inpatient',
    totalBeds: 16,
    occupiedBeds: 4,
    beds: [
      { id: 'B-301', name: 'GEN-Bed 101', status: 'Available', patient: null },
      { id: 'B-302', name: 'GEN-Bed 102', status: 'Available', patient: null },
      { id: 'B-303', name: 'GEN-Bed 103', status: 'Available', patient: null },
      { id: 'B-304', name: 'GEN-Bed 104', status: 'Occupied', patient: 'David Hemmings' }
    ]
  },
  {
    id: 'W-4',
    name: 'Cardiology Step-down',
    code: 'CARD-S',
    floor: '4th Floor - Wing C',
    tariff: 4800,
    type: 'Specialty Care',
    totalBeds: 10,
    occupiedBeds: 3,
    beds: [
      { id: 'B-401', name: 'CARD-Bed 01', status: 'Available', patient: null },
      { id: 'B-402', name: 'CARD-Bed 02', status: 'Available', patient: null },
      { id: 'B-403', name: 'CARD-Bed 03', status: 'Occupied', patient: 'Clara Oswald' }
    ]
  }
];

const INITIAL_INCOMING_QUEUE = [
  {
    id: 'P-901',
    mrn: 'MRN-884920',
    name: 'Eleanor Vance',
    age: 64,
    gender: 'Female',
    complaint: 'Severe substernal chest tightness & diaphoresis',
    risk: 'HIGH',
    esi: 'ESI 1',
    wait: '4 mins',
    vitals: { hr: '118 bpm', bp: '158/96', spo2: '93%', temp: '98.6°F' },
    rationale: 'Acute ST-segment elevation detected on telemetry stream. High probability of STEMI. Immediate cath lab activation recommended.'
  },
  {
    id: 'P-902',
    mrn: 'MRN-339102',
    name: 'Marcus Brody',
    age: 42,
    gender: 'Male',
    complaint: 'Acute focal neurological deficit, right arm weakness',
    risk: 'HIGH',
    esi: 'ESI 1',
    wait: '8 mins',
    vitals: { hr: '92 bpm', bp: '172/104', spo2: '97%', temp: '98.9°F' },
    rationale: 'FAST score positive. NIH Stroke Scale estimated at 11. STAT Non-contrast Head CT required.'
  },
  {
    id: 'P-903',
    mrn: 'MRN-551094',
    name: 'Sophia Loren',
    age: 29,
    gender: 'Female',
    complaint: 'Severe shortness of breath, silent chest audio telemetry',
    risk: 'HIGH',
    esi: 'ESI 2',
    wait: '11 mins',
    vitals: { hr: '130 bpm', bp: '135/85', spo2: '89%', temp: '99.1°F' },
    rationale: 'Status asthmaticus exacerbation with severe hypoxemia. Nebulizer protocol standing by.'
  },
  {
    id: 'P-904',
    mrn: 'MRN-774102',
    name: 'David Hemmings',
    age: 51,
    gender: 'Male',
    complaint: 'Right lower quadrant abdominal pain with rebound tenderness',
    risk: 'MEDIUM',
    esi: 'ESI 3',
    wait: '18 mins',
    vitals: { hr: '88 bpm', bp: '130/82', spo2: '99%', temp: '101.4°F' },
    rationale: 'McBurney point tenderness reported. Acute appendicitis suspected. Ultrasound ordered.'
  },
  {
    id: 'P-905',
    mrn: 'MRN-112093',
    name: 'Clara Oswald',
    age: 34,
    gender: 'Female',
    complaint: 'Pyelonephritis symptoms, high fever with flank pain',
    risk: 'MEDIUM',
    esi: 'ESI 3',
    wait: '22 mins',
    vitals: { hr: '104 bpm', bp: '118/76', spo2: '98%', temp: '102.8°F' },
    rationale: 'CVA tenderness positive. Systemic inflammatory response pattern initiated.'
  },
  {
    id: 'P-906',
    mrn: 'MRN-449102',
    name: 'Hannah Abbott',
    age: 23,
    gender: 'Female',
    complaint: 'Superficial laceration on forearm (3cm)',
    risk: 'LOW',
    esi: 'ESI 4',
    wait: '31 mins',
    vitals: { hr: '68 bpm', bp: '112/70', spo2: '100%', temp: '98.2°F' },
    rationale: 'Hemostasis achieved. Suturing required within 6 hours.'
  }
];

const INITIAL_MY_CASELOAD = [
  {
    id: 'P-881',
    mrn: 'MRN-904812',
    name: 'Arthur Pendelton',
    age: 71,
    gender: 'Male',
    complaint: 'Closed displaced radius fracture following fall',
    risk: 'MEDIUM',
    esi: 'ESI 3',
    careType: 'Inpatient',
    wardId: 'W-1',
    wardName: 'Intensive Care Unit (ICU)',
    bed: 'ICU-Bed 01',
    vitals: { hr: '76 bpm', bp: '138/82', spo2: '98%', temp: '98.4°F' },
    status: 'Cast Applied & Stabilized',
    assignedAt: '45 mins ago',
    prescriptions: [
      { id: 'RX-1', medication: 'Acetaminophen 650mg', dosage: '1 Tab', timing: ['Morning', 'Night'], meal: 'After Food', duration: '5 Days' }
    ]
  },
  {
    id: 'P-882',
    mrn: 'MRN-661092',
    name: 'George Weasley',
    age: 28,
    gender: 'Male',
    complaint: 'Acute dehydration and viral gastroenteritis',
    risk: 'LOW',
    esi: 'ESI 4',
    careType: 'Inpatient',
    wardId: 'W-2',
    wardName: 'Emergency & Trauma Bay',
    bed: 'ED-Trauma Bay 01',
    vitals: { hr: '72 bpm', bp: '120/78', spo2: '99%', temp: '98.6°F' },
    status: 'IV Fluids Completed - Resolving',
    assignedAt: '1 hr 15 mins ago',
    prescriptions: [
      { id: 'RX-2', medication: 'Oral Rehydration Salts', dosage: '1 Sachet in 1L Water', timing: ['Morning', 'Noon', 'Night'], meal: 'Before Food', duration: '3 Days' },
      { id: 'RX-3', medication: 'Ondansetron 4mg', dosage: '1 Tab', timing: ['Morning'], meal: 'Before Food', duration: '2 Days' }
    ]
  }
];

const INITIAL_RECOVERED_ARCHIVE = [
  {
    id: 'P-801',
    mrn: 'MRN-221049',
    name: 'Liam Neeson',
    diagnosis: 'Benign Paroxysmal Positional Vertigo',
    careType: 'Outpatient Consultation',
    dischargeTime: '10:42 AM',
    outcome: 'Epley Maneuver Successful - Discharged Home'
  },
  {
    id: 'P-802',
    mrn: 'MRN-119284',
    name: 'Emma Watson',
    diagnosis: 'Mild Anaphylactoid Food Reaction',
    careType: 'Inpatient Step-down',
    dischargeTime: '11:15 AM',
    outcome: 'Full Resolution Post-Antihistamine'
  }
];

export default function DoctorTriagePage() {
  const [incomingQueue, setIncomingQueue] = useState(INITIAL_INCOMING_QUEUE);
  const [myCaseload, setMyCaseload] = useState(INITIAL_MY_CASELOAD);
  const [recoveredArchive, setRecoveredArchive] = useState(INITIAL_RECOVERED_ARCHIVE);

  // Ward Master State (synced with Admin Master)
  const [wards, setWards] = useState(() => {
    const saved = localStorage.getItem('hospital_ward_master');
    return saved ? JSON.parse(saved) : DEFAULT_WARD_MASTER;
  });

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'caseload' | 'recovered'
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('Just now');

  // Review / Intake Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [carePathway, setCarePathway] = useState('Inpatient'); // 'Inpatient' | 'Outpatient'
  const [selectedWardId, setSelectedWardId] = useState('');
  const [selectedBedName, setSelectedBedName] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Prescription Authoring in Modal
  const [prescriptionsDraft, setPrescriptionsDraft] = useState([]);
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxDosage, setRxDosage] = useState('1 Tablet');
  const [rxTiming, setRxTiming] = useState({ morning: true, noon: false, night: true });
  const [rxMeal, setRxMeal] = useState('After Food');
  const [rxDuration, setRxDuration] = useState('5 Days');

  // Discharge Modal State
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [dischargeDisposition, setDischargeDisposition] = useState('Full Recovery - Discharged Home');
  const [dischargeNotes, setDischargeNotes] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);

  // Chart ref
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Sync Ward Master from LocalStorage whenever page gains focus
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('hospital_ward_master');
      if (saved) setWards(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update localStorage helper
  const updateWardMasterStorage = (newWards) => {
    setWards(newWards);
    localStorage.setItem('hospital_ward_master', JSON.stringify(newWards));
  };

  // Sync Telemetry
  const refreshTriageData = () => {
    const saved = localStorage.getItem('hospital_ward_master');
    if (saved) setWards(JSON.parse(saved));
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    showToast('Telemetry stream & Ward Bed Matrix synchronized');
  };

  // Chart Management
  useEffect(() => {
    if (!chartRef.current) return;

    const high = incomingQueue.filter((p) => p.risk === 'HIGH').length;
    const med = incomingQueue.filter((p) => p.risk === 'MEDIUM').length;
    const low = incomingQueue.filter((p) => p.risk === 'LOW').length;

    if (chartInstance.current) {
      chartInstance.current.data.datasets[0].data = [high, med, low];
      chartInstance.current.update();
    } else {
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['High Risk', 'Medium Risk', 'Low Risk'],
          datasets: [
            {
              data: [high, med, low],
              backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                padding: 14,
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
          },
          cutout: '72%',
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [incomingQueue]);

  // Handle open review modal
  const handleOpenReview = (patient) => {
    setSelectedPatient(patient);
    setCarePathway('Inpatient');
    setClinicalNotes('');
    setPrescriptionsDraft([]);
    setRxDrugName('');

    // Pre-select first ward with available beds
    const availableWard = wards.find((w) => w.beds.some((b) => b.status === 'Available')) || wards[0];
    if (availableWard) {
      setSelectedWardId(availableWard.id);
      const firstFreeBed = availableWard.beds.find((b) => b.status === 'Available');
      setSelectedBedName(firstFreeBed ? firstFreeBed.name : '');
    }
  };

  // Add Prescription to Draft list
  const handleAddPrescriptionDraft = (e) => {
    e.preventDefault();
    if (!rxDrugName.trim()) return;

    const timingList = [];
    if (rxTiming.morning) timingList.push('Morning');
    if (rxTiming.noon) timingList.push('Noon');
    if (rxTiming.night) timingList.push('Night');

    const newRx = {
      id: `RX-${Date.now().toString().slice(-4)}`,
      medication: rxDrugName.trim(),
      dosage: rxDosage,
      timing: timingList.length > 0 ? timingList : ['Morning'],
      meal: rxMeal,
      duration: rxDuration,
    };

    setPrescriptionsDraft([...prescriptionsDraft, newRx]);
    setRxDrugName('');
  };

  const handleRemovePrescriptionDraft = (id) => {
    setPrescriptionsDraft(prescriptionsDraft.filter((item) => item.id !== id));
  };

  // Handle Commit Intake / Admission / Outpatient Consultation
  const handleCommitClinicalAction = () => {
    if (!selectedPatient) return;

    const currentWard = wards.find((w) => w.id === selectedWardId);
    const wardName = currentWard ? currentWard.name : 'Emergency & Trauma Bay';
    const bedName = selectedBedName || 'ED-Bed Standing';

    // 1. If Inpatient, update Ward Master occupancy
    if (carePathway === 'Inpatient') {
      const updatedWards = wards.map((w) => {
        if (w.id === selectedWardId) {
          const updatedBeds = w.beds.map((b) => {
            if (b.name === bedName) {
              return { ...b, status: 'Occupied', patient: selectedPatient.name };
            }
            return b;
          });
          const occupiedCount = updatedBeds.filter((b) => b.status === 'Occupied').length;
          return { ...w, beds: updatedBeds, occupiedBeds: occupiedCount };
        }
        return w;
      });
      updateWardMasterStorage(updatedWards);
    }

    // 2. Persist admission & prescriptions for Patient Overview Portal
    const globalPrescriptions = JSON.parse(localStorage.getItem('hospital_prescriptions') || '[]');
    const newGlobalRx = prescriptionsDraft.map((rx) => ({
      ...rx,
      mrn: selectedPatient.mrn,
      patientName: selectedPatient.name,
      prescribedBy: 'Dr. Sarah Jenkins (Cardiology/Emergency)',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      takenToday: false,
    }));
    localStorage.setItem('hospital_prescriptions', JSON.stringify([...newGlobalRx, ...globalPrescriptions]));

    // Record patient admission status in LocalStorage for Patient Overview Page
    const patientAdmissions = JSON.parse(localStorage.getItem('hospital_patient_admissions') || '{}');
    patientAdmissions[selectedPatient.mrn] = {
      careType: carePathway,
      ward: carePathway === 'Inpatient' ? wardName : 'Outpatient Ambulatory Clinic',
      bed: carePathway === 'Inpatient' ? bedName : 'N/A (Consultation Only)',
      status: carePathway === 'Inpatient' ? 'Admitted & Under Active Treatment' : 'Outpatient Prescribed & Discharged',
      admittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attendingPhysician: 'Dr. Sarah Jenkins',
      diagnosis: selectedPatient.complaint
    };
    localStorage.setItem('hospital_patient_admissions', JSON.stringify(patientAdmissions));

    // 3. Update queues
    setIncomingQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));

    if (carePathway === 'Inpatient') {
      setMyCaseload((prev) => [
        {
          ...selectedPatient,
          careType: 'Inpatient',
          wardId: selectedWardId,
          wardName,
          bed: bedName,
          status: 'Under Active Evaluation',
          assignedAt: 'Just now',
          prescriptions: prescriptionsDraft,
        },
        ...prev,
      ]);
      showToast(`${selectedPatient.name} admitted to ${wardName} (${bedName})`);
      setTimeout(() => setActiveTab('caseload'), 300);
    } else {
      // Outpatient: Add directly to Recovered/Discharged archive
      setRecoveredArchive((prev) => [
        {
          id: selectedPatient.id,
          mrn: selectedPatient.mrn,
          name: selectedPatient.name,
          diagnosis: selectedPatient.complaint,
          careType: 'Outpatient Consultation',
          dischargeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          outcome: 'Outpatient Consultation Completed - Prescriptions Issued',
        },
        ...prev,
      ]);
      showToast(`${selectedPatient.name} completed outpatient consultation & prescriptions dispensed`);
      setTimeout(() => setActiveTab('recovered'), 300);
    }

    setSelectedPatient(null);
  };

  // Handle Mark Recovered & Free Bed
  const handleConfirmDischarge = () => {
    if (!dischargeTarget) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Free bed in Ward Master if patient was Inpatient
    if (dischargeTarget.wardId && dischargeTarget.bed) {
      const updatedWards = wards.map((w) => {
        if (w.id === dischargeTarget.wardId || w.name === dischargeTarget.wardName) {
          const updatedBeds = w.beds.map((b) => {
            if (b.name === dischargeTarget.bed) {
              return { ...b, status: 'Available', patient: null };
            }
            return b;
          });
          const occupiedCount = updatedBeds.filter((b) => b.status === 'Occupied').length;
          return { ...w, beds: updatedBeds, occupiedBeds: occupiedCount };
        }
        return w;
      });
      updateWardMasterStorage(updatedWards);
    }

    // Update patient admissions status in storage
    const patientAdmissions = JSON.parse(localStorage.getItem('hospital_patient_admissions') || '{}');
    if (patientAdmissions[dischargeTarget.mrn]) {
      patientAdmissions[dischargeTarget.mrn].status = 'Discharged & Recovered';
      patientAdmissions[dischargeTarget.mrn].dischargedAt = now;
      localStorage.setItem('hospital_patient_admissions', JSON.stringify(patientAdmissions));
    }

    setMyCaseload((prev) => prev.filter((p) => p.id !== dischargeTarget.id));
    setRecoveredArchive((prev) => [
      {
        id: dischargeTarget.id,
        mrn: dischargeTarget.mrn,
        name: dischargeTarget.name,
        diagnosis: dischargeTarget.complaint,
        careType: dischargeTarget.careType || 'Inpatient',
        dischargeTime: now,
        outcome: dischargeDisposition,
      },
      ...prev,
    ]);

    const patientName = dischargeTarget.name;
    const freedBed = dischargeTarget.bed;
    setDischargeTarget(null);
    setDischargeNotes('');
    showToast(`${patientName} discharged. ${freedBed ? `Bed ${freedBed} is now Available.` : ''}`);
  };

  // Computed Values
  const highRiskCount = incomingQueue.filter((p) => p.risk === 'HIGH').length;
  const medRiskCount = incomingQueue.filter((p) => p.risk === 'MEDIUM').length;
  const lowRiskCount = incomingQueue.filter((p) => p.risk === 'LOW').length;
  const totalInQueue = highRiskCount + medRiskCount + lowRiskCount || 1;

  const pctHigh = Math.round((highRiskCount / totalInQueue) * 100);
  const pctMed = Math.round((medRiskCount / totalInQueue) * 100);
  const pctLow = Math.round((lowRiskCount / totalInQueue) * 100);

  // Search and Risk Filter logic
  const filteredQueue = incomingQueue.filter((p) => {
    const matchesRisk = riskFilter === 'ALL' || p.risk === riskFilter;
    const query = searchQuery.toLowerCase().trim();
    return (
      matchesRisk &&
      (p.name.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.complaint.toLowerCase().includes(query))
    );
  });

  const filteredCaseload = myCaseload.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      (p.bed && p.bed.toLowerCase().includes(query))
    );
  });

  const filteredRecovered = recoveredArchive.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.diagnosis.toLowerCase().includes(query)
    );
  });

  // Selected ward's available beds for modal
  const activeWardObj = wards.find((w) => w.id === selectedWardId);
  const availableBedsInSelectedWard = activeWardObj
    ? activeWardObj.beds.filter((b) => b.status === 'Available')
    : [];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 custom-scrollbar bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none animate-bounce">
          <div className="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
            Module 1 • Clinical Triage & Inpatient Bed Allocation
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Emergency Triage & Active Clinical Caseload
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time acuity prioritization, live Master Bed assignment, outpatient consultation & prescription authoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshTriageData}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-slate-500" />
            Sync Telemetry & Beds
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Last synced: <span className="text-slate-600 font-bold">{lastSyncTime}</span>
          </span>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {/* KPI 1: In Triage Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Incoming Queue</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{incomingQueue.length}</span>
            <span className="text-xs font-semibold text-slate-500">Patients</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Awaiting physician assignment</p>
        </div>

        {/* KPI 2: My Assigned Caseload */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm ring-2 ring-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">My Active Caseload</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{myCaseload.length}</span>
            <span className="text-xs font-semibold text-slate-500">Inpatients</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Occupying Live Master Beds</p>
        </div>

        {/* KPI 3: High Risk (ESI 1-2) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">High Risk (ESI 1-2)</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{highRiskCount}</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">STAT Protocol</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Critical telemetry monitoring</p>
        </div>

        {/* KPI 4: Recovered & Discharged */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Today</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{recoveredArchive.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Discharged</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Beds freed & Rx dispensed</p>
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TRIAGE & CASELOAD TABLES (SPAN 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
          {/* Main View Tabs Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4 text-red-600" />
                Incoming Queue ({incomingQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('caseload')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'caseload'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Bed className="w-4 h-4 text-emerald-600" />
                Active Inpatients ({myCaseload.length})
              </button>
              <button
                onClick={() => setActiveTab('recovered')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'recovered'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Discharged ({recoveredArchive.length})
              </button>
            </div>

            {/* Filter Pills */}
            {activeTab === 'queue' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setRiskFilter(tag)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      riskFilter === tag
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {tag === 'MEDIUM' ? 'MED' : tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB VIEW 1: INCOMING TRIAGE QUEUE TABLE */}
          {activeTab === 'queue' && (
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Patient & MRN</th>
                    <th className="py-3.5 px-4">Chief Complaint / Vitals</th>
                    <th className="py-3.5 px-4 text-center">ESI Acuity</th>
                    <th className="py-3.5 px-4 text-center">Wait Time</th>
                    <th className="py-3.5 px-6 text-right">Clinical Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No incoming triage records found matching the active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((patient) => {
                      const riskBadgeClass =
                        patient.risk === 'HIGH'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : patient.risk === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                      return (
                        <tr
                          key={patient.id}
                          onClick={() => handleOpenReview(patient)}
                          className="hover:bg-slate-50/80 transition cursor-pointer group"
                        >
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                              {patient.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {patient.mrn} • {patient.age}y/o {patient.gender}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs font-semibold text-slate-700 max-w-xs truncate">
                              {patient.complaint}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              HR: {patient.vitals.hr} | SpO2: {patient.vitals.spo2}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${riskBadgeClass}`}>
                              {patient.esi} ({patient.risk})
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-xs font-bold text-slate-600">
                            {patient.wait}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="px-3.5 py-1.5 bg-slate-100 group-hover:bg-red-600 group-hover:text-white text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer">
                              <span>Admit / Consult</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB VIEW 2: MY ASSIGNED CASELOAD TABLE */}
          {activeTab === 'caseload' && (
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <div className="p-4 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  Active Inpatient admissions occupying Master Beds. Discharging frees the allocated bed immediately.
                </div>
                <span className="text-xs font-semibold text-slate-500">Live Master Bed Sync</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Assigned Patient</th>
                    <th className="py-3.5 px-4">Ward & Allocated Bed</th>
                    <th className="py-3.5 px-4">Active Prescriptions</th>
                    <th className="py-3.5 px-6 text-right">Clinical Outcome Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredCaseload.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No active inpatients currently assigned to your caseload. Review incoming triage queue to admit patients to Ward Beds.
                      </td>
                    </tr>
                  ) : (
                    filteredCaseload.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400">
                            {p.mrn} • {p.age}y/o {p.gender}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {p.wardName || 'Ward Bed'} • <span className="text-red-600 font-extrabold">{p.bed}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            HR: {p.vitals?.hr || '74 bpm'} | BP: {p.vitals?.bp || '120/80'} | SpO2: {p.vitals?.spo2 || '98%'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {p.prescriptions && p.prescriptions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {p.prescriptions.map((rx, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <Pill className="w-2.5 h-2.5" />
                                  {rx.medication}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Standard Hospital IV Protocol</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setDischargeTarget(p)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Mark Recovered & Free Bed
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB VIEW 3: DISCHARGED & RECOVERED ARCHIVE TABLE */}
          {activeTab === 'recovered' && (
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Patient & MRN</th>
                    <th className="py-3.5 px-4">Initial Diagnosis</th>
                    <th className="py-3.5 px-4">Pathway</th>
                    <th className="py-3.5 px-4 text-center">Discharge Time</th>
                    <th className="py-3.5 px-6 text-right">Recovery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredRecovered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No discharge records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecovered.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400">{p.mrn}</div>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-700">{p.diagnosis}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {p.careType || 'Inpatient'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-xs font-semibold text-slate-500">
                          {p.dischargeTime}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.outcome}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Displaying{' '}
              <strong>
                {activeTab === 'queue'
                  ? filteredQueue.length
                  : activeTab === 'caseload'
                  ? filteredCaseload.length
                  : filteredRecovered.length}
              </strong>{' '}
              records in active view
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Telemetry & Bed Master Connected
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: CHART & CLINICAL PROTOCOLS */}
        <div className="space-y-8">
          {/* Risk Distribution Chart Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Risk Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">Distribution of active ED queue by ESI triage acuity.</p>
            <div className="relative flex items-center justify-center h-52">
              <canvas ref={chartRef}></canvas>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">High</span>
                <span className="text-lg font-extrabold text-red-600">{pctHigh}%</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Medium</span>
                <span className="text-lg font-extrabold text-amber-500">{pctMed}%</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Low</span>
                <span className="text-lg font-extrabold text-emerald-600">{pctLow}%</span>
              </div>
            </div>
          </div>

          {/* Ward Bed Matrix Quick Peek */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Ward Bed Availability</h4>
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                Master Matrix
              </span>
            </div>
            <div className="space-y-3 mt-4">
              {wards.map((ward) => {
                const availableCount = ward.beds.filter((b) => b.status === 'Available').length;
                return (
                  <div key={ward.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ward.name}</p>
                      <p className="text-[10px] text-slate-400">{ward.floor} • ₹{ward.tariff.toLocaleString()}/day</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold ${availableCount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {availableCount} / {ward.beds.length}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Free Beds</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE CLINICAL INTAKE, BED ALLOCATION & PRESCRIPTION MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
                  {selectedPatient.esi}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400">
                    MRN: {selectedPatient.mrn} | Age: {selectedPatient.age} | Gender: {selectedPatient.gender}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Vital Signs Telemetry */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Real-Time Vitals Telemetry
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Heart Rate</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedPatient.vitals.hr}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">BP Rate</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedPatient.vitals.bp}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SpO2</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedPatient.vitals.spo2}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Temp</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedPatient.vitals.temp}</span>
                  </div>
                </div>
              </div>

              {/* AI Risk Assessment Rationale */}
              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200/60">
                <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  AI Clinical Assessment Rationale
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedPatient.rationale}</p>
              </div>

              {/* Pathway Selector: Inpatient Admission vs Outpatient Consultation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Select Clinical Care Pathway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCarePathway('Inpatient')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      carePathway === 'Inpatient'
                        ? 'bg-red-50/70 border-red-500 ring-2 ring-red-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${carePathway === 'Inpatient' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Inpatient Ward Admission</h5>
                      <p className="text-[11px] text-slate-500">Allocate Live Master Bed & Inpatient Chart</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCarePathway('Outpatient')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      carePathway === 'Outpatient'
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${carePathway === 'Outpatient' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Outpatient Consultation</h5>
                      <p className="text-[11px] text-slate-500">Direct Prescription Authoring & Discharge</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Inpatient Bed Matrix Selection */}
              {carePathway === 'Inpatient' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Building className="w-4 h-4 text-red-600" />
                    Ward & Bed Master Allocation
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Select Target Ward / Department
                      </label>
                      <select
                        value={selectedWardId}
                        onChange={(e) => {
                          const wId = e.target.value;
                          setSelectedWardId(wId);
                          const w = wards.find((ward) => ward.id === wId);
                          const free = w?.beds.find((b) => b.status === 'Available');
                          setSelectedBedName(free ? free.name : '');
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      >
                        {wards.map((w) => {
                          const freeCount = w.beds.filter((b) => b.status === 'Available').length;
                          return (
                            <option key={w.id} value={w.id}>
                              {w.name} ({freeCount} available beds - ₹{w.tariff}/day)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Select Available Bed
                      </label>
                      <select
                        value={selectedBedName}
                        onChange={(e) => setSelectedBedName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      >
                        {availableBedsInSelectedWard.length === 0 ? (
                          <option value="">No beds currently available in this ward</option>
                        ) : (
                          availableBedsInSelectedWard.map((bed) => (
                            <option key={bed.id} value={bed.name}>
                              {bed.name} (Ready for Admission)
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Prescription Authoring Module */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
                    <Pill className="w-4 h-4 text-purple-600" />
                    Doctor Prescription Authoring Engine
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Syncs to Daily Reminders
                  </span>
                </div>

                {/* Prescription Input Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="Medication Name (e.g. Atorvastatin 20mg)"
                      value={rxDrugName}
                      onChange={(e) => setRxDrugName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="1 Tablet">1 Tablet</option>
                      <option value="2 Tablets">2 Tablets</option>
                      <option value="1 Capsule">1 Capsule</option>
                      <option value="5 ml">5 ml Syrup</option>
                      <option value="1 Injection">1 Injection</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={rxMeal}
                      onChange={(e) => setRxMeal(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={rxDuration}
                      onChange={(e) => setRxDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="3 Days">3 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="7 Days">7 Days</option>
                      <option value="14 Days">14 Days</option>
                      <option value="30 Days">30 Days</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddPrescriptionDraft}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rx</span>
                    </button>
                  </div>
                </div>

                {/* Timing Checkboxes */}
                <div className="flex items-center gap-4 text-xs font-semibold text-purple-900">
                  <span className="text-[11px] text-purple-700 font-bold uppercase">Dose Schedule:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rxTiming.morning}
                      onChange={(e) => setRxTiming({ ...rxTiming, morning: e.target.checked })}
                      className="accent-purple-600"
                    />
                    <span>Morning</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rxTiming.noon}
                      onChange={(e) => setRxTiming({ ...rxTiming, noon: e.target.checked })}
                      className="accent-purple-600"
                    />
                    <span>Afternoon</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rxTiming.night}
                      onChange={(e) => setRxTiming({ ...rxTiming, night: e.target.checked })}
                      className="accent-purple-600"
                    />
                    <span>Night</span>
                  </label>
                </div>

                {/* Authored Prescriptions Table in Modal */}
                {prescriptionsDraft.length > 0 && (
                  <div className="mt-3 bg-white rounded-xl border border-purple-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-purple-100/60 font-bold text-purple-900 border-b border-purple-200">
                        <tr>
                          <th className="py-2 px-3">Medication</th>
                          <th className="py-2 px-3">Dosage</th>
                          <th className="py-2 px-3">Schedule</th>
                          <th className="py-2 px-3">Instructions</th>
                          <th className="py-2 px-3">Duration</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100">
                        {prescriptionsDraft.map((rx) => (
                          <tr key={rx.id}>
                            <td className="py-2 px-3 font-bold text-slate-800">{rx.medication}</td>
                            <td className="py-2 px-3 text-slate-600">{rx.dosage}</td>
                            <td className="py-2 px-3 font-semibold text-purple-700">{rx.timing.join(', ')}</td>
                            <td className="py-2 px-3 text-slate-600">{rx.meal}</td>
                            <td className="py-2 px-3 text-slate-600">{rx.duration}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemovePrescriptionDraft(rx.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitClinicalAction}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>
                  {carePathway === 'Inpatient' ? 'Confirm Inpatient Admission & Prescriptions' : 'Finalize Outpatient Consultation & Dispense Rx'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK RECOVERED & BED RELEASE DISCHARGE MODAL */}
      {dischargeTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Discharge & Release Bed</h3>
                  <p className="text-xs text-emerald-100">
                    {dischargeTarget.name} ({dischargeTarget.mrn}) • {dischargeTarget.bed}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDischargeTarget(null)}
                className="text-emerald-100 hover:text-white p-1.5 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirming recovery will change the bed <strong className="text-slate-900">{dischargeTarget.bed}</strong> status back to <strong className="text-emerald-600">Available</strong> in the Hospital Ward Master.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Clinical Recovery Disposition
                </label>
                <select
                  value={dischargeDisposition}
                  onChange={(e) => setDischargeDisposition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Full Recovery - Discharged Home">Full Recovery - Discharged Home</option>
                  <option value="Symptom Resolution - Follow-Up in 48h">Symptom Resolution - Follow-Up in 48h</option>
                  <option value="Transferred to Specialty Outpatient Care">Transferred to Specialty Outpatient Care</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Physician Discharge Notes
                </label>
                <textarea
                  rows={2}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Patient vitals normalized. Ambulatory with no acute distress..."
                ></textarea>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setDischargeTarget(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDischarge}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Confirm & Free Bed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}