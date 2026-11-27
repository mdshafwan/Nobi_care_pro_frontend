import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProfileSettingsPage() {
  const { currentRoleData, activeRoleView, updateCurrentRoleProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profileTab');

  // Form State
  const [profileForm, setProfileForm] = useState(currentRoleData.profile);
  const [patientDetailsForm, setPatientDetailsForm] = useState(currentRoleData.patient_details || {});
  const [clinicianDetailsForm, setClinicianDetailsForm] = useState(currentRoleData.clinician_details || {});
  const [adminDetailsForm, setAdminDetailsForm] = useState(currentRoleData.admin_details || {});

  // Synchronize form when workspace role changes
  useEffect(() => {
    setProfileForm(currentRoleData.profile);
    if (currentRoleData.patient_details) setPatientDetailsForm(currentRoleData.patient_details);
    if (currentRoleData.clinician_details) setClinicianDetailsForm(currentRoleData.clinician_details);
    if (currentRoleData.admin_details) setAdminDetailsForm(currentRoleData.admin_details);
  }, [currentRoleData, activeRoleView]);

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfileForm(prev => ({ ...prev, [id]: value }));
  };

  const handlePatientChange = (e) => {
    const { id, value } = e.target;
    setPatientDetailsForm(prev => ({ ...prev, [id]: value }));
  };

  const handleClinicianChange = (e) => {
    const { id, value } = e.target;
    setClinicianDetailsForm(prev => ({ ...prev, [id]: value }));
  };

  const handleAdminChange = (e) => {
    const { id, value } = e.target;
    setAdminDetailsForm(prev => ({ ...prev, [id]: value }));
  };

  // Avatar Image Upload Preview Handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAvatarUrl = event.target.result;
        setProfileForm(prev => ({ ...prev, avatar: newAvatarUrl }));
        updateCurrentRoleProfile({ avatar: newAvatarUrl }, {});
        showToast("Profile avatar preview updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // Save All Settings
  const handleSaveAllSettings = () => {
    let detailsData = {};
    if (activeRoleView === 'patient') detailsData = patientDetailsForm;
    else if (activeRoleView === 'doctor') detailsData = clinicianDetailsForm;
    else if (activeRoleView === 'admin') detailsData = adminDetailsForm;

    updateCurrentRoleProfile(profileForm, detailsData);
    showToast("Database records & entity fields updated successfully!", "success");
  };

  // Password Update Mock Submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    showToast("Password hash updated in PostgreSQL database successfully.", "success");
    e.target.reset();
  };

  // Dynamic Identifier based on active role
  const identifierValue = 
    activeRoleView === 'patient' ? patientDetailsForm.mrn :
    activeRoleView === 'doctor' ? clinicianDetailsForm.license_number :
    adminDetailsForm.employee_id;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* TOP PROFILE BANNER CARD */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          
          {/* Avatar Upload Preview Container */}
          <div className="relative group shrink-0">
            <img 
              src={profileForm.avatar} 
              alt="Profile Avatar" 
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-red-500/20 shadow-md" 
            />
            <label 
              htmlFor="avatarUploadInput" 
              className="absolute inset-0 bg-slate-900/70 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white text-xs font-bold gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Change
            </label>
            <input 
              type="file" 
              id="avatarUploadInput" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload} 
            />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900">{profileForm.full_name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                {activeRoleView.toUpperCase()} / VERIFIED
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Identity & Record Identifier: <span className="font-mono text-slate-800 font-bold">{identifierValue}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>{profileForm.email}</span>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <button 
            onClick={handleSaveAllSettings} 
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Save Profile Records</span>
          </button>
        </div>
      </div>

      {/* SETTINGS TABS & MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT TAB SUBMENU (4 COLS) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2 h-fit">
          <button 
            onClick={() => setActiveTab('profileTab')} 
            className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'profileTab' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <div>
              <span className="block leading-tight font-bold">Personal & Contact Profile</span>
              <span className="text-[10px] text-slate-500 font-normal">Table: profiles (Identity & Address)</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('roleSpecificTab')} 
            className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'roleSpecificTab' 
                ? 'bg-red-50 text-red-700 font-bold border border-red-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold border border-transparent'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <div>
              <span className="block leading-tight font-bold">{currentRoleData.roleTabTitle}</span>
              <span className="text-[10px] text-slate-500 font-normal">{currentRoleData.roleTabSubtitle}</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('securityTab')} 
            className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'securityTab' 
                ? 'bg-red-50 text-red-700 font-bold border border-red-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold border border-transparent'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <div>
              <span className="block leading-tight font-bold">Password & Authentication</span>
              <span className="text-[10px] text-slate-500 font-normal">Table: users (Password Hash)</span>
            </div>
          </button>
        </div>

        {/* RIGHT TAB CONTENT CONTAINER (8 COLS) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
          
          {/* TAB 1: PERSONAL & CONTACT (Table: profiles) */}
          {activeTab === 'profileTab' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 00-3 3h6a3 3 0 00-3-3z"/>
                  </svg>
                  Personal Demographics & Address (<span className="font-mono text-xs text-red-600">profiles</span>)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Core demographic records, national identification, and residential address.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    id="full_name" 
                    value={profileForm.full_name || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">National ID / Passport</label>
                  <input 
                    type="text" 
                    id="national_id" 
                    value={profileForm.national_id || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium font-mono" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={profileForm.email || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    id="phone" 
                    value={profileForm.phone || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Date of Birth</label>
                  <input 
                    type="date" 
                    id="dob" 
                    value={profileForm.dob || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Gender</label>
                  <select 
                    id="gender" 
                    value={profileForm.gender || 'Male'} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Marital Status</label>
                  <select 
                    id="marital_status" 
                    value={profileForm.marital_status || 'Single'} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Preferred Language</label>
                  <input 
                    type="text" 
                    id="language" 
                    value={profileForm.language || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Street Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    value={profileForm.address || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    value={profileForm.city || ''} 
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Country & Postal Code</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      id="country" 
                      placeholder="Country" 
                      value={profileForm.country || ''} 
                      onChange={handleProfileChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                    />
                    <input 
                      type="text" 
                      id="postal_code" 
                      placeholder="Postal Code" 
                      value={profileForm.postal_code || ''} 
                      onChange={handleProfileChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                    />
                  </div>
                </div>

                {/* Emergency Contact Information Block */}
                <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Emergency Contact Records</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-1">Contact Name</label>
                      <input 
                        type="text" 
                        id="emergency_name" 
                        value={profileForm.emergency_name || ''} 
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-1">Contact Phone</label>
                      <input 
                        type="text" 
                        id="emergency_phone" 
                        value={profileForm.emergency_phone || ''} 
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-semibold block mb-1">Relation</label>
                      <input 
                        type="text" 
                        id="emergency_relation" 
                        value={profileForm.emergency_relation || ''} 
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500 font-medium" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE-SPECIFIC ENTITY DETAILS */}
          {activeTab === 'roleSpecificTab' && (
            <div className="space-y-6">
              
              {/* PATIENT DETAILS FORM BLOCK */}
              {activeRoleView === 'patient' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Clinical History & Insurance (<span className="font-mono text-xs text-red-600">patient_details</span>)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Medical baseline, allergies, chronic illness, and insurance policy coverage.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Medical Record Number (MRN)</label>
                      <input 
                        type="text" 
                        value={patientDetailsForm.mrn || ''} 
                        readOnly 
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-700 font-mono font-bold cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Blood Group</label>
                      <input 
                        type="text" 
                        id="blood_group" 
                        value={patientDetailsForm.blood_group || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Height (cm)</label>
                      <input 
                        type="number" 
                        id="height_cm" 
                        value={patientDetailsForm.height_cm || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        id="weight_kg" 
                        value={patientDetailsForm.weight_kg || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Smoking Status</label>
                      <select 
                        id="smoking_status" 
                        value={patientDetailsForm.smoking_status || 'never'} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                      >
                        <option value="never">Never Smoked</option>
                        <option value="former">Former Smoker</option>
                        <option value="current">Current Smoker</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Insurance Provider</label>
                      <input 
                        type="text" 
                        id="insurance_provider" 
                        value={patientDetailsForm.insurance_provider || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Insurance Policy Number</label>
                      <input 
                        type="text" 
                        id="insurance_policy_number" 
                        value={patientDetailsForm.insurance_policy_number || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Known Allergies</label>
                      <textarea 
                        id="known_allergies" 
                        rows="2" 
                        value={patientDetailsForm.known_allergies || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                      ></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Chronic Illnesses</label>
                      <textarea 
                        id="chronic_illnesses" 
                        rows="2" 
                        value={patientDetailsForm.chronic_illnesses || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                      ></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Current Medications</label>
                      <textarea 
                        id="current_medications" 
                        rows="2" 
                        value={patientDetailsForm.current_medications || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                      ></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Family Medical History</label>
                      <textarea 
                        id="family_history" 
                        rows="2" 
                        value={patientDetailsForm.family_history || ''} 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* CLINICIAN DETAILS FORM BLOCK */}
              {activeRoleView === 'doctor' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                      Clinical Credentials & Specialty (<span className="font-mono text-xs text-red-600">clinician_details</span>)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Medical license, hospital department, on-call status, and qualifications.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Medical License Number</label>
                      <input 
                        type="text" 
                        value={clinicianDetailsForm.license_number || ''} 
                        readOnly 
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-700 font-mono font-bold cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Specialization</label>
                      <input 
                        type="text" 
                        id="specialization" 
                        value={clinicianDetailsForm.specialization || ''} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Department</label>
                      <input 
                        type="text" 
                        id="department" 
                        value={clinicianDetailsForm.department || ''} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Years of Experience</label>
                      <input 
                        type="number" 
                        id="years_of_experience" 
                        value={clinicianDetailsForm.years_of_experience || ''} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Qualification Degree</label>
                      <input 
                        type="text" 
                        id="qualification" 
                        value={clinicianDetailsForm.qualification || ''} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Employment Type</label>
                      <select 
                        id="employment_type" 
                        value={clinicianDetailsForm.employment_type || 'full_time'} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contractor</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Languages Spoken</label>
                      <input 
                        type="text" 
                        id="languages_spoken" 
                        value={clinicianDetailsForm.languages_spoken || ''} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Clinician Professional Bio</label>
                      <textarea 
                        id="bio" 
                        rows="3" 
                        value={clinicianDetailsForm.bio || ''} 
                        onChange={handleClinicianChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN DETAILS FORM BLOCK */}
              {activeRoleView === 'admin' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      Administrative Governance & Access (<span className="font-mono text-xs text-red-600">admin_details</span>)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Staff employee identification, governance department, and ledger access tier.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Employee ID</label>
                      <input 
                        type="text" 
                        value={adminDetailsForm.employee_id || ''} 
                        readOnly 
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-700 font-mono font-bold cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Job Title</label>
                      <input 
                        type="text" 
                        id="job_title" 
                        value={adminDetailsForm.job_title || ''} 
                        onChange={handleAdminChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Administrative Department</label>
                      <input 
                        type="text" 
                        id="department" 
                        value={adminDetailsForm.department || ''} 
                        onChange={handleAdminChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Access Authorization Level</label>
                      <select 
                        id="access_level" 
                        value={adminDetailsForm.access_level || 'super_admin'} 
                        onChange={handleAdminChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
                      >
                        <option value="super_admin">Super Administrator</option>
                        <option value="operations">Hospital Operations</option>
                        <option value="records_manager">Medical Records Manager</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD & CREDENTIALS (Table: users) */}
          {activeTab === 'securityTab' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Authentication Credentials (<span className="font-mono text-xs text-red-600">users.password_hash</span>)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Update your salted hash password credentials securely.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Current Active Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium" 
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Update Password Hash
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}