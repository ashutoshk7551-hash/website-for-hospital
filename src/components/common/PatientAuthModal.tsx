import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  UserPlus,
  LogIn,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  HeartPulse,
  Activity,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  Plus,
  Lock,
} from "lucide-react";

export const PatientAuthModal: React.FC = () => {
  const {
    patientAuthModalOpen,
    setPatientAuthModalOpen,
    patientAuthMode,
    setPatientAuthMode,
    patients,
    currentPatientId,
    registerPatient,
    loginPatient,
    openStaffAuth,
    setCurrentPage,
    showToast,
  } = useApp();

  // Registration Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">(32);
  const [gender, setGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("+1 (555) ");
  const [email, setEmail] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Allergies & Conditions
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");

  // Vitals
  const [bloodPressure, setBloodPressure] = useState("120/80 mmHg");
  const [heartRate, setHeartRate] = useState<number>(72);
  const [bloodSugar, setBloodSugar] = useState<number>(96);
  const [weight, setWeight] = useState<number>(65);

  // Login Search State
  const [loginQuery, setLoginQuery] = useState("");
  const [loginError, setLoginError] = useState("");

  // Registration Success Card State
  const [registeredCard, setRegisteredCard] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (patientAuthModalOpen) {
      setRegisteredCard(null);
      setLoginError("");
      setCopiedId(false);
    }
  }, [patientAuthModalOpen, patientAuthMode]);

  if (!patientAuthModalOpen) return null;

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const commonAllergies = ["Penicillin", "Sulfa Drugs", "Aspirin", "Peanuts", "Latex", "NSAIDs"];
  const commonConditions = [
    "Hypertension",
    "Type 2 Diabetes",
    "Asthma",
    "Hyperlipidemia",
    "Thyroid Disorder",
  ];

  const handleToggleAllergy = (item: string) => {
    if (selectedAllergies.includes(item)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== item));
    } else {
      setSelectedAllergies([...selectedAllergies, item]);
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies([...selectedAllergies, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const handleToggleCondition = (item: string) => {
    if (selectedConditions.includes(item)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== item));
    } else {
      setSelectedConditions([...selectedConditions, item]);
    }
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions([...selectedConditions, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Please enter patient's full name.");
      return;
    }

    const patientData = {
      name: name.trim(),
      age: Number(age) || 30,
      gender,
      bloodGroup,
      phone: phone.trim() || "+1 (555) 000-0000",
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      emergencyContact: {
        name: emergencyName.trim() || "Family Contact",
        relationship: emergencyRelation || "Guardian",
        phone: emergencyPhone.trim() || phone || "+1 (555) 999-9999",
      },
      allergies: selectedAllergies.length > 0 ? selectedAllergies : ["None known"],
      chronicConditions: selectedConditions.length > 0 ? selectedConditions : ["None documented"],
      recentVitals: {
        bloodPressure: bloodPressure || "120/80 mmHg",
        heartRate: Number(heartRate) || 72,
        bloodSugar: Number(bloodSugar) || 95,
        temperature: 98.6,
        weight: Number(weight) || 65,
        oxygenSaturation: 98,
        lastUpdated: "Just registered",
      },
    };

    const newPatient = registerPatient(patientData);
    setRegisteredCard(newPatient);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginQuery.trim()) {
      setLoginError("Please enter your Patient ID or registered email.");
      return;
    }

    const success = loginPatient(loginQuery);
    if (success) {
      setPatientAuthModalOpen(false);
      setCurrentPage("patient-portal");
    } else {
      setLoginError("No matching patient record found. Please verify or register as a new patient.");
    }
  };

  const handleSelectExistingPatient = (patientId: string) => {
    loginPatient(patientId);
    setPatientAuthModalOpen(false);
    setCurrentPage("patient-portal");
  };

  const copyPatientId = () => {
    if (registeredCard?.id) {
      navigator.clipboard.writeText(registeredCard.id);
      setCopiedId(true);
      showToast(`Copied Patient ID: ${registeredCard.id}`);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden relative">
        {/* Top Accent Gradient */}
        <div className="h-2 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-600" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  People's Hospital Patient Portal
                </h2>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200 uppercase">
                  Digital EHR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant patient registration, generated ID card, and health status tracking.
              </p>
            </div>
          </div>

          <button
            id="close-patient-auth-modal"
            onClick={() => setPatientAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Registered Card is active, show Success ID Card Screen */}
        {registeredCard ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                Patient Registration Completed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your medical profile and digital electronic health record have been generated.
              </p>
            </div>

            {/* Digital Patient ID Card Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-teal-500/30 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                    People's Hospital • Digital Health Card
                  </div>
                  <h4 className="text-xl font-extrabold text-white mt-1">
                    {registeredCard.name}
                  </h4>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {registeredCard.age} yrs • {registeredCard.gender} • Blood Group: <span className="font-bold text-teal-300">{registeredCard.bloodGroup}</span>
                  </div>
                </div>

                <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-teal-300">
                  <QrCode className="w-7 h-7" />
                </div>
              </div>

              {/* Patient ID Code Block */}
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">
                    Official Patient ID Number
                  </div>
                  <div className="text-2xl font-mono font-bold text-teal-300 tracking-wider">
                    {registeredCard.id}
                  </div>
                </div>

                <button
                  id="copy-patient-id-btn"
                  onClick={copyPatientId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition self-start sm:self-auto"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  📞 {registeredCard.phone}
                </span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  ✉️ {registeredCard.email}
                </span>
                <span className="bg-teal-500/20 text-teal-200 px-2.5 py-1 rounded-lg border border-teal-400/30 font-semibold">
                  ✓ Active Patient Session
                </span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="book-appointment-after-signup-btn"
                onClick={() => {
                  setPatientAuthModalOpen(false);
                  setCurrentPage("appointments");
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-blue-200" />
                Book Doctor Appointment
              </button>

              <button
                id="view-health-portal-after-signup-btn"
                onClick={() => {
                  setPatientAuthModalOpen(false);
                  setCurrentPage("patient-portal");
                }}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <HeartPulse className="w-4 h-4 text-teal-200" />
                Check My Health Status & Records
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-7 space-y-5">
            {/* Quick Switch to Staff Auth Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs border border-slate-700/80 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-300">
                  Are you a <strong className="text-white">Doctor, Pharmacist, Admin,</strong> or <strong className="text-white">Lab Tech</strong>?
                </span>
              </div>
              <button
                type="button"
                id="patient-modal-switch-to-staff-btn"
                onClick={() => {
                  setPatientAuthModalOpen(false);
                  openStaffAuth("doctor");
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1 rounded-xl text-[11px] transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Staff Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                id="tab-register-patient"
                onClick={() => setPatientAuthMode("register")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  patientAuthMode === "register"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>New Patient Sign In / Register</span>
              </button>

              <button
                id="tab-login-patient"
                onClick={() => setPatientAuthMode("signin")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  patientAuthMode === "signin"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Existing Patient Login</span>
              </button>
            </div>

            {/* TAB 1: NEW PATIENT REGISTRATION FORM */}
            {patientAuthMode === "register" ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-6 max-h-[62vh] overflow-y-auto pr-1">
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <span className="font-bold">Register Once, Access Anywhere:</span> Filling this form will instantly generate your unique <span className="font-bold text-blue-700">Patient ID</span> to book appointments, receive doctor e-prescriptions, and view laboratory reports.
                  </div>
                </div>

                {/* Section 1: Basic Information */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    1. Patient Personal Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-patient-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sophia Martinez"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-patient-age"
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="32"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-patient-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Blood Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-patient-blood"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-semibold"
                      >
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="reg-patient-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 345-6789"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="reg-patient-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sophia.m@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Emergency Contact */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-red-500" />
                    2. Emergency Contact Person
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Contact Name
                      </label>
                      <input
                        id="reg-emergency-name"
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. David Martinez"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Relationship
                      </label>
                      <select
                        id="reg-emergency-relation"
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend / Relative</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Emergency Phone
                      </label>
                      <input
                        id="reg-emergency-phone"
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+1 (555) 890-1234"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Medical Background & Allergies */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    3. Allergies & Known Conditions
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Drug / Food Allergies (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {commonAllergies.map((all) => {
                        const isSelected = selectedAllergies.includes(all);
                        return (
                          <button
                            type="button"
                            key={all}
                            onClick={() => handleToggleAllergy(all)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              isSelected
                                ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400/20"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {all}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        placeholder="Other allergy (e.g. Iodine, Pollen)..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAllergy}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pre-existing Medical Conditions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {commonConditions.map((cond) => {
                        const isSelected = selectedConditions.includes(cond);
                        return (
                          <button
                            type="button"
                            key={cond}
                            onClick={() => handleToggleCondition(cond)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-400/20"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {cond}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        placeholder="Other condition (e.g. Migraine, GERD)..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCondition}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 4: Initial Baseline Health Vitals */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    4. Baseline Health Vitals (Optional)
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Blood Pressure
                      </label>
                      <input
                        type="text"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        placeholder="120/80 mmHg"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(Number(e.target.value))}
                        placeholder="72"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Blood Sugar (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(Number(e.target.value))}
                        placeholder="95"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        placeholder="65"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Button */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>HIPAA & FHIR Standard Encrypted Health Record</span>
                  </div>

                  <button
                    id="submit-patient-register-btn"
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Generate Patient ID & Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: EXISTING PATIENT SIGN IN */
              <div className="space-y-6 max-h-[62vh] overflow-y-auto pr-1">
                {/* Search / Direct Login Box */}
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter Patient ID, Registered Email, or Full Name:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="login-patient-input"
                      type="text"
                      value={loginQuery}
                      onChange={(e) => {
                        setLoginQuery(e.target.value);
                        setLoginError("");
                      }}
                      placeholder="e.g. PAT-1082 or Eleanor Vance or email..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    <button
                      id="login-patient-submit-btn"
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  </div>

                  {loginError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{loginError}</span>
                    </div>
                  )}
                </form>

                {/* Quick Select Saved Patient Accounts */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Quick Select Saved Patient Record</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {patients.length} records available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patients.map((p) => {
                      const isCurrent = p.id === currentPatientId;
                      return (
                        <div
                          key={p.id}
                          id={`select-patient-${p.id}`}
                          onClick={() => handleSelectExistingPatient(p.id)}
                          className={`p-3.5 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between gap-3 group ${
                            isCurrent
                              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20"
                              : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                              {p.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                <span className="font-mono text-teal-700 font-semibold">{p.id}</span> • {p.bloodGroup} • {p.age}y
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isCurrent ? (
                              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Switch →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt to register new */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500">
                    Don't have a registered Patient ID?{" "}
                    <button
                      type="button"
                      onClick={() => setPatientAuthMode("register")}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Sign Up & Generate ID
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
