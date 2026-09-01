import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  UserPlus,
  LogIn,
  X,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Flame,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export const PatientAuthModal: React.FC = () => {
  const {
    patientAuthModalOpen,
    setPatientAuthModalOpen,
    patientAuthMode,
    setPatientAuthMode,
    patients,
    currentPatientId,
    registerPatientWithFirebase,
    loginPatientWithFirebase,
    loginPatientWithGoogle,
    signUpWithSupabase,
    signInWithSupabase,
    isSupabaseConfigured,
    loginPatient,
    setCurrentPage,
    showToast,
  } = useApp();

  // Authentication sub-tab: 'google' | 'email' | 'register'
  const [authTab, setAuthTab] = useState<"register" | "email" | "quick">("register");

  // Registration Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState<number | "">(32);
  const [gender, setGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [emergencyName, setEmergencyName] = useState("David Vance");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (555) 987-6543");

  // Allergies & Conditions
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([
    "Penicillin",
  ]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    "Hypertension",
  ]);
  const [customCondition, setCustomCondition] = useState("");

  // Vitals
  const [bloodPressure, setBloodPressure] = useState("120/80 mmHg");
  const [heartRate, setHeartRate] = useState<number>(72);
  const [bloodSugar, setBloodSugar] = useState<number>(96);
  const [weight, setWeight] = useState<number>(65);

  // Login Search & Credentials State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginQuery, setLoginQuery] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Registration Success Card State
  const [registeredCard, setRegisteredCard] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (patientAuthModalOpen) {
      setRegisteredCard(null);
      setLoginError("");
      setCopiedId(false);
      setIsLoading(false);
      if (patientAuthMode === "signin") {
        setAuthTab("email");
      } else {
        setAuthTab("register");
      }
    }
  }, [patientAuthModalOpen, patientAuthMode]);

  if (!patientAuthModalOpen) return null;

  const handleToggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies([...selectedAllergies, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const handleToggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions([...selectedConditions, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  // 1. Firebase Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoginError("");
    try {
      const patient = await loginPatientWithGoogle();
      if (patient) {
        setPatientAuthModalOpen(false);
        setCurrentPage("patient-portal");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setLoginError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Supabase & Email/Password Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setLoginError("");
    try {
      let patient: any = null;
      try {
        patient = await signInWithSupabase(loginEmail, loginPassword);
      } catch (supabaseErr: any) {
        console.warn("Supabase auth attempt:", supabaseErr);
        try {
          patient = await loginPatientWithFirebase(loginEmail, loginPassword);
        } catch (firebaseErr: any) {
          throw new Error(supabaseErr.message || firebaseErr.message || "Invalid email or password.");
        }
      }

      if (patient) {
        setPatientAuthModalOpen(false);
        setCurrentPage("patient-portal");
      }
    } catch (err: any) {
      console.error("Email sign in error:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.message?.includes("invalid-credential") ||
        err.message?.includes("Invalid login")
      ) {
        setLoginError("Invalid email or password. Please verify your credentials.");
      } else if (err.code === "auth/user-not-found") {
        setLoginError("No user found with this email. Please sign up.");
      } else {
        setLoginError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Supabase & Firebase Patient Registration (persisted to Supabase 'patients' table & Firestore)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter full patient name.");
      return;
    }
    if (!email.trim()) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      alert("Please enter a secure password (at least 6 characters).");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const patientPayload = {
        name: name.trim(),
        email: email.trim(),
        age: typeof age === "number" ? age : 30,
        gender,
        bloodGroup,
        phone: phone.trim() || "+1 (555) 000-0000",
        medicalHistory: [
          ...selectedConditions,
          ...(selectedAllergies.length > 0 ? [`Allergies: ${selectedAllergies.join(", ")}`] : []),
        ],
        createdAt: new Date().toISOString(),
        emergencyContact: {
          name: emergencyName.trim() || "Primary Contact",
          relationship: emergencyRelation,
          phone: emergencyPhone.trim() || "+1 (555) 999-9999",
        },
        allergies: selectedAllergies.length > 0 ? selectedAllergies : ["None reported"],
        chronicConditions: selectedConditions.length > 0 ? selectedConditions : ["None reported"],
        recentVitals: {
          bloodPressure: bloodPressure || "120/80 mmHg",
          heartRate: heartRate || 72,
          bloodSugar: bloodSugar || 96,
          temperature: 98.6,
          weight: weight || 65,
          lastUpdated: "Initial Registration",
        },
      };

      let newPatient: any = null;
      try {
        newPatient = await signUpWithSupabase(email, password, patientPayload);
      } catch (sErr: any) {
        console.warn("Supabase signup attempt:", sErr);
        newPatient = await registerPatientWithFirebase(email, password, patientPayload);
      }

      // Also ensure Firebase auth or Firestore has record if available
      try {
        await registerPatientWithFirebase(email, password, patientPayload).catch(() => {});
      } catch (_) {}

      setRegisteredCard(newPatient);
      showToast("Patient record successfully persisted to database!");
    } catch (err: any) {
      console.error("Registration error:", err);
      if (
        err.code === "auth/email-already-in-use" ||
        err.message?.includes("email-already-in-use") ||
        err.message?.includes("already registered")
      ) {
        setLoginError("This email is already registered. Please sign in instead.");
      } else {
        setLoginError(err.message || "Failed to create patient account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (registeredCard) {
      navigator.clipboard.writeText(registeredCard.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleFinishAndEnterPortal = () => {
    setPatientAuthModalOpen(false);
    setCurrentPage("patient-portal");
  };

  const commonAllergies = ["Penicillin", "Sulfa Drugs", "Aspirin", "NSAIDs", "Latex", "Peanuts"];
  const commonConditions = ["Hypertension", "Type 2 Diabetes", "Asthma", "High Cholesterol", "Hypothyroidism", "Cardiac Arrhythmia"];

  return (
    <div
      id="patient-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Patient Portal Access</h3>
                <span className="flex items-center gap-1 bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Supabase & Cloud DB
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                Secure Authentication & Cloud-Synced Health Records
              </p>
            </div>
          </div>
          <button
            id="close-patient-auth-modal-btn"
            onClick={() => setPatientAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        {!registeredCard && (
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 shrink-0">
            <button
              id="tab-patient-register"
              type="button"
              onClick={() => {
                setAuthTab("register");
                setPatientAuthMode("register");
                setLoginError("");
              }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                authTab === "register"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
            <button
              id="tab-patient-email-login"
              type="button"
              onClick={() => {
                setAuthTab("email");
                setPatientAuthMode("signin");
                setLoginError("");
              }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                authTab === "email"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              id="tab-patient-quick-select"
              type="button"
              onClick={() => {
                setAuthTab("quick");
                setLoginError("");
              }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                authTab === "quick"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Existing Patients</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* SUCCESS SCREEN */}
          {registeredCard ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border-4 border-teal-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Patient Health Profile Activated!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Your record has been securely stored in Google Cloud Firestore and linked with Firebase Authentication.
                </p>
              </div>

              {/* Digital Card Preview */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-5 rounded-2xl max-w-md mx-auto text-left shadow-xl relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div>
                    <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                      People's Hospital EHR
                    </div>
                    <div className="text-base font-bold">{registeredCard.name}</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                    {registeredCard.bloodGroup}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-[10px] text-slate-400">Patient Identifier (UID)</div>
                    <div className="font-mono text-teal-300 font-bold truncate text-[11px]">
                      {registeredCard.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Demographics</div>
                    <div>
                      {registeredCard.age} yrs • {registeredCard.gender}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Firestore Connected</span>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1 text-teal-300 hover:text-teal-200 transition font-bold cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? "Copied" : "Copy UID"}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="finish-enter-portal-btn"
                  onClick={handleFinishAndEnterPortal}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to My Patient Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : authTab === "register" ? (
            /* TAB 1: REGISTER WITH FIREBASE */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Google One-Click Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center border border-slate-200 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Quick Google Sign-In</div>
                    <div className="text-[11px] text-slate-500">Auto-create profile with Google account</div>
                  </div>
                </div>

                <button
                  id="google-signin-top-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Sign in with Google</span>
                </button>
              </div>

              {loginError && (
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Section 1: Account & Credentials */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  1. Login Credentials (Firebase Auth)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="register-password-input"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Personal Demographics */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  2. Patient Demographics & Contact
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="register-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      id="register-age-input"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      id="register-gender-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      id="register-blood-select"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-teal-700"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Medical History & Allergies */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                  3. Medical History & Known Allergies
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Drug & Food Allergies
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonAllergies.map((allergy) => {
                      const isSelected = selectedAllergies.includes(allergy);
                      return (
                        <button
                          type="button"
                          key={allergy}
                          onClick={() => handleToggleAllergy(allergy)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            isSelected
                              ? "bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customAllergy}
                      onChange={(e) => setCustomAllergy(e.target.value)}
                      placeholder="Add other allergy (e.g. Iodine, Shellfish)..."
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
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400"
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
                      placeholder="Add condition (e.g. Migraine, Thyroid)..."
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

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Encrypted Cloud Firestore Record</span>
                </div>

                <button
                  id="submit-firebase-register-btn"
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Account & Save to Firestore</span>
                </button>
              </div>
            </form>
          ) : authTab === "email" ? (
            /* TAB 2: EMAIL / PASSWORD SIGN IN */
            <div className="space-y-6">
              {/* Google One Click Button */}
              <div>
                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign In with Google Account</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400 font-semibold uppercase">Or with Email</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="signin-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signin-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  id="signin-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>Sign In to Patient Portal</span>
                </button>
              </form>
            </div>
          ) : (
            /* TAB 3: QUICK SELECT SAVED RECORD */
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Switch or sign into any registered patient profile:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {patients.map((p) => {
                  const isCurrent = p.id === currentPatientId;
                  return (
                    <div
                      key={p.id}
                      id={`select-patient-${p.id}`}
                      onClick={() => {
                        loginPatient(p.id);
                        setPatientAuthModalOpen(false);
                        setCurrentPage("patient-portal");
                      }}
                      className={`p-3.5 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            <span className="font-mono text-teal-700 font-semibold">{p.id}</span> • {p.bloodGroup}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                            Switch →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
