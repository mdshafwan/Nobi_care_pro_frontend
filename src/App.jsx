import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClinicalProvider } from "./context/ClinicalContext";
import { FinanceProvider } from "./context/FinanceContext";
import AppLayout from "./components/layout/AppLayout";
import ToastContainer from "./components/common/ToastContainer";

// Fully Implemented Pages
import LoginPage from "./pages/LoginPage";
import PatientOverviewPage from "./pages/PatientOverviewPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import DoctorTriagePage from "./pages/DoctorTriagePage";
import DoctorApprovalsPage from "./pages/DoctorApprovalsPage";
import LabOcrPage from "./pages/LabOcrPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminLedgerPage from "./pages/AdminLedgerPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleHomeRedirect() {
  const { currentUser, activeRoleView } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (activeRoleView === "doctor") return <Navigate to="/doctor-triage" replace />;
  if (activeRoleView === "admin") return <Navigate to="/admin-analytics" replace />;
  return <Navigate to="/patient-overview" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ClinicalProvider>
            <FinanceProvider>
              <ToastContainer />
              <Routes>
                {/* Public Authentication */}
                <Route path="/login" element={<LoginPage />} />

                {/* Authenticated Dashboard */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<RoleHomeRedirect />} />

                  {/* Patient Workspace */}
                  <Route path="/patient-overview" element={<PatientOverviewPage />} />
                  <Route path="/symptom-checker" element={<SymptomCheckerPage />} />

                  {/* Doctor Workspace */}
                  <Route path="/doctor-triage" element={<DoctorTriagePage />} />
                  <Route path="/doctor-approvals" element={<DoctorApprovalsPage />} />
                  <Route path="/lab-ocr" element={<LabOcrPage />} />

                  {/* Admin Workspace */}
                  <Route path="/admin-analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin-ledger" element={<AdminLedgerPage />} />

                  {/* Shared Assistant & Settings */}
                  <Route path="/ai-assistant" element={<AiAssistantPage />} />
                  <Route path="/profile-settings" element={<ProfileSettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </FinanceProvider>
          </ClinicalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}