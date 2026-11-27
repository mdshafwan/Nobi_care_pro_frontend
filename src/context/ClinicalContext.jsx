import React, { createContext, useContext, useState } from "react";

const ClinicalContext = createContext(null);

const INITIAL_TRIAGE_QUEUE = [
  {
    id: "PAT-1001",
    name: "Safan Khan",
    age: 30,
    gender: "Male",
    esiLevel: "ESI-2 (Emergent)",
    chiefComplaint: "Substernal chest tightness & resting dyspnea",
    arrivedAt: "10 mins ago",
    aiConfidence: "94.6%",
    severity: "high",
    vitals: { hr: "112 bpm", bp: "148/92", spo2: "94%", temp: "99.1 °F" }
  },
  {
    id: "PAT-1002",
    name: "Elena Rostova",
    age: 44,
    gender: "Female",
    esiLevel: "ESI-3 (Urgent)",
    chiefComplaint: "Acute lower abdominal quadrant pain with vomiting",
    arrivedAt: "24 mins ago",
    aiConfidence: "89.2%",
    severity: "moderate",
    vitals: { hr: "88 bpm", bp: "128/84", spo2: "98%", temp: "100.8 °F" }
  },
  {
    id: "PAT-1003",
    name: "Marcus Vance",
    age: 62,
    gender: "Male",
    esiLevel: "ESI-1 (Resuscitation)",
    chiefComplaint: "Sudden unilateral facial droop & expressive aphasia",
    arrivedAt: "4 mins ago",
    aiConfidence: "98.1%",
    severity: "critical",
    vitals: { hr: "98 bpm", bp: "182/104", spo2: "92%", temp: "98.6 °F" }
  }
];

const INITIAL_ADMITTED = [
  {
    id: "PAT-0982",
    name: "David Chen",
    age: 51,
    gender: "Male",
    bedAssigned: "ICU-Bed-02 (Vent)",
    chiefComplaint: "Post-STEMI stabilization",
    admittedAt: "Yesterday, 18:40",
    vitals: { hr: "72 bpm", bp: "118/74", spo2: "99%", temp: "98.4 °F" }
  },
  {
    id: "PAT-0977",
    name: "Amina Al-Mansoor",
    age: 28,
    gender: "Female",
    bedAssigned: "ER Bay — Bay-02",
    chiefComplaint: "Acute severe asthma exacerbation",
    admittedAt: "Today, 06:15",
    vitals: { hr: "84 bpm", bp: "120/78", spo2: "97%", temp: "98.7 °F" }
  }
];

const INITIAL_APPROVAL_ITEMS = [
  {
    id: "SAMD-8821",
    patientId: "PAT-1001",
    patientName: "Safan Khan",
    assertion: "Unstable Angina vs Non-ST Myocardial Infarction",
    confidence: 94.6,
    riskLevel: "High Priority",
    timestamp: "12 mins ago",
    suggestedRx: {
      name: "Atorvastatin & Aspirin Protocol",
      dosage: "80 mg / 81 mg",
      frequency: "Immediate stat dose"
    },
    differentials: [
      { name: "Acute Coronary Syndrome", probability: 78 },
      { name: "Myopericarditis", probability: 14 },
      { name: "Gastroesophageal Spasm", probability: 8 }
    ],
    status: "pending"
  },
  {
    id: "SAMD-8822",
    patientId: "PAT-1002",
    patientName: "Elena Rostova",
    assertion: "Acute Appendicitis with Localized Peritoneal Irritation",
    confidence: 89.2,
    riskLevel: "Emergent",
    timestamp: "28 mins ago",
    suggestedRx: {
      name: "Ceftriaxone IV + Metronidazole",
      dosage: "1g IV / 500mg IV",
      frequency: "Single pre-op loading dose"
    },
    differentials: [
      { name: "Acute Appendicitis", probability: 84 },
      { name: "Ovarian Cyst Rupture", probability: 11 },
      { name: "Mesenteric Adenitis", probability: 5 }
    ],
    status: "pending"
  }
];

const INITIAL_MEDICATIONS = [
  {
    id: "med-1",
    name: "Metformin XR",
    dosage: "500 mg",
    frequency: "Once daily with dinner",
    prescribedBy: "Dr. Sarah Jenkins",
    adherence: 95,
    status: "Active",
    remainingDays: 24
  },
  {
    id: "med-2",
    name: "Lisinopril",
    dosage: "10 mg",
    frequency: "Once every morning",
    prescribedBy: "Dr. Sarah Jenkins",
    adherence: 88,
    status: "Active",
    remainingDays: 18
  },
  {
    id: "med-3",
    name: "Atorvastatin",
    dosage: "20 mg",
    frequency: "Once daily at bedtime",
    prescribedBy: "Dr. Sarah Jenkins",
    adherence: 92,
    status: "Active",
    remainingDays: 30
  }
];

const SAMPLE_LAB_PANELS = [
  {
    id: "panel-1",
    title: "Comprehensive Metabolic & Lipid Panel",
    date: "March 18, 2025",
    patientId: "PAT-1001",
    patientName: "Safan Khan",
    summary:
      "Elevation in total cholesterol and LDL particle density with borderline fasting blood glucose. Renal clearance markers remain within normal homeostatic limits.",
    biomarkers: [
      { name: "Total Cholesterol", value: 238, unit: "mg/dL", referenceRange: "< 200", flag: "high", relativeIndex: 119 },
      { name: "LDL Cholesterol", value: 162, unit: "mg/dL", referenceRange: "< 100", flag: "high", relativeIndex: 162 },
      { name: "HDL Cholesterol", value: 44, unit: "mg/dL", referenceRange: "> 40", flag: "normal", relativeIndex: 90 },
      { name: "Triglycerides", value: 185, unit: "mg/dL", referenceRange: "< 150", flag: "elevated", relativeIndex: 123 },
      { name: "Fasting Glucose", value: 118, unit: "mg/dL", referenceRange: "70 - 99", flag: "elevated", relativeIndex: 119 },
      { name: "Serum Creatinine", value: 0.95, unit: "mg/dL", referenceRange: "0.7 - 1.3", flag: "normal", relativeIndex: 73 }
    ]
  },
  {
    id: "panel-2",
    title: "Glycemic & Renal Screening Panel",
    date: "February 24, 2025",
    patientId: "PAT-1001",
    patientName: "Safan Khan",
    summary:
      "HbA1c reflects early prediabetic spectrum. Estimated GFR demonstrates optimal glomerular filtration rate.",
    biomarkers: [
      { name: "Hemoglobin A1c", value: 6.2, unit: "%", referenceRange: "< 5.7", flag: "elevated", relativeIndex: 108 },
      { name: "eGFR", value: 98, unit: "mL/min", referenceRange: "> 60", flag: "normal", relativeIndex: 100 },
      { name: "BUN / Creatinine Ratio", value: 14, unit: "ratio", referenceRange: "10 - 20", flag: "normal", relativeIndex: 70 },
      { name: "Microalbumin (Urine)", value: 18, unit: "mg/L", referenceRange: "< 30", flag: "normal", relativeIndex: 60 }
    ]
  },
  {
    id: "panel-3",
    title: "Hepatic & Thyroid Profile",
    date: "January 12, 2025",
    patientId: "PAT-1001",
    patientName: "Safan Khan",
    summary:
      "Hepatic transaminases and thyroid stimulating hormone within ideal physiological limits.",
    biomarkers: [
      { name: "ALT (Alanine Aminotransferase)", value: 28, unit: "U/L", referenceRange: "7 - 56", flag: "normal", relativeIndex: 50 },
      { name: "AST (Aspartate Aminotransferase)", value: 24, unit: "U/L", referenceRange: "10 - 40", flag: "normal", relativeIndex: 60 },
      { name: "TSH (Thyroid Stimulating)", value: 2.1, unit: "uIU/mL", referenceRange: "0.4 - 4.0", flag: "normal", relativeIndex: 52 },
      { name: "Bilirubin Total", value: 0.8, unit: "mg/dL", referenceRange: "0.2 - 1.2", flag: "normal", relativeIndex: 66 }
    ]
  }
];

export function ClinicalProvider({ children }) {
  const [triageQueue, setTriageQueue] = useState(INITIAL_TRIAGE_QUEUE);
  const [admittedPatients, setAdmittedPatients] = useState(INITIAL_ADMITTED);
  const [dischargedPatients, setDischargedPatients] = useState([]);
  const [approvalDeskItems, setApprovalDeskItems] = useState(INITIAL_APPROVAL_ITEMS);
  const [patientMedications, setPatientMedications] = useState(INITIAL_MEDICATIONS);
  const [sampleLabPanels] = useState(SAMPLE_LAB_PANELS);
  const [activeLabReport, setActiveLabReport] = useState(SAMPLE_LAB_PANELS[0]);

  const addTriagePatient = (patient) => {
    setTriageQueue((prev) => [
      {
        ...patient,
        id: patient.id || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        arrivedAt: "Just now"
      },
      ...prev
    ]);
  };

  const admitPatient = (patientId, bedNumber) => {
    const patient = triageQueue.find((p) => p.id === patientId);
    if (!patient) return;

    setTriageQueue((prev) => prev.filter((p) => p.id !== patientId));
    setAdmittedPatients((prev) => [
      {
        ...patient,
        bedAssigned: bedNumber,
        admittedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
      ...prev
    ]);
  };

  const dischargePatient = (patientId, dischargeDetails) => {
    const patient = admittedPatients.find((p) => p.id === patientId);
    if (!patient) return;

    setAdmittedPatients((prev) => prev.filter((p) => p.id !== patientId));
    setDischargedPatients((prev) => [
      {
        ...patient,
        dischargedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dischargeSummary: dischargeDetails
      },
      ...prev
    ]);
  };

  const addApprovalItem = (item) => {
    setApprovalDeskItems((prev) => [
      {
        ...item,
        id: `SAMD-${Math.floor(8000 + Math.random() * 1000)}`,
        timestamp: "Just now",
        status: "pending"
      },
      ...prev
    ]);
  };

  const approveRecommendation = (itemId) => {
    const target = approvalDeskItems.find((i) => i.id === itemId);
    if (!target) return;

    setApprovalDeskItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: "approved" } : item))
    );

    // If there is an Rx attached, sync directly to the patient's medication regimen
    if (target.suggestedRx) {
      setPatientMedications((prev) => [
        {
          id: `med-${Date.now()}`,
          name: target.suggestedRx.name,
          dosage: target.suggestedRx.dosage,
          frequency: target.suggestedRx.frequency,
          prescribedBy: "Dr. Sarah Jenkins (via SaMD AI)",
          adherence: 100,
          status: "Active",
          remainingDays: 30
        },
        ...prev
      ]);
    }
  };

  const overrideRecommendation = (itemId, reason) => {
    setApprovalDeskItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: "overridden", overrideReason: reason } : item
      )
    );
  };

  return (
    <ClinicalContext.Provider
      value={{
        triageQueue,
        admittedPatients,
        dischargedPatients,
        approvalDeskItems,
        patientMedications,
        sampleLabPanels,
        activeLabReport,
        setActiveLabReport,
        addTriagePatient,
        admitPatient,
        dischargePatient,
        addApprovalItem,
        approveRecommendation,
        overrideRecommendation
      }}
    >
      {children}
    </ClinicalContext.Provider>
  );
}

export function useClinical() {
  const context = useContext(ClinicalContext);
  if (!context) {
    throw new Error("useClinical must be used within a ClinicalProvider");
  }
  return context;
}