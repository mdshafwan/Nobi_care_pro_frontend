import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AiAssistantPage() {
  const { currentRole, currentUserProfile } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      timestamp: 'Just now',
      text: 'Hello! I have context of your recent <strong>CBC & Lipid Lab Report</strong> (Hb: 11.2, Cholesterol: 240). Ask me any question or click one of the test prompts at the top right!',
      isEmergency: false,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll on message updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSend = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend.trim() : inputValue.trim();
    if (!query) return;

    // Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
      isEmergency: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // AI Logic Response Delay
    setTimeout(() => {
      const low = query.toLowerCase();
      let replyHtml = '';
      let isEmergency = false;

      if (low.includes('chest') || low.includes('heart') || low.includes('breath') || low.includes('sweating')) {
        isEmergency = true;
        replyHtml = `
          <div class="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 font-bold space-y-1.5">
            <div class="flex items-center gap-2 text-red-600 font-extrabold text-xs uppercase tracking-wider">
              <span>🚨</span> EMERGENCY GUARDRAIL TRIGGERED
            </div>
            <p class="text-xs font-semibold text-red-800 leading-relaxed">
              Acute chest pain or shortness of breath indicates potential myocardial ischemia. An alert has been dispatched to Dr. Sarah's Triage Queue. Please call Emergency Services (911/108) immediately.
            </p>
          </div>
        `;
        showToastNotification('Emergency alert triggered!', 'danger');
      } else if (low.includes('hemoglobin') || low.includes('hb') || low.includes('anemia')) {
        replyHtml = `Your OCR lab report shows <strong>Hemoglobin at 11.2 g/dL</strong> (Reference: 13.5–17.5). This indicates mild anemia. Continue taking your prescribed <strong>Ferrous Sulfate 325mg</strong> with Vitamin C to boost iron absorption.`;
      } else if (low.includes('fever') || low.includes('joint')) {
        replyHtml = `Given your fever, joint pain, and borderline platelet count (138,000 /uL), our Deep Learning model flags an <strong>88% match with Dengue Fever</strong>. Avoid NSAIDs (like Ibuprofen/Aspirin) as they increase bleeding risk; use Paracetamol (Acetaminophen) and hydrate.`;
      } else if (low.includes('cholesterol') || low.includes('lipid')) {
        replyHtml = `Your Total Cholesterol is <strong>240 mg/dL</strong> (High) and LDL is elevated at <strong>158 mg/dL</strong>. We recommend continuing <strong>Atorvastatin 20mg</strong> at bedtime and following a low-saturated-fat Mediterranean diet.`;
      } else {
        replyHtml = `I've cross-referenced your query with our clinical RAG database and your EHR profile. Your vitals remain stable (BP 118/76). Would you like me to forward this note to your attending clinician?`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyHtml,
        isEmergency,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-bounce">
          <div
            className={`${
              toast.type === 'danger'
                ? 'bg-red-600'
                : toast.type === 'info'
                ? 'bg-slate-900'
                : 'bg-emerald-600'
            } text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 pointer-events-auto`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Window */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-[calc(100vh-140px)]">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
              Module 2 • Conversational Triage Agent
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Nobi AI Clinical Assistant
            </h3>
          </div>
          
          {/* Quick Query Prompt Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSend('I have severe chest pain and sweating')}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              Test Emergency: "Chest Pain"
            </button>
            <button
              onClick={() => handleSend('Explain my low Hemoglobin 11.2 report')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              Ask: "Low Hemoglobin"
            </button>
            <button
              onClick={() => handleSend('I have fever and joint pain for 2 days')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              Ask: "Fever & Joint Pain"
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md shadow-red-600/20">
                  AI
                </div>
              )}

              <div
                className={`${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-lg text-xs leading-relaxed shadow-sm'
                    : 'bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-xl text-xs leading-relaxed'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                AI
              </div>
              <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Controls */}
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask about your lab results..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-600 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}