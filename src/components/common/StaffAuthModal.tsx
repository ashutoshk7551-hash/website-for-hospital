import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  Stethoscope,
  Pill,
  Building2,
  TestTube2,
  User,
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Hospital,
  Fingerprint,
  Layers,
  FileText,
} from "lucide-react";

export const StaffAuthModal: React.FC = () => {
  const {
    staffAuthModalOpen,
    setStaffAuthModalOpen,
    staffAuthRole,
    setStaffAuthRole,
    staffMembers,
    currentStaffId,
    loginStaff,
    openPatientAuth,
    showToast,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(staffAuthRole || "doctor");
  const [credentials, setCredentials] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [successStaff, setSuccessStaff] = useState<any | null>(null);

  // Sync selectedRole when modal opens with a specific role
  useEffect(() => {
    if (staffAuthModalOpen) {
      setSelectedRole(staffAuthRole || "doctor");
      setCredentials("");
      setPassword("");
      setErrorMessage("");
      setSuccessStaff(null);
    }
  }, [staffAuthModalOpen, staffAuthRole]);

  if (!staffAuthModalOpen) return null;

  const roleConfigs: Record<
    Exclude<UserRole, "patient">,
    {
      title: string;
      subtitle: string;
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      badgeColor: string;
      accentBg: string;
      defaultPlaceholder: string;
      demoHint: string;
    }
  > = {
    doctor: {
      title: "Doctor & Specialist Sign In",
      subtitle: "Clinical EHR, e-Prescribing & Consultation Desk",
      icon: Stethoscope,
      color: "text-teal-600",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      accentBg: "bg-teal-600",
      defaultPlaceholder: "e.g. DOC-201 or sarah.chen@peoples-hospital.org",
      demoHint: "DOC-201 (Dr. Sarah Chen) or DOC-202 (Dr. Michael Patel)",
    },
    pharmacist: {
      title: "Pharmacist & Dispensary Sign In",
      subtitle: "e-Prescription Verification, Drug Interactions & Inventory",
      icon: Pill,
      color: "text-emerald-600",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accentBg: "bg-emerald-600",
      defaultPlaceholder: "e.g. PHARM-101 or james.wright@peoples-hospital.org",
      demoHint: "PHARM-101 (Pharm. James Wright) or PHARM-102 (Pharm. Linda Zhao)",
    },
    admin: {
      title: "Hospital Administrator Sign In",
      subtitle: "Hospital Operations, Bed Capacity, Billing & Staff Master",
      icon: Building2,
      color: "text-indigo-600",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      accentBg: "bg-indigo-600",
      defaultPlaceholder: "e.g. ADM-001 or robert.taylor@peoples-hospital.org",
      demoHint: "ADM-001 (Administrator Robert Taylor)",
    },
    lab_tech: {
      title: "Laboratory Scientist Sign In",
      subtitle: "Diagnostic Pathology, Sample Processing & Digital Reports",
      icon: TestTube2,
      color: "text-purple-600",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accentBg: "bg-purple-600",
      defaultPlaceholder: "e.g. LAB-301 or emily.brooks@peoples-hospital.org",
      demoHint: "LAB-301 (Dr. Emily Brooks, MSc)",
    },
  };

  const filteredStaff = staffMembers.filter((s) => s.role === selectedRole);
  const currentConfig = roleConfigs[selectedRole as Exclude<UserRole, "patient">] || roleConfigs.doctor;
  const RoleIcon = currentConfig.icon;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.trim()) {
      setErrorMessage("Please enter your Staff ID, License Number, or Work Email.");
      return;
    }

    setAuthenticating(true);
    setErrorMessage("");

    setTimeout(() => {
      const ok = loginStaff(credentials, selectedRole);
      setAuthenticating(false);
      if (ok) {
        const found = staffMembers.find(
          (s) =>
            s.id.toLowerCase() === credentials.trim().toLowerCase() ||
            s.email.toLowerCase() === credentials.trim().toLowerCase() ||
            (s.licenseNumber && s.licenseNumber.toLowerCase() === credentials.trim().toLowerCase())
        );
        setSuccessStaff(found || null);
        setTimeout(() => {
          setStaffAuthModalOpen(false);
        }, 1200);
      } else {
        setErrorMessage(
          `No active ${selectedRole.replace("_", " ")} record found for "${credentials}". Use one of the fast-access profiles below or verify ID.`
        );
      }
    }, 600);
  };

  const handleQuickLogin = (staff: any) => {
    setAuthenticating(true);
    setErrorMessage("");

    setTimeout(() => {
      const ok = loginStaff(staff.id, staff.role);
      setAuthenticating(false);
      if (ok) {
        setSuccessStaff(staff);
        setTimeout(() => {
          setStaffAuthModalOpen(false);
        }, 1100);
      }
    }, 400);
  };

  return (
    <div
      id="staff-auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={() => setStaffAuthModalOpen(false)}
    >
      <div
        id="staff-auth-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">Staff & Clinical Authentication</span>
                <span className="text-[10px] font-mono bg-teal-950/80 text-teal-300 px-2 py-0.5 rounded border border-teal-800 font-semibold">
                  SECURE PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">People's Hospital Unified Access Management</p>
            </div>
          </div>

          <button
            id="staff-auth-close-btn"
            onClick={() => setStaffAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-100/80 p-2 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              id="staff-role-tab-doctor"
              onClick={() => {
                setSelectedRole("doctor");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedRole === "doctor"
                  ? "bg-white text-teal-700 shadow-sm border border-teal-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Doctor</span>
            </button>

            <button
              id="staff-role-tab-pharmacist"
              onClick={() => {
                setSelectedRole("pharmacist");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedRole === "pharmacist"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Pharmacist</span>
            </button>

            <button
              id="staff-role-tab-admin"
              onClick={() => {
                setSelectedRole("admin");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedRole === "admin"
                  ? "bg-white text-indigo-700 shadow-sm border border-indigo-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Admin</span>
            </button>

            <button
              id="staff-role-tab-lab"
              onClick={() => {
                setSelectedRole("lab_tech");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedRole === "lab_tech"
                  ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <TestTube2 className="w-4 h-4 text-purple-600" />
              <span>Laboratory</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {successStaff ? (
            <div className="py-8 text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Authentication Verified</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Accessing {successStaff.designation} workspace...
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium text-slate-700">
                <span className="font-bold text-slate-900">{successStaff.name}</span>
                <span>•</span>
                <span className="font-mono text-teal-700">{successStaff.id}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Role Header Banner */}
              <div className="flex items-start justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl bg-white shadow-2xs border border-slate-200 ${currentConfig.color}`}>
                    <RoleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{currentConfig.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{currentConfig.subtitle}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${currentConfig.badgeColor}`}>
                  {selectedRole.toUpperCase().replace("_", " ")}
                </span>
              </div>

              {/* Quick 1-Click Fast Access Staff Profiles */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fast-Access {selectedRole.replace("_", " ").toUpperCase()} Profiles (1-Click)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click to instantly authenticate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredStaff.map((staff) => {
                    const isCurrent = currentStaffId === staff.id;
                    return (
                      <div
                        key={staff.id}
                        id={`quick-staff-btn-${staff.id}`}
                        onClick={() => handleQuickLogin(staff)}
                        className={`p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-3 group hover:shadow-md ${
                          isCurrent
                            ? "bg-teal-50/70 border-teal-300 ring-1 ring-teal-400"
                            : "bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                        }`}
                      >
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700">
                              {staff.name}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] bg-teal-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{staff.designation}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                              {staff.id}
                            </span>
                            {staff.licenseNumber && (
                              <span className="truncate">{staff.licenseNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider with OR */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-3 text-[11px] font-bold text-slate-400 uppercase">
                  Or Sign In with Staff ID / License
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Manual Login Form */}
              <form onSubmit={handleCustomLogin} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff ID, Work Email, or License Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="staff-credentials-input"
                      value={credentials}
                      onChange={(e) => setCredentials(e.target.value)}
                      placeholder={currentConfig.defaultPlaceholder}
                      className="w-full px-3.5 py-2.5 pl-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Hint: {currentConfig.demoHint}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security PIN / Passcode (Demo: any PIN or 123456)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="staff-pin-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pl-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    id="staff-submit-login-btn"
                    disabled={authenticating}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    {authenticating ? (
                      <span>Verifying Security Access...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>Authorize & Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Patient Portal Switch Notice */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Are you a patient looking for records or appointments?</span>
                </div>
                <button
                  id="switch-to-patient-auth-btn"
                  onClick={() => {
                    setStaffAuthModalOpen(false);
                    openPatientAuth("signin");
                  }}
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Patient Sign In →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
