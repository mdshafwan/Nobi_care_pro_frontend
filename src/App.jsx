import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClinicalProvider } from "./context/ClinicalContext";
import { FinanceProvider } from "./context/FinanceContext";
import AppLayout from "./components/layout/AppLayout";
import ToastContainer from "./components/common/ToastContainer";

// Authentication
import LoginPage from "./pages/auth/LoginPage";

// Patient Workspace Pages
import PatientOverviewPage from "./pages/patient/PatientOverviewPage";
import SymptomCheckerPage from "./pages/patient/SymptomCheckerPage";
import LabOcrPage from "./pages/patient/LabOcrPage";

// Doctor / Clinical Workspace Pages
import DoctorTriagePage from "./pages/doctor/DoctorTriagePage";
import DoctorApprovalsPage from "./pages/doctor/DoctorApprovalsPage";

// Admin Workspace Pages
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminLedgerPage from "./pages/admin/AdminLedgerPage";
import AdminMastersPage from "./pages/admin/AdminMastersPage";

// Shared Pages
import AiAssistantPage from "./pages/common/AiAssistantPage";
import ProfileSettingsPage from "./pages/common/ProfileSettingsPage";
import CareMessagesPage from "./pages/common/CareMessagesPage";

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
                  <Route path="/lab-ocr" element={<LabOcrPage />} />

                  {/* Doctor Workspace */}
                  <Route path="/doctor-triage" element={<DoctorTriagePage />} />
                  <Route path="/doctor-approvals" element={<DoctorApprovalsPage />} />

                  {/* Admin Workspace */}
                  <Route path="/admin-analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin-ledger" element={<AdminLedgerPage />} />
                  <Route path="/admin-masters" element={<AdminMastersPage />} />

                  {/* Shared Assistant, Messages & Settings */}
                  <Route path="/care-messages" element={<CareMessagesPage />} />
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