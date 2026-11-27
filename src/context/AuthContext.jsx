import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEFAULT_PROFILES_DB = {
  patient: {
    role: "patient",
    profile: {
      full_name: "Safan Khan",
      national_id: "PK-99382104-A",
      email: "safan@patient.org",
      phone: "+1 (555) 234-5678",
      dob: "1995-08-14",
      gender: "Male",
      marital_status: "Married",
      language: "English (US)",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      country: "United States",
      postal_code: "97477",
      emergency_name: "Jane Khan",
      emergency_phone: "+1 (555) 987-6543",
      emergency_relation: "Spouse",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
    },
    patient_details: {
      mrn: "MRN-993821",
      blood_group: "O+",
      height_cm: 178,
      weight_kg: 74.5,
      smoking_status: "never",
      insurance_provider: "Aetna Health Care",
      insurance_policy_number: "AET-99203810",
      known_allergies: "Penicillin, Peanuts (Moderate)",
      chronic_illnesses: "Hypertension (Stage 1 Controlled)",
      current_medications: "Lisinopril 10mg PO Daily",
      family_history: "Maternal Type 2 Diabetes; Paternal CAD"
    },
    workspace: "PATIENT PORTAL",
    breadcrumb: "Patient Portal",
    sectionHeader: "Patient Navigation",
    roleTabTitle: "Medical & Insurance Record",
    roleTabSubtitle: "Table: patient_details"
  },
  doctor: {
    role: "doctor",
    profile: {
      full_name: "Dr. Sarah Jenkins",
      national_id: "US-48291038-MD",
      email: "sarah.jenkins@nobicare.pro",
      phone: "+1 (555) 443-2211",
      dob: "1982-11-04",
      gender: "Female",
      marital_status: "Single",
      language: "English, Spanish",
      address: "100 Medical Center Way, Suite 4B",
      city: "Boston",
      country: "United States",
      postal_code: "02115",
      emergency_name: "Hospital Command Dispatch",
      emergency_phone: "+1 (555) 443-9900",
      emergency_relation: "Hospital Admin",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&q=80"
    },
    clinician_details: {
      license_number: "DOC-482910",
      specialization: "Emergency Medicine & Acute Resuscitation",
      department: "Emergency Medicine (ED)",
      years_of_experience: 14,
      qualification: "MD, Board Certified Emergency Medicine",
      employment_type: "full_time",
      languages_spoken: "English, Spanish, French",
      bio: "Lead Attending Physician overseeing agentic AI triage protocols, diagnostic validation, and acute resuscitation pipelines."
    },
    workspace: "CLINICAL WORKSPACE",
    breadcrumb: "Clinical Workspace",
    sectionHeader: "Clinical Workspace",
    roleTabTitle: "Clinician Practice Credentials",
    roleTabSubtitle: "Table: clinician_details"
  },
  admin: {
    role: "admin",
    profile: {
      full_name: "Alexander Vance",
      national_id: "US-00194811-IT",
      email: "alexander@nobicare.pro",
      phone: "+1 (555) 999-0000",
      dob: "1978-05-20",
      gender: "Male",
      marital_status: "Married",
      language: "English (US)",
      address: "500 Enterprise Blvd, Suite 100",
      city: "New York",
      country: "United States",
      postal_code: "10001",
      emergency_name: "IT Infrastructure Support",
      emergency_phone: "+1 (555) 999-1111",
      emergency_relation: "IT Operations",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80"
    },
    admin_details: {
      employee_id: "ADM-001948",
      job_title: "Chief Health Information Officer",
      department: "Executive Administration",
      access_level: "super_admin"
    },
    workspace: "ADMINISTRATION",
    breadcrumb: "Administrative Command",
    sectionHeader: "Administration",
    roleTabTitle: "Governance & Access Rights",
    roleTabSubtitle: "Table: admin_details"
  }
};

export function AuthProvider({ children }) {
  const [profilesDB, setProfilesDB] = useState(() => {
    const saved = localStorage.getItem("nobi_profiles_db");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES_DB;
  });

  const [activeRoleView, setActiveRoleView] = useState(() => {
    return localStorage.getItem("medmind_role") || "patient";
  });

  useEffect(() => {
    localStorage.setItem("nobi_profiles_db", JSON.stringify(profilesDB));
    localStorage.setItem("medmind_role", activeRoleView);
  }, [profilesDB, activeRoleView]);

  const currentRoleData = profilesDB[activeRoleView] || profilesDB.patient;
  
  // Creates normalized user object with both name and full_name
  const currentUser = {
    ...currentRoleData.profile,
    name: currentRoleData.profile?.full_name || "User",
    role: activeRoleView,
    badge: activeRoleView === 'patient' 
      ? `Patient • ${currentRoleData.patient_details?.mrn || 'MRN-993821'}` 
      : activeRoleView === 'doctor' 
      ? `Attending MD • ${currentRoleData.clinician_details?.license_number || 'DOC-482910'}` 
      : `System Admin • ${currentRoleData.admin_details?.employee_id || 'ADM-001948'}`,
    id: activeRoleView === 'patient' 
      ? currentRoleData.patient_details?.mrn 
      : activeRoleView === 'doctor' 
      ? currentRoleData.clinician_details?.license_number 
      : currentRoleData.admin_details?.employee_id
  };

  const switchWorkspace = (role) => {
    const cleanRole = (role || "").trim().toLowerCase();
    if (profilesDB[cleanRole]) {
      setActiveRoleView(cleanRole);
      localStorage.setItem("medmind_role", cleanRole);
    }
  };

  const login = (roleOrUsername, password) => {
    const key = (roleOrUsername || "").trim().toLowerCase();
    if (profilesDB[key]) {
      switchWorkspace(key);
      return { success: true, user: profilesDB[key].profile };
    }
    if (key === "safan" && (password === "safan@123" || !password)) {
      switchWorkspace("patient");
      return { success: true, user: profilesDB.patient.profile };
    }
    if (key === "doctor" && (password === "doctor123" || !password)) {
      switchWorkspace("doctor");
      return { success: true, user: profilesDB.doctor.profile };
    }
    if (key === "admin" && (password === "admin123" || !password)) {
      switchWorkspace("admin");
      return { success: true, user: profilesDB.admin.profile };
    }
    return { success: false, error: "Invalid credentials." };
  };

  const logout = () => {
    localStorage.removeItem("medmind_role");
    setActiveRoleView("patient");
  };

  const updateCurrentRoleProfile = (updatedProfile, updatedDetails) => {
    setProfilesDB((prev) => {
      const current = prev[activeRoleView];
      const detailsKey = 
        activeRoleView === "patient" ? "patient_details" :
        activeRoleView === "doctor" ? "clinician_details" : "admin_details";

      return {
        ...prev,
        [activeRoleView]: {
          ...current,
          profile: { ...current.profile, ...updatedProfile },
          [detailsKey]: { ...current[detailsKey], ...updatedDetails }
        }
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser, // Alias so both useAuth().user and useAuth().currentUser work!
        currentUser,
        currentRoleData,
        profilesDB,
        activeRoleView,
        login,
        logout,
        switchWorkspace,
        updateCurrentRoleProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}