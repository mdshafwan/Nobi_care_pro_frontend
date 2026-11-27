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
  Check
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
    bed: 'Bed ED-02 (Orthopedic)',
    vitals: { hr: '76 bpm', bp: '138/82', spo2: '98%', temp: '98.4°F' },
    status: 'Cast Applied & Stabilized',
    assignedAt: '45 mins ago'
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
    bed: 'Bed ED-06 (Observation)',
    vitals: { hr: '72 bpm', bp: '120/78', spo2: '99%', temp: '98.6°F' },
    status: 'IV Fluids Completed - Resolving',
    assignedAt: '1 hr 15 mins ago'
  }
];

const INITIAL_RECOVERED_ARCHIVE = [
  {
    id: 'P-801',
    mrn: 'MRN-221049',
    name: 'Liam Neeson',
    diagnosis: 'Benign Paroxysmal Positional Vertigo',
    dischargeTime: '10:42 AM',
    outcome: 'Epley Maneuver Successful - Discharged'
  },
  {
    id: 'P-802',
    mrn: 'MRN-119284',
    name: 'Emma Watson',
    diagnosis: 'Mild Anaphylactoid Food Reaction',
    dischargeTime: '11:15 AM',
    outcome: 'Full Resolution Post-Antihistamine'
  },
  {
    id: 'P-803',
    mrn: 'MRN-339210',
    name: 'Julian Vance',
    diagnosis: 'Acute Corneal Abrasion',
    dischargeTime: '12:05 PM',
    outcome: 'Erythromycin Ointment Applied - Discharged'
  }
];

export default function DoctorTriagePage() {
  const [incomingQueue, setIncomingQueue] = useState(INITIAL_INCOMING_QUEUE);
  const [myCaseload, setMyCaseload] = useState(INITIAL_MY_CASELOAD);
  const [recoveredArchive, setRecoveredArchive] = useState(INITIAL_RECOVERED_ARCHIVE);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'caseload' | 'recovered'
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('Just now');

  // Modals state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedBed, setSelectedBed] = useState('Bed ED-03 (Rapid Assessment)');
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [dischargeDisposition, setDischargeDisposition] = useState('Full Recovery - Discharged Home');
  const [dischargeNotes, setDischargeNotes] = useState('');

  // Toast state
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

  // Sync Telemetry
  const refreshTriageData = () => {
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    showToast('Telemetry stream synchronized with hospital EHR');
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

  // Handle Bed Assignment
  const handleAssignToCaseload = () => {
    if (!selectedPatient) return;

    setIncomingQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));
    setMyCaseload((prev) => [
      {
        ...selectedPatient,
        bed: selectedBed,
        status: 'Under Active Evaluation',
        assignedAt: 'Just now',
      },
      ...prev,
    ]);

    const patientName = selectedPatient.name;
    setSelectedPatient(null);
    showToast(`${patientName} assigned to ${selectedBed}`);

    setTimeout(() => {
      setActiveTab('caseload');
    }, 400);
  };

  // Handle Mark Recovered & Discharge
  const handleConfirmDischarge = () => {
    if (!dischargeTarget) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMyCaseload((prev) => prev.filter((p) => p.id !== dischargeTarget.id));
    setRecoveredArchive((prev) => [
      {
        id: dischargeTarget.id,
        mrn: dischargeTarget.mrn,
        name: dischargeTarget.name,
        diagnosis: dischargeTarget.complaint,
        dischargeTime: now,
        outcome: dischargeDisposition,
      },
      ...prev,
    ]);

    const patientName = dischargeTarget.name;
    setDischargeTarget(null);
    setDischargeNotes('');
    showToast(`${patientName} marked as Recovered & Discharged`);
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
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.complaint.toLowerCase().includes(query);
    return matchesRisk && matchesSearch;
  });

  const filteredCaseload = myCaseload.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.bed.toLowerCase().includes(query)
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
            Module 1 • Emergency Triage Engine
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Emergency Triage & Active Clinical Caseload
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time acuity prioritization, physician bed assignment, and patient recovery discharge.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshTriageData}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-slate-500" />
            Sync Telemetry
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
            <span className="text-xs font-semibold text-slate-500">Under My Care</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Assigned to Dr. Sarah Jenkins</p>
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

        {/* KPI 4: Recovered Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recovered Today</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{recoveredArchive.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Discharged</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Successful clinical resolutions</p>
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
                <UserCheck className="w-4 h-4 text-emerald-600" />
                My Assigned Caseload ({myCaseload.length})
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

            {/* Filter Pills (Active for Incoming Queue) */}
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
                    <th className="py-3.5 px-6 text-right">Action</th>
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
                          onClick={() => setSelectedPatient(patient)}
                          className="hover:bg-slate-50/80 transition cursor-pointer group"
                        >
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                              {patient.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {patient.mrn} • {patient.age}y/o {patient.gender}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs font-semibold text-slate-700 max-w-xs truncate">
                              {patient.complaint}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
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
                            <button className="px-3.5 py-1.5 bg-slate-100 group-hover:bg-red-600 group-hover:text-white text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer">
                              Review / Assign
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
                  Active caseload assigned to Dr. Sarah Jenkins. Mark complete upon recovery to clear bed status.
                </div>
                <span className="text-xs font-semibold text-slate-500">Live Bed Monitoring</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Assigned Patient</th>
                    <th className="py-3.5 px-4">Bed & Telemetry</th>
                    <th className="py-3.5 px-4">Treatment Status</th>
                    <th className="py-3.5 px-6 text-right">Clinical Outcome Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredCaseload.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No active patients currently assigned to your caseload. Review incoming triage queue to assign beds.
                      </td>
                    </tr>
                  ) : (
                    filteredCaseload.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {p.mrn} • {p.age}y/o {p.gender}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {p.bed}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            HR: {p.vitals.hr} | BP: {p.vitals.bp} | SpO2: {p.vitals.spo2}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {p.status}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">Assigned {p.assignedAt}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setDischargeTarget(p)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Mark Recovered
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
                    <th className="py-3.5 px-4 text-center">Discharge Time</th>
                    <th className="py-3.5 px-6 text-right">Recovery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredRecovered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No discharge records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecovered.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{p.mrn}</div>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-700">{p.diagnosis}</td>
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
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Telemetry Stream Connected
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: CHART & CLINICAL PROTOCOLS */}
        <div className="space-y-8">
          {/* Risk Distribution Chart Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Risk Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">Distribution of active ED queue by ESI triage acuity.</p>
            <div className="relative flex items-center justify-center h-60">
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

          {/* Physician Quick Actions Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-bold">
                MD
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Attending Physician Protocol</h4>
                <p className="text-[11px] text-slate-400">Dr. Sarah Jenkins • Shift #481</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Once patient vitals normalize and clinical stabilization is reached, use{' '}
              <span className="text-emerald-400 font-semibold">Mark Recovered</span> to clear bed occupancy and initiate post-discharge telemetry.
            </p>
            <button
              onClick={() => setActiveTab('caseload')}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-red-400" />
              Review My Active Caseload
            </button>
          </div>
        </div>
      </div>

      {/* PATIENT DETAIL & BED ASSIGNMENT MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
                  ESI
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

            <div className="p-6 space-y-6">
              {/* Vital Signs Bar */}
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
                  AI Risk Assessment Rationale
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedPatient.rationale}</p>
              </div>

              {/* Bed Allocation & Override Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Allocate ED Bed / Bay
                  </label>
                  <select
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="Bed ED-01 (Trauma Bay)">Bed ED-01 (Trauma Bay)</option>
                    <option value="Bed ED-03 (Rapid Assessment)">Bed ED-03 (Rapid Assessment)</option>
                    <option value="Bed ED-05 (Cardiac Monitored)">Bed ED-05 (Cardiac Monitored)</option>
                    <option value="Bed ED-07 (General Observation)">Bed ED-07 (General Observation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Physician Acuity Override
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('Acuity level adjusted to ESI 1')}
                      className="py-2 border border-red-300 rounded-xl text-[11px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition text-center cursor-pointer"
                    >
                      ESI 1
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Acuity level adjusted to ESI 2')}
                      className="py-2 border border-amber-300 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-center cursor-pointer"
                    >
                      ESI 2
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Acuity level adjusted to ESI 3')}
                      className="py-2 border border-blue-300 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-center cursor-pointer"
                    >
                      ESI 3
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToCaseload}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign to My Caseload</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK RECOVERED & DISCHARGE MODAL */}
      {dischargeTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Confirm Patient Recovery & Discharge</h3>
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
                By confirming, you certify that the patient's acute symptoms have resolved, vital signs are stabilized within normal limits, and outpatient care instructions have been finalized.
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
                  <option value="Stabilized - Transferred to Inpatient Ward">Stabilized - Transferred to Inpatient Ward</option>
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
                Mark Recovered & Discharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}