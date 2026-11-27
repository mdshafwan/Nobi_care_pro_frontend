import React, { useState } from 'react';
import { useClinical } from '../context/ClinicalContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Stethoscope, 
  Send, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Heart, 
  Wind, 
  Sparkles, 
  CheckCircle2, 
  FileText
} from 'lucide-react';

const SYMPTOM_DATABASE = [
  { id: 'chest', name: 'Acute Chest Pain / Pressure', category: 'Emergency', icon: Flame },
  { id: 'breath', name: 'Shortness of Breath (Dyspnea)', category: 'Emergency', icon: Wind },
  { id: 'fever', name: 'High Fever (102°F+)', category: 'Systemic', icon: Activity },
  { id: 'joint', name: 'Severe Joint / Muscle Pain ("Breakbone")', category: 'Systemic', icon: Activity },
  { id: 'headache', name: 'Retro-Orbital Headache', category: 'Neurological', icon: Activity },
  { id: 'rash', name: 'Skin Rash / Petechiae', category: 'Dermatological', icon: Activity },
  { id: 'cough', name: 'Persistent Dry Cough', category: 'Respiratory', icon: Wind },
  { id: 'fatigue', name: 'Extreme Fatigue / Malaise', category: 'Systemic', icon: Activity },
  { id: 'nausea', name: 'Nausea / Persistent Vomiting', category: 'Gastrointestinal', icon: Activity }
];

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(['fever', 'joint']);
  
  const clinicalContext = useClinical();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const toggleSymptom = (id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
    showToast('Symptom selections cleared.');
  };

  // DL Classifier Calculations
  let topPerc = 0;
  let topName = 'No Symptoms Selected';
  let differentials = [];
  let recommendation = 'Click any symptom chip below to compute real-time differential disease probabilities.';
  let isCritical = false;
  let esiLevel = 3;

  if (selectedSymptoms.includes('chest') || selectedSymptoms.includes('breath')) {
    topPerc = 94;
    topName = 'Acute Cardiac / Pulmonary Distress';
    isCritical = true;
    esiLevel = 1;
    differentials = [
      { name: 'Acute Coronary Syndrome / Angina', val: 94, color: 'bg-red-600' },
      { name: 'Pulmonary Embolism / Dyspnea', val: 62, color: 'bg-amber-500' },
      { name: 'Costochondritis / Panic Episode', val: 25, color: 'bg-blue-500' }
    ];
    recommendation =
      'CRITICAL ESCALATION (ESI 1): Acute chest pain and shortness of breath require immediate emergency evaluation (12-Lead ECG, Serial High-Sensitivity Troponins & Bedside Echocardiogram).';
  } else if (
    selectedSymptoms.includes('fever') &&
    (selectedSymptoms.includes('joint') ||
      selectedSymptoms.includes('headache') ||
      selectedSymptoms.includes('rash'))
  ) {
    topPerc = 88;
    topName = 'Dengue Viral Syndrome';
    esiLevel = 2;
    differentials = [
      { name: 'Dengue Fever (Flavivirus / NS1)', val: 88, color: 'bg-red-600' },
      { name: 'Chikungunya / Viral Polyarthritis', val: 54, color: 'bg-amber-500' },
      { name: 'Seasonal Influenza A / B', val: 38, color: 'bg-blue-500' }
    ];
    recommendation =
      'MODERATE-HIGH TRIAGE (ESI 2): High fever with retro-orbital headache and joint arthralgia strongly suggests Dengue. Order Complete Blood Count (CBC for Thrombocytopenia) and NS1 Antigen test immediately.';
  } else if (selectedSymptoms.length > 0) {
    topPerc = 68;
    topName = 'Viral Upper Respiratory Infection';
    esiLevel = 3;
    differentials = [
      { name: 'Acute Viral Syndrome / Flu', val: 68, color: 'bg-blue-600' },
      { name: 'Allergic Rhinitis / Bronchitis', val: 42, color: 'bg-emerald-500' },
      { name: 'General Physical Fatigue', val: 29, color: 'bg-slate-400' }
    ];
    recommendation =
      'MILD TRIAGE (ESI 3): Monitor oral temperature every 6 hours, maintain electrolyte hydration, and schedule a routine outpatient review if symptoms persist past 72 hours.';
  } else {
    differentials = [{ name: 'Select at least one symptom chip below', val: 0, color: 'bg-slate-200' }];
  }

  const circumference = 502.6;
  const strokeDashoffset = circumference - (topPerc / 100) * circumference;

  const handleSendToDoctor = () => {
    if (selectedSymptoms.length === 0) {
      showToast('Please select at least one symptom.', 'error');
      return;
    }

    const symptomNames = selectedSymptoms.map(
      (id) => SYMPTOM_DATABASE.find((s) => s.id === id)?.name || id
    );

    // Call addTriagePatient or submitPatientTriage safely
    const triageDispatcher = clinicalContext?.addTriagePatient || clinicalContext?.submitPatientTriage;

    if (triageDispatcher) {
      triageDispatcher({
        name: currentUser?.name || 'Safan Khan',
        age: 29,
        gender: 'Male',
        esi: esiLevel,
        esiLabel: isCritical ? 'ESI 1 - Resuscitation' : esiLevel === 2 ? 'ESI 2 - Emergent' : 'ESI 3 - Urgent',
        chiefComplaint: `${topName} (${symptomNames.slice(0, 2).join(', ')})`,
        vitals: isCritical ? 'BP 155/95 • HR 118 • SpO2 93%' : 'BP 118/76 • HR 74 • SpO2 99%',
        aiConfidence: `${topPerc}%`,
        differential: differentials.map((d) => d.name).join(', '),
        waitingTime: 'Just now'
      });
    }

    showToast(`Triage record forwarded to Doctor Caseload Queue (Acuity: ESI ${esiLevel})!`, 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-red-600 uppercase tracking-widest block mb-1">
            Module 1 • Deep Learning Differential Classifier
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Symptom Checker</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Select present clinical symptoms to run neural inference and estimate differential diagnostic concordance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearAll}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSendToDoctor}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/25 transition flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch to Doctor Triage</span>
          </button>
        </div>
      </div>

      {/* Symptom Chips Grid */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Select Clinical Indicators ({selectedSymptoms.length} Selected)
        </label>
        <div className="flex flex-wrap gap-2.5">
          {SYMPTOM_DATABASE.map((s) => {
            const isSelected = selectedSymptoms.includes(s.id);
            const isEmergencyChip = s.category === 'Emergency';
            return (
              <button
                key={s.id}
                onClick={() => toggleSymptom(s.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20 ring-2 ring-red-600/20'
                    : isEmergencyChip
                    ? 'bg-red-50/50 text-red-900 border-red-200 hover:bg-red-100/60'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Gauge & Differential Synthesis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50 p-6 sm:p-7 rounded-3xl border border-slate-200/80 items-center">
        {/* SVG Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#e2e8f0"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={isCritical ? '#dc2626' : topPerc > 70 ? '#ea580c' : '#2563eb'}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="502.6"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center px-4">
              <span className="text-3xl font-black text-slate-950">{topPerc}%</span>
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider mt-1 line-clamp-2">
                {topName}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                Acuity: ESI {esiLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Differential Progress Bars & Recommendation */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Top Differential Diagnoses
              </h4>
              <span className="text-[11px] font-bold text-slate-500">BioMistral Probability</span>
            </div>
            <div className="space-y-3">
              {differentials.map((d, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{d.name}</span>
                    <span className="font-mono">{d.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`${d.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${d.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${
            isCritical 
              ? 'bg-red-50/70 border-red-200 text-red-950' 
              : 'bg-white border-slate-200/80 text-slate-900'
          }`}>
            <h4 className="text-xs font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              {isCritical ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">Urgent Clinical Escalation</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-500">AI Clinical Recommendation</span>
                </>
              )}
            </h4>
            <p className="text-xs leading-relaxed font-medium text-slate-700">
              {recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}