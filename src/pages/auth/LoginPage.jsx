import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SilkRibbonCanvas from "../../components/common/SilkRibbonCanvas";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(false);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. PATIENT CREDENTIALS
    if (u === "safan" && p === "safan@123") {
      login("patient");
      navigate("/patient-overview");
    }
    // 2. DOCTOR CREDENTIALS
    else if (u === "doctor" && p === "doctor123") {
      login("doctor");
      navigate("/doctor-triage");
    }
    // 3. ADMIN CREDENTIALS -> Opens Choice Modal
    else if (u === "admin" && p === "admin123") {
      setShowRoleModal(true);
    } else {
      setError(true);
    }
  };

  const handleAdminChoice = (selectedRole) => {
    login(selectedRole);
    setShowRoleModal(false);
    if (selectedRole === "patient") navigate("/patient-overview");
    else if (selectedRole === "doctor") navigate("/doctor-triage");
    else navigate("/admin-analytics");
  };

  const handleSocialQuickFill = (provider) => {
    if (provider === "Google") {
      setUsername("safan");
      setPassword("safan@123");
    } else if (provider === "Microsoft") {
      setUsername("doctor");
      setPassword("doctor123");
    } else if (provider === "Apple") {
      setUsername("admin");
      setPassword("admin123");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden text-slate-900 selection:bg-red-600 selection:text-white bg-[#fdfdfd]">
      {/* 120 FPS+ 3D Glossy Liquid Silk Ribbon Engine */}
      <SilkRibbonCanvas />

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full max-w-[1400px] mx-auto px-8 lg:px-14 py-7 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-600/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xl font-bold tracking-tight text-slate-900">Nobi Care Pro</span>
            <span className="text-slate-300 font-light text-sm">|</span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
              Smarter Care. Healthier Tomorrow.
            </span>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          Need help? <a href="#" className="text-red-600 font-semibold hover:text-red-700 transition-colors ml-1">Contact Support</a>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-8 lg:px-14 py-4 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Branding & Value Proposition */}
        <div className="lg:col-span-4 space-y-6">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500 block">
            AI FOR A HEALTHIER TOMORROW
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 leading-[1.12] tracking-tight">
            Human care. <br />
            <span className="text-red-600">Amplified by AI.</span>
          </h1>

          <p className="text-slate-700 text-sm leading-relaxed max-w-sm font-medium">
            Secure, intelligent, and patient-centric healthcare solutions for a healthier world.
          </p>

          {/* 3 Feature Badges */}
          <div className="flex items-center gap-3 pt-2">
            <div className="p-3 bg-white/95 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center w-24">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">Smarter Insights</span>
            </div>

            <div className="p-3 bg-white/95 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center w-24">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">Better Outcomes</span>
            </div>

            <div className="p-3 bg-white/95 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center w-24">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">More Human Care</span>
            </div>
          </div>
        </div>

        {/* Center Login Card */}
        <div className="lg:col-span-4 flex justify-center">
          <div
            className="w-full max-w-[390px] bg-white p-8 sm:p-9 rounded-[32px] relative"
            style={{
              boxShadow:
                "0 30px 60px -15px rgba(15, 23, 42, 0.08), 0 12px 24px -8px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.9)"
            }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">Sign in to your Nobi Care Pro account</p>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-600 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="whitespace-pre-line font-medium leading-relaxed">
                  {`Invalid credentials. Try:
• admin / admin123
• doctor / doctor123
• safan / safan@123`}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Username or Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition"
                    placeholder="admin, doctor, or safan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500 accent-red-600"
                  />
                  <span className="font-medium">Remember me</span>
                </label>
                <a href="#" className="text-red-600 font-semibold hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-xl transition duration-150 shadow-md shadow-red-600/25 flex items-center justify-center gap-1.5 text-sm"
              >
                <span>Sign in</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-3 bg-white text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialQuickFill("Google")}
                title="Quick Fill (Safan - Patient)"
                className="py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialQuickFill("Microsoft")}
                title="Quick Fill (Doctor Workspace)"
                className="py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <rect fill="#F25022" x="1" y="1" width="10" height="10" />
                  <rect fill="#7FBA00" x="13" y="1" width="10" height="10" />
                  <rect fill="#00A4EF" x="1" y="13" width="10" height="10" />
                  <rect fill="#FFB900" x="13" y="13" width="10" height="10" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialQuickFill("Apple")}
                title="Quick Fill (Admin Workspace)"
                className="py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs text-slate-900"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.5-11.19-20.47-14.67-32.92-3.48-12.45-5.22-23.71-5.22-33.78 0-14.57 3.59-26.65 10.78-36.23 7.18-9.58 16.32-14.48 27.42-14.71 4.58 0 9.8 1.16 15.67 3.48 5.88 2.32 9.8 3.54 11.77 3.65 1.74 0 5.82-1.22 12.24-3.65 6.42-2.44 11.88-3.48 16.38-3.14 12.19.87 21.87 5.28 29.04 13.23-10.66 6.42-15.89 15.34-15.67 26.77.22 8.92 3.65 16.43 10.29 22.52 6.64 6.09 14.47 9.53 23.49 10.33-2.18 6.42-4.85 12.73-8.02 18.93zM119.22 31.02c0-7.18 2.61-13.92 7.83-20.24 5.22-6.31 11.64-10.12 19.25-11.43 1.09 6.86-.44 13.6-4.57 20.24-4.14 6.64-10.23 10.88-18.28 12.73-.55-.44-1.96-.87-4.23-1.3z" />
                </svg>
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6 font-medium">
              Don't have an account? <a href="#" className="text-red-600 font-semibold hover:underline">Create one</a>
            </p>
          </div>
        </div>

        {/* Right Side Micro-Copy */}
        <div className="lg:col-span-4 hidden lg:flex flex-col items-start justify-center pl-10 space-y-2.5">
          <div className="w-8 h-1 bg-red-600 rounded-full mb-1"></div>
          <div className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500 leading-tight">
            INTELLIGENCE FOR A HEALTHIER YOU
          </div>
          <p className="text-sm font-semibold text-slate-800">
            From data to better days.
          </p>
        </div>
      </main>

      {/* Footer Logos & Badges */}
      <footer className="relative z-10 w-full border-t border-slate-100 bg-white/90 backdrop-blur-md px-8 lg:px-14 py-4 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
          <span className="font-extrabold tracking-widest text-[10px] uppercase text-slate-400">
            TRUSTED BY LEADING HEALTHCARE ORGANIZATIONS
          </span>
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
            </svg>
            Mayo Clinic
          </span>
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
            Cleveland Clinic
          </span>
          <span className="font-semibold text-slate-700">Johns Hopkins Medicine</span>
          <span className="font-semibold text-slate-700">Stanford Health Care</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Enterprise Grade Security
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Built for Better Care
          </span>
        </div>
      </footer>

      {/* Enhanced Admin Workspace Modal */}
      {showRoleModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRoleModal(false);
          }}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
        >
          <div
            className="bg-white rounded-[32px] p-7 sm:p-9 w-full max-w-[440px] border border-slate-100 relative transform transition-all duration-300 scale-100"
            style={{
              boxShadow:
                "0 35px 70px -15px rgba(15, 23, 42, 0.25), 0 15px 30px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.95)"
            }}
          >
            {/* Dismiss Button */}
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl ring-8 ring-red-50/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Select Workspace</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Logged in as Administrator. Choose your view:
              </p>
            </div>

            {/* Role Options Grid */}
            <div className="space-y-3">
              {/* Admin Role */}
              <button
                onClick={() => handleAdminChoice("admin")}
                className="w-full p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-red-50/70 hover:border-red-200 hover:shadow-md hover:shadow-red-600/5 text-left transition-all duration-150 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 group-hover:border-red-200 flex items-center justify-center text-red-600 shadow-2xs transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      Admin Control Center
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      System configs, analytics & audit logs
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-red-600 group-hover:border-red-200 transition-all group-hover:translate-x-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>

              {/* Doctor Role */}
              <button
                onClick={() => handleAdminChoice("doctor")}
                className="w-full p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 hover:shadow-md hover:shadow-blue-600/5 text-left transition-all duration-150 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 group-hover:border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Doctor Workspace
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Patient EHR, AI diagnostics & prescriptions
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all group-hover:translate-x-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>

              {/* Patient Role */}
              <button
                onClick={() => handleAdminChoice("patient")}
                className="w-full p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 hover:shadow-md text-left transition-all duration-150 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 group-hover:border-slate-300 flex items-center justify-center text-slate-700 shadow-2xs transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                      Patient Portal View
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Health metrics, care charts & appointments
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:border-slate-300 transition-all group-hover:translate-x-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Session Security Badge */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] font-semibold text-slate-400">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span>Encrypted multi-tenant session</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}