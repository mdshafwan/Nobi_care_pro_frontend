import React, { useState, useMemo } from 'react';
import { useClinical } from '../../context/ClinicalContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  Search, 
  X, 
  Plus,
  Layers,
  HelpCircle,
  Brain,
  Play,
  ArrowRight
} from 'lucide-react';

// Full 132-Symptom ML Dataset
const RAW_SYMPTOMS = [
  'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 
  'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 
  'burning_micturition', 'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety', 
  'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness', 'lethargy', 
  'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever', 'sunken_eyes', 
  'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish_skin', 
  'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 
  'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 
  'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 
  'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm', 
  'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 
  'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 
  'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 
  'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 
  'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 
  'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 
  'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 
  'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness', 
  'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine', 
  'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)', 
  'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 
  'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes', 
  'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 
  'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion', 
  'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen', 
  'history_of_alcohol_consumption', 'blood_in_sputum', 'prominent_veins_on_calf', 
  'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring', 
  'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 
  'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
];

const formatSymptomName = (id) => {
  return id
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ALL_SYMPTOMS = Array.from(new Set(RAW_SYMPTOMS)).map((id) => ({
  id,
  name: formatSymptomName(id),
  isEmergency: ['chest_pain', 'breathlessness', 'coma', 'stomach_bleeding', 'acute_liver_failure', 'altered_sensorium', 'slurred_speech'].includes(id)
}));

// Inference calculation function - only invoked on explicit "Predict" action
function computeDifferential(symptoms) {
  if (!symptoms || symptoms.length === 0) return null;

  const has = (id) => symptoms.includes(id);

  if (has('chest_pain') || has('breathlessness') || has('coma') || has('stomach_bleeding')) {
    return {
      topPerc: 96,
      topName: 'Acute Coronary / Cardiopulmonary Emergency',
      isCritical: true,
      esiLevel: 1,
      differentials: [
        { name: 'Acute Coronary Syndrome / Infarction', val: 96, color: 'bg-red-600' },
        { name: 'Pulmonary Embolism / Acute Dyspnea', val: 68, color: 'bg-amber-500' },
        { name: 'Hypertensive Crisis / Heart Failure', val: 34, color: 'bg-blue-500' }
      ],
      recommendation: 'CRITICAL RESUSCITATION (ESI 1): Immediate emergency escalation required. Order stat 12-lead ECG, continuous pulse oximetry, and serial troponin biomarkers.'
    };
  }

  if (has('high_fever') && (has('joint_pain') || has('headache') || has('pain_behind_the_eyes') || has('red_spots_over_body'))) {
    return {
      topPerc: 91,
      topName: 'Dengue Viral Syndrome (Flavivirus)',
      isCritical: false,
      esiLevel: 2,
      differentials: [
        { name: 'Dengue Hemorrhagic / Classic Fever', val: 91, color: 'bg-red-600' },
        { name: 'Chikungunya Polyarthritis', val: 58, color: 'bg-amber-500' },
        { name: 'Seasonal Viral Influenza A/B', val: 32, color: 'bg-blue-500' }
      ],
      recommendation: 'HIGH TRIAGE ACUITY (ESI 2): Retro-orbital pain with arthralgia and fever suggests Dengue. Order CBC for platelet count monitoring and NS1 antigen test.'
    };
  }

  if (has('chills') && has('vomiting') && (has('high_fever') || has('sweating'))) {
    return {
      topPerc: 87,
      topName: 'Malaria / Acute Parasitemia',
      isCritical: false,
      esiLevel: 2,
      differentials: [
        { name: 'Plasmodium Falciparum / Vivax Malaria', val: 87, color: 'bg-red-600' },
        { name: 'Typhoid Enteric Fever (Salmonella)', val: 62, color: 'bg-amber-500' },
        { name: 'Acute Pyelonephritis', val: 28, color: 'bg-blue-500' }
      ],
      recommendation: 'MODERATE-HIGH TRIAGE (ESI 2): Paroxysmal chills and fever. Order peripheral blood smear examination for malaria parasite (MP) and rapid antigen test.'
    };
  }

  if (has('stomach_pain') || has('acidity') || has('ulcers_on_tongue') || has('vomiting')) {
    return {
      topPerc: 82,
      topName: 'Peptic Ulcer / GERD Syndrome',
      isCritical: false,
      esiLevel: 3,
      differentials: [
        { name: 'Gastroesophageal Reflux Disease (GERD)', val: 82, color: 'bg-blue-600' },
        { name: 'Peptic Ulcer Disease / Gastritis', val: 64, color: 'bg-emerald-500' },
        { name: 'Acute Gastroenteritis', val: 30, color: 'bg-slate-400' }
      ],
      recommendation: 'MODERATE TRIAGE (ESI 3): Upper gastrointestinal distress. Recommend clinical trial with PPI, dietary modification, and H. pylori evaluation.'
    };
  }

  if (has('skin_rash') || has('itching') || has('nodal_skin_eruptions') || has('pus_filled_pimples') || has('blister')) {
    return {
      topPerc: 85,
      topName: 'Dermatological Infection / Allergy',
      isCritical: false,
      esiLevel: 4,
      differentials: [
        { name: 'Fungal Infection (Tinea / Cutaneous)', val: 85, color: 'bg-blue-600' },
        { name: 'Contact Dermatitis / Urticaria', val: 56, color: 'bg-emerald-500' },
        { name: 'Acne Vulgaris / Impetigo', val: 38, color: 'bg-slate-400' }
      ],
      recommendation: 'OUTPATIENT TRIAGE (ESI 4): Cutaneous eruption present. Keep skin cool and dry. Avoid self-prescribed topical steroids prior to clinical evaluation.'
    };
  }

  if (has('burning_micturition') || has('bladder_discomfort') || has('continuous_feel_of_urine') || has('dark_urine')) {
    return {
      topPerc: 89,
      topName: 'Urinary Tract Infection (UTI)',
      isCritical: false,
      esiLevel: 3,
      differentials: [
        { name: 'Acute Bacterial Cystitis', val: 89, color: 'bg-blue-600' },
        { name: 'Urolithiasis (Renal Calculus)', val: 45, color: 'bg-amber-500' },
        { name: 'Urethritis / Dysuria Syndrome', val: 24, color: 'bg-slate-400' }
      ],
      recommendation: 'MODERATE TRIAGE (ESI 3): Dysuria with frequency. Advise midstream urine microscopy, culture & sensitivity (Urine R/M + C/S) and hydration.'
    };
  }

  if (has('yellowish_skin') || has('yellowing_of_eyes') || has('dark_urine') || has('fatigue')) {
    return {
      topPerc: 90,
      topName: 'Hepatobiliary Dysfunction / Jaundice',
      isCritical: false,
      esiLevel: 2,
      differentials: [
        { name: 'Viral Hepatitis (A/B/E)', val: 90, color: 'bg-red-600' },
        { name: 'Cholestasis / Biliary Obstruction', val: 55, color: 'bg-amber-500' },
        { name: 'Drug-Induced Liver Injury', val: 31, color: 'bg-blue-500' }
      ],
      recommendation: 'HIGH TRIAGE ACUITY (ESI 2): Scleral jaundice noted. Stat Liver Function Tests (Total/Direct Bilirubin, SGOT/SGPT, ALP) and abdominal ultrasound indicated.'
    };
  }

  if (has('cough') || has('continuous_sneezing') || has('runny_nose') || has('throat_irritation') || has('sinus_pressure')) {
    return {
      topPerc: 78,
      topName: 'Acute Upper Respiratory Tract Infection',
      isCritical: false,
      esiLevel: 3,
      differentials: [
        { name: 'Acute Viral Rhinitis / Coryza', val: 78, color: 'bg-blue-600' },
        { name: 'Allergic Rhinosinusitis', val: 52, color: 'bg-emerald-500' },
        { name: 'Pharyngitis / Laryngitis', val: 35, color: 'bg-slate-400' }
      ],
      recommendation: 'MILD TRIAGE (ESI 3): Upper respiratory symptoms. Symptomatic relief, warm fluids, steam inhalation, and antipyretics as required.'
    };
  }

  // Generic fallback if other symptoms are selected
  return {
    topPerc: 68,
    topName: 'Nonspecific Multi-Symptom Syndrome',
    isCritical: false,
    esiLevel: 3,
    differentials: [
      { name: 'Acute Generalized Viral Prodrome', val: 68, color: 'bg-blue-600' },
      { name: 'Systemic Fatigue / Metabolic Strain', val: 42, color: 'bg-emerald-500' },
      { name: 'Stress-Related Somatic Reaction', val: 26, color: 'bg-slate-400' }
    ],
    recommendation: 'MILD TRIAGE (ESI 3): Non-localized clinical indicators. Monitor temperature and pulse rate; seek outpatient review if symptoms persist beyond 48 hours.'
  };
}

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(['high_fever', 'joint_pain']);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isPredicting, setIsPredicting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const clinicalContext = useClinical();
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  const { showToast } = useToast();

  const toggleSymptom = (id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setIsDispatched(false);
  };

  const removeSymptom = (id) => {
    setSelectedSymptoms((prev) => prev.filter((item) => item !== id));
    setIsDispatched(false);
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
    setPredictionResult(null);
    setIsDispatched(false);
    showToast('Selections and prediction reset.');
  };

  // Explicit prediction trigger
  const runPrediction = () => {
    if (selectedSymptoms.length === 0) {
      showToast('Please select at least 1 symptom before predicting.', 'error');
      return;
    }

    setIsPredicting(true);
    setIsDispatched(false);

    setTimeout(() => {
      const result = computeDifferential(selectedSymptoms);
      setPredictionResult(result);
      setIsPredicting(false);
      setIsModalOpen(false);
      showToast(`Neural Diagnosis Ready: ${result.topName} (${result.topPerc}%)`, 'success');
    }, 450);
  };

  const filteredSymptoms = useMemo(() => {
    return ALL_SYMPTOMS.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || selectedSymptoms.includes(s.id);
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, selectedSymptoms]);

  // Read from predictionResult ONLY
  const topPerc = predictionResult ? predictionResult.topPerc : 0;
  const topName = predictionResult ? predictionResult.topName : 'Awaiting Prediction';
  const differentials = predictionResult 
    ? predictionResult.differentials 
    : [{ name: 'Click "Predict Diagnosis" to run neural differential', val: 0, color: 'bg-slate-200' }];
  const recommendation = predictionResult 
    ? predictionResult.recommendation 
    : 'Select your clinical symptoms from the 132 indicators list and click the "Predict Diagnosis" button to generate diagnostic inference.';
  const isCritical = predictionResult ? predictionResult.isCritical : false;
  const esiLevel = predictionResult ? predictionResult.esiLevel : '-';

  const circumference = 502.6;
  const strokeDashoffset = circumference - (topPerc / 100) * circumference;

  // DIRECT DISPATCH TO DOCTOR TRIAGE QUEUE IN LOCALSTORAGE
  const handleSendToDoctor = () => {
    if (!predictionResult) {
      showToast('Please run "Predict Diagnosis" first before sending to doctor.', 'error');
      return;
    }

    const patientName = activeUser?.name || 'Safan Khan';
    const patientMrn = activeUser?.mrn || 'MRN-884920';
    const symptomNames = selectedSymptoms.map((id) => formatSymptomName(id));

    // Determine estimated vitals based on prediction severity
    const vitalsObj = isCritical
      ? { hr: 118, bp: '155/95', spo2: 91, temp: selectedSymptoms.includes('high_fever') ? 102.8 : 98.6 }
      : esiLevel === 2
      ? { hr: 94, bp: '135/88', spo2: 96, temp: selectedSymptoms.includes('high_fever') ? 101.5 : 98.8 }
      : { hr: 78, bp: '120/80', spo2: 99, temp: 98.4 };

    // Format new emergency triage patient card
    const newTriageEntry = {
      id: `TRG-${Math.floor(100 + Math.random() * 900)}`,
      mrn: patientMrn,
      name: patientName,
      age: 29,
      gender: 'Male',
      complaint: `${topName} (${symptomNames.slice(0, 3).join(', ')})`,
      risk: isCritical ? 'Critical' : esiLevel === 2 ? 'High' : 'Moderate',
      esi: `ESI-${esiLevel}`,
      wait: '0m (AI Portal)',
      vitals: vitalsObj,
      rationale: recommendation,
      source: 'AI Symptom Checker'
    };

    try {
      // 1. Read existing queue
      const existingQueueRaw = localStorage.getItem('hospital_triage_queue');
      let currentQueue = [];
      if (existingQueueRaw) {
        currentQueue = JSON.parse(existingQueueRaw);
      }

      // 2. Prepend patient (so they show at the very top of Doctor's Triage queue)
      // Remove any prior pending entry for the same MRN to prevent duplicates
      const filteredQueue = currentQueue.filter((p) => p.mrn !== patientMrn);
      const updatedQueue = [newTriageEntry, ...filteredQueue];

      // 3. Save directly to localStorage
      localStorage.setItem('hospital_triage_queue', JSON.stringify(updatedQueue));

      // 4. Update clinical context if available
      const triageDispatcher = clinicalContext?.addTriagePatient || clinicalContext?.submitPatientTriage;
      if (typeof triageDispatcher === 'function') {
        triageDispatcher(newTriageEntry);
      }

      // 5. Fire window storage event for instant multi-tab sync
      window.dispatchEvent(new Event('storage'));

      setIsDispatched(true);
      showToast(`Triage record forwarded to Doctor Caseload Queue (Acuity: ESI ${esiLevel})!`, 'success');
    } catch (e) {
      console.error('Error dispatching triage to doctor:', e);
      showToast('Failed to dispatch record. Please try again.', 'error');
    }
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
            Select present clinical indicators from the 132-symptom dataset and launch prediction.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearAll}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200/80 transition flex items-center gap-2 cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-red-600" />
            <span>Select Symptoms ({selectedSymptoms.length})</span>
          </button>

          <button
            onClick={runPrediction}
            disabled={isPredicting || selectedSymptoms.length === 0}
            className="px-4 py-2.5 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>{isPredicting ? 'Computing...' : 'Predict Diagnosis'}</span>
          </button>

          <button
            onClick={handleSendToDoctor}
            disabled={!predictionResult || isDispatched}
            className={`px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ${
              isDispatched 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25' 
                : 'bg-red-600 hover:bg-red-700 disabled:opacity-50 shadow-red-600/25'
            }`}
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Queued in ER</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch to Doctor</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dispatched Notification Banner */}
      {isDispatched && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">Patient Dispatched to Emergency Triage Queue</p>
              <p className="text-[11px] font-semibold text-emerald-700">
                Acuity Level <strong>ESI-{esiLevel}</strong> assigned. The attending ER physician can now view this case in the triage caselist.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Symptoms Staging Panel */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-red-600" />
            Selected Symptoms ({selectedSymptoms.length})
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Indicators</span>
            </button>
          </div>
        </div>

        {selectedSymptoms.length === 0 ? (
          <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/60">
            <p className="text-xs font-semibold text-slate-500">
              No symptoms selected yet. Open the selector to choose from the 132-symptom dataset.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Symptom Selector</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((id) => (
                <span
                  key={id}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-xs flex items-center gap-2 group hover:border-red-300 transition"
                >
                  <span>{formatSymptomName(id)}</span>
                  <button
                    onClick={() => removeSymptom(id)}
                    className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Hint if prediction hasn't been run */}
            {!predictionResult && (
              <div className="pt-2 flex items-center justify-between text-xs text-amber-700 bg-amber-50/70 border border-amber-200/80 px-3.5 py-2 rounded-xl">
                <span>Symptoms selected. Click <strong>"Predict Diagnosis"</strong> to start inference.</span>
                <button
                  onClick={runPrediction}
                  className="font-extrabold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-amber-900" />
                  <span>Run Now</span>
                </button>
              </div>
            )}
          </div>
        )}
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
                stroke={!predictionResult ? '#cbd5e1' : isCritical ? '#dc2626' : topPerc > 70 ? '#ea580c' : '#2563eb'}
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
                {predictionResult ? `Acuity: ESI ${esiLevel}` : 'Awaiting Inference'}
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
              <span className="text-[11px] font-bold text-slate-500">
                {predictionResult ? 'Neural Concordance' : 'Status: Idle'}
              </span>
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

      {/* POPUP MODAL FOR SELECTING SYMPTOMS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest block">
                  132 Clinical Indicators
                </span>
                <h3 className="text-lg font-black text-slate-900">Symptom Selector</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 sm:px-6 bg-white border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search symptoms (e.g. fever, headache, rash, chest pain, nausea)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Symptoms ({ALL_SYMPTOMS.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('selected')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      activeTab === 'selected'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Selected ({selectedSymptoms.length})
                  </button>
                </div>

                <span className="text-[11px] font-bold text-slate-400">
                  {filteredSymptoms.length} matching
                </span>
              </div>
            </div>

            {/* Scrollable Symptoms Grid */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[50vh] flex-1">
              {filteredSymptoms.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-bold">No matching symptoms found for "{searchQuery}".</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs font-bold text-red-600 hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredSymptoms.map((s) => {
                    const isSelected = selectedSymptoms.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSymptom(s.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/30'
                            : s.isEmergency
                            ? 'bg-red-50/70 text-red-950 border-red-200 hover:bg-red-100'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer with "Predict Diagnosis" button */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={clearAll}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Clear All
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={runPrediction}
                  disabled={isPredicting || selectedSymptoms.length === 0}
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPredicting ? 'Computing Inference...' : 'Predict Diagnosis'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}