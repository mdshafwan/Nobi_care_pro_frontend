import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Send,
  Stethoscope,
  Radio,
  User,
  Bed,
  CheckCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  Activity,
  AlertCircle,
  Plus,
  HeartPulse
} from 'lucide-react';

const INITIAL_THREADS = [
  {
    id: 'thread-doc',
    patientMrn: 'MRN-884920',
    patientName: 'Safan Khan',
    patientAge: 29,
    patientGender: 'Male',
    ward: 'Emergency & Trauma Bay',
    bed: 'ED-Observation 05',
    providerName: 'Dr. Sarah Jenkins, MD',
    providerRole: 'Attending Physician (Cardiology)',
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'Dr. Sarah Jenkins, MD',
        senderRole: 'doctor',
        text: 'Hello Safan. I reviewed your lipid markers and telemetry stream. Continue taking the Atorvastatin 20mg after dinner.',
        time: '09:30 AM'
      },
      {
        id: 2,
        sender: 'Safan Khan',
        senderRole: 'patient',
        text: 'Thank you Doctor. Is it normal to feel slight muscle stiffness in the calves after starting this dose?',
        time: '10:15 AM'
      },
      {
        id: 3,
        sender: 'Dr. Sarah Jenkins, MD',
        senderRole: 'doctor',
        text: 'Mild initial stiffness can occur. Stay well hydrated. If you develop acute cramping or dark urine, alert the duty nurse immediately.',
        time: '10:45 AM'
      }
    ]
  },
  {
    id: 'thread-nurse',
    patientMrn: 'MRN-884920',
    patientName: 'Safan Khan',
    patientAge: 29,
    patientGender: 'Male',
    ward: 'Emergency & Trauma Bay',
    bed: 'ED-Observation 05',
    providerName: 'Staff Nurse Emily Carter',
    providerRole: 'Station 4 Inpatient Care Nurse',
    unread: 1,
    messages: [
      {
        id: 1,
        sender: 'Staff Nurse Emily Carter',
        senderRole: 'nurse',
        text: 'Good morning Safan! Your 02:00 PM telemetry vitals and blood pressure check is scheduled. Let me know if you need fresh water or an extra blanket.',
        time: '11:10 AM'
      }
    ]
  },
  {
    id: 'thread-patient-2',
    patientMrn: 'MRN-774102',
    patientName: 'Eleanor Vance',
    patientAge: 54,
    patientGender: 'Female',
    ward: 'Cardiology Telemetry Wing',
    bed: 'Bed 204-A',
    providerName: 'Dr. Sarah Jenkins, MD',
    providerRole: 'Attending Physician',
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'Eleanor Vance',
        senderRole: 'patient',
        text: 'Dr. Jenkins, my morning BP recorded at 138/88. Should I take the extra beta blocker dose today?',
        time: '08:20 AM'
      },
      {
        id: 2,
        sender: 'Dr. Sarah Jenkins, MD',
        senderRole: 'doctor',
        text: 'Hold the extra dose for now Eleanor. We will review your 12-hour holter monitor at 1:00 PM.',
        time: '08:45 AM'
      }
    ]
  }
];

export default function CareMessagesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Safely resolve role
  const rawRole = user?.role || localStorage.getItem('medmind_role') || 'patient';
  const role = rawRole.toLowerCase();
  const isDoctor = role === 'doctor' || role === 'nurse' || role === 'clinical';

  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem('hospital_care_threads');
    return saved ? JSON.parse(saved) : INITIAL_THREADS;
  });

  const [selectedThreadId, setSelectedThreadId] = useState('thread-doc');
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-sync admitted patients from Doctor Triage into threads list
  useEffect(() => {
    const savedAdmissions = JSON.parse(localStorage.getItem('hospital_patient_admissions') || '{}');
    const admissionEntries = Object.entries(savedAdmissions);

    if (admissionEntries.length > 0) {
      setThreads(prev => {
        let updated = [...prev];
        admissionEntries.forEach(([mrn, admission]) => {
          const existingIndex = updated.findIndex(t => t.patientMrn === mrn);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              ward: admission.ward || updated[existingIndex].ward,
              bed: admission.bed || updated[existingIndex].bed,
              providerName: admission.attendingPhysician || updated[existingIndex].providerName,
              patientName: admission.patientName || updated[existingIndex].patientName
            };
          } else {
            // New admitted patient thread
            updated.push({
              id: `thread-${mrn}`,
              patientMrn: mrn,
              patientName: admission.patientName || `Patient (${mrn})`,
              patientAge: admission.age || 35,
              patientGender: admission.gender || 'Patient',
              ward: admission.ward || 'General Medical Wing',
              bed: admission.bed || 'Bed Auto-01',
              providerName: admission.attendingPhysician || user?.name || 'Dr. Sarah Jenkins, MD',
              providerRole: 'Attending Physician',
              unread: 0,
              messages: [
                {
                  id: Date.now(),
                  sender: admission.attendingPhysician || user?.name || 'Dr. Sarah Jenkins, MD',
                  senderRole: 'doctor',
                  text: `Admission confirmed for ${admission.ward || 'Inpatient Bay'}, Bed ${admission.bed || 'Allocated'}. Telemetry monitoring active.`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            });
          }
        });
        return updated;
      });
    }
  }, [user]);

  // Save to localStorage whenever threads change
  useEffect(() => {
    localStorage.setItem('hospital_care_threads', JSON.stringify(threads));
  }, [threads]);

  // Filter threads based on active role
  const availableThreads = threads.filter(t => {
    if (isDoctor) {
      // Doctor sees all patient threads matching search
      const q = searchQuery.toLowerCase();
      return (
        t.patientName?.toLowerCase().includes(q) ||
        t.patientMrn?.toLowerCase().includes(q) ||
        t.ward?.toLowerCase().includes(q) ||
        t.bed?.toLowerCase().includes(q)
      );
    } else {
      // Patient sees assigned provider threads for their MRN or default care team
      const currentMrn = user?.mrn || 'MRN-884920';
      return t.patientMrn === currentMrn || t.id === 'thread-doc' || t.id === 'thread-nurse';
    }
  });

  const activeThread = threads.find(t => t.id === selectedThreadId) || availableThreads[0] || threads[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;

    const senderName = isDoctor 
      ? (user?.name || 'Dr. Sarah Jenkins, MD')
      : (user?.name || 'Safan Khan');

    const senderRole = isDoctor ? 'doctor' : 'patient';

    const newMessage = {
      id: Date.now(),
      sender: senderName,
      senderRole: senderRole,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));

    setInputMessage('');
    showToast(
      isDoctor 
        ? `Clinical directive sent to ${activeThread.patientName}` 
        : `Message sent to ${activeThread.providerName}`,
      'success'
    );
  };

  const sendQuickPrompt = (text) => {
    setInputMessage(text);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-red-400 border border-white/10 shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950 px-2 py-0.5 rounded-full border border-red-800/80">
                Direct Telemetry & Clinical Comm
              </span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Encrypted Channel
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              {isDoctor ? 'Doctor Patient Caseload Inbox' : 'Assigned Clinical Care Desk'}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logged in as</span>
          <span className="text-xs font-extrabold text-white flex items-center gap-1.5 justify-end">
            <User className="w-3.5 h-3.5 text-red-400" />
            {user?.name || (isDoctor ? 'Dr. Sarah Jenkins, MD' : 'Safan Khan')} 
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-md font-bold uppercase">
              {isDoctor ? 'Doctor' : 'Patient'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
          
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isDoctor ? "Search admitted patients or ward..." : "Search care providers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{isDoctor ? 'Admitted Patient Roster' : 'Your Assigned Clinical Team'}</span>
              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
                {availableThreads.length}
              </span>
            </div>

            {availableThreads.map((thread) => {
              const isSelected = activeThread?.id === thread.id;
              const lastMsg = thread.messages[thread.messages.length - 1];

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-red-600 shadow-md shadow-red-600/10 ring-2 ring-red-600/10'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-900">
                      {isDoctor ? thread.patientName : thread.providerName}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400">{lastMsg?.time || 'Active'}</span>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-500 line-clamp-1 mb-2">
                    {isDoctor ? `${thread.ward} • ${thread.bed}` : thread.providerRole}
                  </p>

                  <div className="text-[11px] text-slate-600 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded-lg">
                    "{lastMsg?.text || 'No messages yet'}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Window */}
        {activeThread ? (
          <div className="md:col-span-8 flex flex-col bg-white">
            
            {/* Thread Top Bar */}
            <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  {isDoctor ? <User className="w-5 h-5 text-red-400" /> : <Stethoscope className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    {isDoctor ? activeThread.patientName : activeThread.providerName}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {isDoctor ? `MRN: ${activeThread.patientMrn}` : 'Verified Clinical Team'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeThread.ward} • <strong className="text-red-600">{activeThread.bed}</strong></span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telemetry Status</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live Sync Connected
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {activeThread.messages.map((msg) => {
                // Dynamically calculate if message is from the logged in user
                const isMsgFromMe = isDoctor ? (msg.senderRole === 'doctor') : (msg.senderRole === 'patient');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMsgFromMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-bold text-slate-700">{msg.sender}</span>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed shadow-xs ${
                        isMsgFromMe
                          ? 'bg-red-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Context Prompt Chips */}
            <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto text-[11px] whitespace-nowrap">
              <span className="text-slate-400 font-bold shrink-0">Quick Directives:</span>
              {isDoctor ? (
                <>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Please confirm your latest resting blood pressure and pulse reading.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Request BP & Vitals Log
                  </button>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Your lab markers look stable. You are scheduled for bedside rounds at 03:00 PM.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Confirm Bedside Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Hold the morning beta blocker dose. Telemetry team is reviewing your rhythm.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Hold Medication Dose
                  </button>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Prescription updated in AI Approvals. Take your evening tablets with food.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Prescription Update
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Experiencing mild dizziness after morning medication dose.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Mild Dizziness
                  </button>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Requesting doctor clarification on my evening tablet timing.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Dose Timing Question
                  </button>
                  <button
                    type="button"
                    onClick={() => sendQuickPrompt('Logged my daily vitals in the Overview portal. Please review when free.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition shrink-0 cursor-pointer"
                  >
                    Vitals Logged Notice
                  </button>
                </>
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
              <input
                type="text"
                placeholder={isDoctor ? `Type clinical orders or reply for ${activeThread.patientName}...` : `Type message for ${activeThread.providerName}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/30"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs font-bold">
            Select a conversation thread to view communications.
          </div>
        )}

      </div>
    </div>
  );
}