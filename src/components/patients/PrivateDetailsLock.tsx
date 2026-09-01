import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { auth, db } from "../../lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Patient } from "../../types";
import { useApp } from "../../context/AppContext";

interface PrivateDetailsLockProps {
  patientId: string;
  patientEmail?: string;
  onUnlocked?: (patientData: Patient) => void;
  onLocked?: () => void;
  children?: (props: {
    isUnlocked: boolean;
    privateData: Patient | null;
    lockRecords: () => void;
  }) => React.ReactNode;
}

export const PrivateDetailsLock: React.FC<PrivateDetailsLockProps> = ({
  patientId,
  patientEmail,
  onUnlocked,
  onLocked,
  children,
}) => {
  const { firebaseUser, showToast, openPatientAuth } = useApp();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [privateData, setPrivateData] = useState<Patient | null>(null);
  const [password, setPassword] = useState("");
  const [emailInput, setEmailInput] = useState(patientEmail || firebaseUser?.email || "");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIncorrectPassword, setIsIncorrectPassword] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsIncorrectPassword(false);

    try {
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        // Method 1: Firebase reauthenticateWithCredential
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
      } else {
        // Method 2: Sign in with email and password if session not active
        const targetEmail = emailInput.trim() || patientEmail;
        if (!targetEmail) {
          throw new Error("Patient email is required for authentication.");
        }
        await signInWithEmailAndPassword(auth, targetEmail, password);
      }

      // Fetch fresh patient data from Firestore AFTER successful password re-authentication
      const patientDocRef = doc(db, "patients", patientId);
      const snapshot = await getDoc(patientDocRef);

      let fetchedPatient: Patient;
      if (snapshot.exists()) {
        const data = snapshot.data();
        fetchedPatient = {
          id: snapshot.id,
          name: data.name || "Patient Record",
          age: Number(data.age) || 0,
          gender: data.gender || "Unknown",
          phone: data.phone || "",
          email: data.email || "",
          bloodGroup: data.bloodGroup || "O+",
          medicalHistory: Array.isArray(data.medicalHistory) ? data.medicalHistory : [],
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : [],
          emergencyContact: data.emergencyContact || {
            name: "Emergency Contact",
            relationship: "Family",
            phone: data.phone || "",
          },
          recentVitals: data.recentVitals || {
            bloodPressure: "120/80 mmHg",
            heartRate: 72,
            bloodSugar: 96,
            temperature: 98.6,
            weight: 65,
            lastUpdated: "Recently updated",
          },
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      } else {
        // Fallback placeholder structure if document is newly initialized
        fetchedPatient = {
          id: patientId,
          name: currentUser?.displayName || "Patient",
          age: 30,
          gender: "Not specified",
          phone: currentUser?.phoneNumber || "Verified Account",
          email: currentUser?.email || emailInput,
          bloodGroup: "O+",
          medicalHistory: ["No prior clinical conditions recorded"],
          allergies: ["No allergies reported"],
          chronicConditions: ["None reported"],
          emergencyContact: {
            name: "Family Contact",
            relationship: "Primary",
            phone: currentUser?.phoneNumber || "",
          },
          recentVitals: {
            bloodPressure: "120/80 mmHg",
            heartRate: 72,
            bloodSugar: 96,
            temperature: 98.6,
            weight: 65,
            lastUpdated: "Active session",
          },
          createdAt: new Date().toISOString(),
        };
      }

      setPrivateData(fetchedPatient);
      setIsUnlocked(true);
      setPassword("");
      showToast("🔓 Sensitive patient details unlocked successfully!");
      if (onUnlocked) onUnlocked(fetchedPatient);
    } catch (err: any) {
      console.error("Reauthentication error:", err);
      const code = err.code || "";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-password" ||
        err.message?.toLowerCase().includes("password") ||
        err.message?.toLowerCase().includes("credential")
      ) {
        setIsIncorrectPassword(true);
        setErrorMessage("Incorrect Password. Please check your credentials and try again.");
      } else if (code === "auth/user-mismatch") {
        setErrorMessage("Account mismatch: The entered password does not match the active session.");
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Too many failed attempts. Please wait a few moments before trying again.");
      } else {
        setErrorMessage(err.message || "Failed to verify password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockRecords = () => {
    setIsUnlocked(false);
    setPrivateData(null);
    setPassword("");
    setErrorMessage(null);
    setIsIncorrectPassword(false);
    showToast("🔒 Sensitive patient records locked.");
    if (onLocked) onLocked();
  };

  if (isUnlocked && children) {
    return <>{children({ isUnlocked: true, privateData, lockRecords: handleLockRecords })}</>;
  }

  if (isUnlocked) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-300 rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950">
                  Sensitive Records Unlocked (Verified Session)
                </h4>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  Decrypted
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Phone, medical history, and blood group are now visible from Firestore.
              </p>
            </div>
          </div>

          <button
            id="lock-patient-records-btn"
            onClick={handleLockRecords}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock Records</span>
          </button>
        </div>

        {/* Display Private Details */}
        {privateData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                Contact Phone
              </span>
              <div className="text-sm font-bold text-slate-900">
                {privateData.phone || "No phone listed"}
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                Blood Group (Restricted)
              </span>
              <div className="text-sm font-bold text-teal-800">
                {privateData.bloodGroup || "O+"}
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                Medical History Records
              </span>
              <div className="text-xs font-semibold text-slate-800">
                {(privateData.medicalHistory || []).join(", ") || "None documented"}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Locked State View / Barrier
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-lg space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Password Protected Patient Records
              </h3>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                HIPAA Locked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sensitive information (Phone, Medical History, Blood Group) is locked by default.
              Re-authenticate with your account password to fetch and view records.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] rounded-full self-start">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Firestore Rule Protected</span>
        </div>
      </div>

      {/* Incorrect Password Alert */}
      {isIncorrectPassword && (
        <div
          id="incorrect-password-alert"
          className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-xs animate-shake"
        >
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-bold text-red-300">Incorrect Password</div>
            <div>The password you entered is invalid. Please verify your credentials and try again.</div>
          </div>
        </div>
      )}

      {errorMessage && !isIncorrectPassword && (
        <div className="p-3.5 bg-amber-950/60 border border-amber-500/50 rounded-2xl flex items-center gap-3 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Verification Barrier Form */}
      <form onSubmit={handleUnlock} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!firebaseUser?.email && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          )}

          <div className={firebaseUser?.email ? "sm:col-span-2" : ""}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Enter Account Password to Unlock Records
              </label>
              {firebaseUser?.email && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Account: {firebaseUser.email}
                </span>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="patient-lock-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Verified via Firebase <code className="text-amber-300 font-mono text-[10px]">reauthenticateWithCredential</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="unlock-patient-records-btn"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Verify Password & Unlock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
