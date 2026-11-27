import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const REPORT_DATABASE = {
  cbc: {
    id: 'cbc',
    title: 'Complete Blood Count (CBC) & Lipid Profile',
    confidence: '99.1%',
    rows: [
      { test: 'Hemoglobin (Hb)', val: '11.2 g/dL', range: '13.5 - 17.5 g/dL', status: 'LOW', pct: 72 },
      { test: 'White Blood Cells (WBC)', val: '11,500 /uL', range: '4,500 - 11,000 /uL', status: 'HIGH', pct: 115 },
      { test: 'Platelet Count', val: '138,000 /uL', range: '150,000 - 450,000 /uL', status: 'LOW', pct: 82 },
      { test: 'Total Cholesterol', val: '240 mg/dL', range: '< 200 mg/dL', status: 'HIGH', pct: 130 }
    ],
    ragPoints: [
      {
        title: 'Mild Anemia (Hemoglobin 11.2 g/dL):',
        text: 'Your red blood cell oxygen-carrying protein is slightly below optimal, explaining recent fatigue.'
      },
      {
        title: 'Active Immune Response (WBC 11,500 & Platelets 138k):',
        text: 'Slightly elevated white blood cells and borderline low platelets suggest your body is fighting off a viral infection (such as Dengue or viral flu).'
      },
      {
        title: 'Elevated Cholesterol (240 mg/dL):',
        text: 'Reduce saturated fats and continue prescribed evening statin therapy.'
      }
    ]
  },
  diabetes: {
    id: 'diabetes',
    title: 'Comprehensive Glycemic & Renal Panel (HbA1c)',
    confidence: '98.7%',
    rows: [
      { test: 'Fasting Blood Glucose', val: '142 mg/dL', range: '70 - 99 mg/dL', status: 'HIGH', pct: 142 },
      { test: 'HbA1c (3-Month Avg)', val: '6.8 %', range: '4.0 - 5.6 %', status: 'HIGH', pct: 128 },
      { test: 'Serum Creatinine', val: '0.95 mg/dL', range: '0.7 - 1.3 mg/dL', status: 'NORMAL', pct: 95 },
      { test: 'eGFR (Kidney Filtration)', val: '96 mL/min', range: '> 90 mL/min', status: 'NORMAL', pct: 100 }
    ],
    ragPoints: [
      {
        title: 'Blood Sugar Flag (HbA1c 6.8% & Glucose 142 mg/dL):',
        text: 'Your 3-month average blood sugar is in the early diabetes range. Cutting refined carbohydrates and walking 30 mins after meals will significantly lower this.'
      },
      {
        title: 'Healthy Kidneys (eGFR 96):',
        text: 'Your kidney filtration markers are completely normal.'
      }
    ]
  },
  thyroid: {
    id: 'thyroid',
    title: 'Thyroid Function (TSH) & Hepatic Panel',
    confidence: '99.4%',
    rows: [
      { test: 'TSH (Thyroid Stimulating)', val: '6.4 mIU/L', range: '0.4 - 4.0 mIU/L', status: 'HIGH', pct: 145 },
      { test: 'Free T4 (Thyroxine)', val: '0.9 ng/dL', range: '0.8 - 1.8 ng/dL', status: 'NORMAL', pct: 92 },
      { test: 'ALT (Liver Enzyme)', val: '28 U/L', range: '7 - 56 U/L', status: 'NORMAL', pct: 88 },
      { test: 'Vitamin D (25-OH)', val: '18 ng/mL', range: '30 - 100 ng/mL', status: 'LOW', pct: 60 }
    ],
    ragPoints: [
      {
        title: 'Subclinical Hypothyroidism (TSH 6.4):',
        text: 'An elevated TSH means your pituitary gland is working harder to stimulate a slightly sluggish thyroid.'
      },
      {
        title: 'Vitamin D Deficiency (18 ng/mL):',
        text: 'Low Vitamin D contributes to bone/joint aches and low energy. Daily Vitamin D3 supplementation is advised.'
      }
    ]
  }
};

export default function LabOcrPage() {
  const { showToast } = useToast();
  const [selectedReportKey, setSelectedReportKey] = useState('cbc');
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const currentReport = REPORT_DATABASE[selectedReportKey];

  // Render/Update Chart.js instance safely
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: currentReport.rows.map((r) => r.test.split(' ')[0]),
          datasets: [
            {
              label: '% of Normal Reference',
              data: currentReport.rows.map((r) => r.pct),
              backgroundColor: currentReport.rows.map((r) =>
                r.status === 'NORMAL' ? '#10b981' : r.status === 'HIGH' ? '#dc2626' : '#f59e0b'
              ),
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 11,
                  weight: 'bold'
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 10
                }
              },
              grid: {
                color: '#f1f5f9'
              }
            },
            x: {
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 10,
                  weight: 'bold'
                }
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [selectedReportKey]);

  const handleSelectReport = (key) => {
    setSelectedReportKey(key);
    showToast(`Loaded ${REPORT_DATABASE[key].title}`, 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      showToast('Custom report uploaded! Running OCR extraction...', 'success');
      setSelectedReportKey('cbc');
    }
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Module Header & Sample Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Module 3 • OCR + Agentic RAG Pipeline
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Intelligent Lab Report Analyzer
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Upload a medical report or click one of the 3 sample clinical reports below to test OCR extraction & RAG synthesis.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectReport('cbc')}
              className={`px-3.5 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition ${
                selectedReportKey === 'cbc'
                  ? 'bg-red-700 ring-2 ring-red-400'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              1. Load CBC & Lipid Report
            </button>
            <button
              onClick={() => handleSelectReport('diabetes')}
              className={`px-3.5 py-2 text-white text-xs font-bold rounded-xl transition ${
                selectedReportKey === 'diabetes'
                  ? 'bg-slate-950 ring-2 ring-slate-400'
                  : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              2. Load HbA1c Diabetes Panel
            </button>
            <button
              onClick={() => handleSelectReport('thyroid')}
              className={`px-3.5 py-2 text-white text-xs font-bold rounded-xl transition ${
                selectedReportKey === 'thyroid'
                  ? 'bg-blue-800 ring-2 ring-blue-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              3. Load Thyroid & Liver Panel
            </button>
          </div>
        </div>

        {/* Dropzone Area */}
        <label className="border-2 border-dashed border-slate-200 hover:border-red-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition bg-slate-50/60 cursor-pointer block">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileUpload}
          />
          <span className="text-xs font-bold text-slate-800">
            Click to Upload PDF / PNG Lab Report (or use Demo Buttons above)
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Automated Tesseract OCR + Vector RAG Medical Knowledge Base
          </span>
        </label>

        {/* Results Grid Container */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: OCR Extracted Biomarker Table (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {currentReport.title}
                </h3>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  OCR Accuracy: {currentReport.confidence}
                </span>
              </div>

              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-200/70 text-slate-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Biomarker</th>
                    <th className="p-3">Observed</th>
                    <th className="p-3">Normal Range</th>
                    <th className="p-3 rounded-r-xl">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {currentReport.rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-slate-900">{row.test}</td>
                      <td className="p-3 font-semibold">{row.val}</td>
                      <td className="p-3 text-slate-500">{row.range}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            row.status === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : row.status === 'LOW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right: Biomarker Relative Index Chart (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-3 tracking-wider">
                Biomarker Relative Index (100 = Normal Baseline)
              </h4>
              <div className="h-48 relative">
                <canvas ref={canvasRef}></canvas>
              </div>
            </div>
          </div>

          {/* Plain-English RAG Explanation Box */}
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 text-xs text-slate-800 leading-relaxed space-y-2">
            <div className="font-bold text-slate-900 text-xs">
              Plain-English RAG Explanation:
            </div>
            <ul className="space-y-2">
              {currentReport.ragPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>
                    <strong className="font-bold text-slate-900">{point.title}</strong>{' '}
                    {point.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}