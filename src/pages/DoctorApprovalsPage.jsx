import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search, 
  FlaskConical, 
  ShieldCheck, 
  Edit3, 
  Check, 
  Info,
  ArrowRight
} from 'lucide-react';

const INITIAL_APPROVAL_CARDS = [
  {
    id: 'approvalCard1',
    initials: 'EV',
    name: 'Eleanor Vance',
    ageGender: '68 Y/O • Female',
    riskTag: 'P1 HIGH RISK',
    riskClass: 'bg-rose-100 text-rose-700 border-rose-200',
    borderClass: 'border-l-4 border-l-red-500',
    avatarBg: 'bg-red-50 border-red-200 text-red-600',
    encounterId: 'ENC-2023-9941',
    timeAgo: '12 mins ago',
    confidence: '94.2% (High Precision)',
    confidenceColor: 'text-emerald-600',
    confidenceIcon: 'check',
    diagnosis: 'Acute Coronary Syndrome (ACS) - Non-ST Elevation Path',
    diagnosisDetails: 'Elevated cardiac enzymes (Troponin I at 1.4 ng/mL), ST-segment depression in V4-V6 on 12-lead ECG OCR, and radiating chest distress.',
    differentials: [
      { name: 'Acute Coronary Syndrome', pct: '94.2%', width: '94.2%', color: 'bg-red-600', text: 'text-red-600' },
      { name: 'Acute Pericarditis', pct: '4.1%', width: '4.1%', color: 'bg-slate-300', text: 'text-slate-500' }
    ],
    protocolOrders: [
      { item: 'Aspirin (Chewable)', dosage: '325 mg STAT', isPriority: false },
      { item: 'Heparin Drip', dosage: '18 units/kg/hr', isPriority: false },
      { item: 'Cath Lab Transfer', dosage: 'PRIORITY 1', isPriority: true }
    ],
    auditText: 'FDA Class II SaMD Decision Support Audit Trail active',
    auditType: 'success'
  },
  {
    id: 'approvalCard2',
    initials: 'MT',
    name: 'Marcus Thorne',
    ageGender: '45 Y/O • Male',
    riskTag: 'P2 MODERATE',
    riskClass: 'bg-amber-100 text-amber-700 border-amber-200',
    borderClass: 'border-l-4 border-l-amber-500',
    avatarBg: 'bg-amber-50 border-amber-200 text-amber-600',
    encounterId: 'ENC-2023-9944',
    timeAgo: '28 mins ago',
    confidence: '88.7% (Moderate)',
    confidenceColor: 'text-amber-600',
    confidenceIcon: 'alert',
    diagnosis: 'Bacterial Community-Acquired Pneumonia (CAP)',
    diagnosisDetails: 'Right lower lobe consolidation detected via Chest X-Ray Vision Transformer OCR. High fever (39.1°C) and leukocytosis (WBC 16.2k).',
    differentials: [
      { name: 'Bacterial Pneumonia (CAP)', pct: '88.7%', width: '88.7%', color: 'bg-amber-500', text: 'text-amber-600' },
      { name: 'Viral Pneumonitis / Bronchitis', pct: '11.3%', width: '11.3%', color: 'bg-slate-300', text: 'text-slate-500' }
    ],
    protocolOrders: [
      { item: 'Ceftriaxone IV', dosage: '1g Q24H', isPriority: false },
      { item: 'Azithromycin PO', dosage: '500mg Daily', isPriority: false },
      { item: 'Supplemental O2', dosage: '2L Nasal Cannula', isPriority: false }
    ],
    auditText: 'Sputum culture pending laboratory validation',
    auditType: 'warning'
  }
];

export default function DoctorApprovalsPage() {
  const [cards, setCards] = useState(INITIAL_APPROVAL_CARDS);
  const [pendingCount, setPendingCount] = useState(2);
  const [approvedCount, setApprovedCount] = useState(18);
  const [overriddenCount, setOverriddenCount] = useState(2);

  // Modal State
  const [modifyModal, setModifyModal] = useState({
    isOpen: false,
    cardId: null,
    patientName: '',
    diagnosis: '',
    rationale: ''
  });

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleApprove = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setPendingCount((prev) => Math.max(0, prev - 1));
    setApprovedCount((prev) => prev + 1);
    showToast('Diagnostic assertion approved and signed (E-Rx broadcasted).', 'success');
  };

  const handleReject = (cardId) => {
    if (!window.confirm('Are you sure you want to override and reject this AI assertion? This event will be logged in HIPAA audit trails.')) {
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setPendingCount((prev) => Math.max(0, prev - 1));
    setOverriddenCount((prev) => prev + 1);
    showToast('AI assertion overridden and sent back for model retraining.', 'info');
  };

  const openModifyModal = (card) => {
    setModifyModal({
      isOpen: true,
      cardId: card.id,
      patientName: card.name,
      diagnosis: card.diagnosis,
      rationale: ''
    });
  };

  const closeModifyModal = () => {
    setModifyModal({
      isOpen: false,
      cardId: null,
      patientName: '',
      diagnosis: '',
      rationale: ''
    });
  };

  const submitModification = () => {
    if (modifyModal.cardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === modifyModal.cardId
            ? { ...c, diagnosis: modifyModal.diagnosis }
            : c
        )
      );
    }
    showToast('Modified assessment saved with physician digital signature.', 'success');
    closeModifyModal();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none animate-bounce">
          <div className="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-semibold">
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === 'success'
                  ? 'bg-emerald-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            ></div>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>AI Diagnostic Approvals Stream</span>
            <span className="text-xs font-bold px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full uppercase tracking-wider">
              Human-in-the-Loop
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review, sign, or modify deep learning diagnostic assertions prior to E-Prescription issuance.
          </p>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Pending Verification
          </span>
          <div className="text-3xl font-extrabold text-amber-500 mt-2">{pendingCount}</div>
          <span className="text-[11px] font-semibold text-amber-600/90 mt-1 block">
            Requires MD Sign-off
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Approved Today
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{approvedCount}</div>
          <span className="text-[11px] font-semibold text-emerald-700/90 mt-1 block">
            Signatures Broadcasted
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            AI Precision Rate
          </span>
          <div className="text-3xl font-extrabold text-red-600 mt-2">96.4%</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            Based on 1,420 evaluations
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            MD Overrides / Refusals
          </span>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{overriddenCount}</div>
          <span className="text-[11px] font-semibold text-rose-600/90 mt-1 block">
            Sent back for retraining
          </span>
        </div>
      </div>

      {/* CARDS STREAM LIST */}
      <div className="space-y-6">
        {cards.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All Pending Approvals Processed</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no outstanding AI diagnostic assertions waiting for doctor signature. Great job!
            </p>
            <Link
              to="/doctor-triage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md cursor-pointer"
            >
              <span>Return to Triage Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-3xl p-6 lg:p-7 border border-slate-200 shadow-sm ${card.borderClass} space-y-5 transition-all duration-300`}
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-extrabold text-lg shadow-sm ${card.avatarBg}`}
                  >
                    {card.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{card.name}</h3>
                      <span className="text-xs font-semibold text-slate-500">
                        ({card.ageGender})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${card.riskClass}`}
                      >
                        {card.riskTag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Encounter ID:{' '}
                      <span className="font-mono text-slate-800 font-bold">{card.encounterId}</span> • Time:{' '}
                      {card.timeAgo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                      AI Model Confidence
                    </span>
                    <span className={`text-xs font-extrabold ${card.confidenceColor}`}>
                      {card.confidence}
                    </span>
                  </div>
                  {card.confidenceIcon === 'check' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  )}
                </div>
              </div>

              {/* Card Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: AI Diagnosis Breakdown (7 Cols) */}
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-4 h-4 text-red-600" />
                    Primary AI Diagnostic Assertion
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="text-sm font-bold text-slate-900">{card.diagnosis}</div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {card.diagnosisDetails}
                    </p>
                  </div>

                  {card.differentials && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Differential Probabilities
                      </div>
                      {card.differentials.map((diff, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className={`flex items-center justify-between text-xs font-bold ${diff.text}`}>
                            <span>{diff.name}</span>
                            <span>{diff.pct}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${diff.color}`}
                              style={{ width: diff.width }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Recommended Treatment (5 Cols) */}
                <div className="md:col-span-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-red-600" />
                    Proposed Protocol / Order
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
                      <span>Order Item</span>
                      <span>Dosage</span>
                    </div>
                    {card.protocolOrders.map((ord, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between text-slate-700 font-medium ${
                          ord.isPriority ? 'pt-1 border-t border-slate-200' : ''
                        }`}
                      >
                        <span>{ord.item}</span>
                        <span
                          className={`font-mono ${
                            ord.isPriority
                              ? 'font-extrabold text-rose-600'
                              : 'font-bold text-slate-900'
                          }`}
                        >
                          {ord.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center font-medium gap-2">
                  {card.auditType === 'success' ? (
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                  ) : (
                    <Info className="w-4 h-4 text-amber-500" />
                  )}
                  {card.auditText}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleReject(card.id)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Override / Reject
                  </button>
                  <button
                    onClick={() => openModifyModal(card)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modify Assessment
                  </button>
                  <button
                    onClick={() => handleApprove(card.id)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Sign (E-Rx)
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODIFY ASSESSMENT MODAL */}
      {modifyModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 lg:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Override Clinical Assertion
              </h3>
              <button
                onClick={closeModifyModal}
                className="text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                  Patient Context
                </label>
                <input
                  type="text"
                  readOnly
                  value={modifyModal.patientName}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                  Adjusted Diagnosis / Clinical Note
                </label>
                <input
                  type="text"
                  value={modifyModal.diagnosis}
                  onChange={(e) =>
                    setModifyModal((prev) => ({ ...prev, diagnosis: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                  MD Overriding Rationale (Mandatory for Compliance)
                </label>
                <textarea
                  rows={3}
                  value={modifyModal.rationale}
                  onChange={(e) =>
                    setModifyModal((prev) => ({ ...prev, rationale: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  placeholder="State reason for divergence from AI recommendation..."
                ></textarea>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeModifyModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitModification}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md cursor-pointer"
              >
                Save & Re-issue Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}