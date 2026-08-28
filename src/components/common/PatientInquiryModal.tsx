import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  Lock,
  Printer,
  Sparkles,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import { HealthcareApiService } from "../../services/api";
import { AlertUrgency } from "../../services/notificationService";
import { PatientSubmission } from "../../lib/database";

interface PatientInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "general_inquiry" | "patient_intake" | "emergency_triage";
}

export const PatientInquiryModal: React.FC<PatientInquiryModalProps> = ({
  isOpen,
  onClose,
  initialType = "general_inquiry",
}) => {
  const { currentPatient, showToast } = useApp();

  const [submissionType, setSubmissionType] = useState<"general_inquiry" | "patient_intake" | "emergency_triage">(initialType);
  const [fullName, setFullName] = useState(currentPatient?.name || "");
  const [phone, setPhone] = useState(currentPatient?.phone || "");
  const [email, setEmail] = useState(currentPatient?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState("1992-05-18");
  const [gender, setGender] = useState(currentPatient?.gender || "Female");
  const [department, setDepartment] = useState("General Medicine");
  const [urgency, setUrgency] = useState<AlertUrgency>("routine");
  const [medicalConcern, setMedicalConcern] = useState("");
  const [allergies, setAllergies] = useState<string[]>(currentPatient?.allergies || []);
  const [chronicConditions, setChronicConditions] = useState<string[]>(currentPatient?.chronicConditions || []);
  const [consentGiven, setConsentGiven] = useState(true);
  const [hipaaAgreed, setHipaaAgreed] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<PatientSubmission | null>(null);

  // Sync with current patient if opened
  React.useEffect(() => {
    if (currentPatient) {
      setFullName(currentPatient.name);
      setPhone(currentPatient.phone);
      setEmail(currentPatient.email);
      setGender(currentPatient.gender);
      setAllergies(currentPatient.allergies);
      setChronicConditions(currentPatient.chronicConditions);
    }
  }, [currentPatient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Run Validation
    const validation = HealthcareApiService.validateSubmissionForm({
      fullName,
      phone,
      email,
      dateOfBirth,
      medicalConcern,
      department,
      consentGiven,
      hipaaAgreed,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let result: PatientSubmission;

      if (submissionType === "patient_intake") {
        result = await HealthcareApiService.submitIntake({
          fullName,
          phone,
          email,
          dateOfBirth,
          gender,
          bloodGroup: "O+",
          department,
          primaryConcern: medicalConcern,
          urgency,
          allergies,
          chronicConditions,
          consentGiven,
          hipaaAgreed,
        });
      } else {
        result = await HealthcareApiService.submitGeneralInquiry({
          fullName,
          phone,
          email,
          dateOfBirth,
          gender,
          department,
          urgency,
          message: medicalConcern,
          consentGiven,
          hipaaAgreed,
        });
      }

      setSubmittedResult(result);
      showToast(`Submission logged successfully! Tracking Code: ${result.referenceId}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrors({ form: "Failed to transmit data to the secure server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedResult(null);
    setMedicalConcern("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-900 text-white p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {submittedResult ? "Submission Confirmed" : "Patient Medical Intake & Clinical Inquiry"}
                </h2>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/40 px-2 py-0.5 rounded-full font-mono">
                  AES-256 Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct integration with People's Hospital Central Clinical Triage Database
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          {submittedResult ? (
            /* Confirmation Pass Screen */
            <div className="space-y-6 text-center animate-fade-in py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Form Logged in Central Clinical Database</h3>
                <p className="text-xs text-slate-500">
                  Your medical inquiry has been encrypted and assigned to the triage queue.
                </p>
              </div>

              {/* Digital Tracking Ticket */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tracking Reference</div>
                    <div className="text-lg font-black font-mono text-teal-700">{submittedResult.referenceId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Urgency & SLA</div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        submittedResult.urgency === "emergency"
                          ? "bg-red-100 text-red-700"
                          : submittedResult.urgency === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {submittedResult.urgency} Urgency
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Patient Name:</span>
                    <div className="font-bold text-slate-900">{submittedResult.fullName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Department:</span>
                    <div className="font-bold text-slate-900">{submittedResult.department}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Phone:</span>
                    <div className="font-mono text-slate-900">{submittedResult.phone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Email:</span>
                    <div className="font-mono text-slate-900 truncate">{submittedResult.email}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Medical Concern Logged:</span>
                  <p className="text-slate-800 italic">"{submittedResult.medicalConcern}"</p>
                </div>

                {submittedResult.notificationSummary && (
                  <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{submittedResult.notificationSummary}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                  <span>Audit Hash: {submittedResult.encryptedPayloadHash}</span>
                  <span>IP: {submittedResult.ipAddress}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tracking Receipt</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Done & Return to Portal
                </button>
              </div>
            </div>
          ) : (
            /* Patient Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Submission Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSubmissionType("general_inquiry")}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                    submissionType === "general_inquiry" ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  General Medical Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType("patient_intake")}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                    submissionType === "patient_intake" ? "bg-white text-teal-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Patient Intake Registration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionType("emergency_triage");
                    setUrgency("emergency");
                  }}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                    submissionType === "emergency_triage" ? "bg-red-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Emergency Triage
                </button>
              </div>

              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Grid: Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Johnathan Doe"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                        errors.fullName ? "border-red-500 bg-red-50/50" : "border-slate-300"
                      } focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                        errors.phone ? "border-red-500 bg-red-50/50" : "border-slate-300"
                      } focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (For Secure Receipt) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@domain.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                        errors.email ? "border-red-500 bg-red-50/50" : "border-slate-300"
                      } focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth (DOB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={`w-full px-2.5 py-2 text-xs rounded-xl border ${
                        errors.dateOfBirth ? "border-red-500 bg-red-50/50" : "border-slate-300"
                      } focus:outline-none focus:border-blue-500`}
                    />
                    {errors.dateOfBirth && <p className="text-[11px] text-red-500 mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Department & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="General Medicine">General Internal Medicine</option>
                    <option value="Cardiology">Cardiology & Heart Station</option>
                    <option value="Endocrinology">Endocrinology & Diabetes</option>
                    <option value="Pediatrics">Pediatrics & Child Health</option>
                    <option value="Orthopedics">Orthopedics & Sports Medicine</option>
                    <option value="Pharmacy">Hospital Pharmacy & Formulary</option>
                    <option value="Emergency">Emergency & Acute Triage (24/7)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as AlertUrgency)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-bold ${
                      urgency === "emergency"
                        ? "border-red-500 bg-red-50 text-red-800"
                        : urgency === "high"
                        ? "border-amber-500 bg-amber-50 text-amber-800"
                        : "border-slate-300 text-slate-800"
                    } focus:outline-none`}
                  >
                    <option value="routine">Routine (Response in 24-48 hours)</option>
                    <option value="moderate">Moderate (Response in 6-12 hours)</option>
                    <option value="high">High Urgency (Response in 1-2 hours)</option>
                    <option value="emergency">Emergency (Immediate Dispatch & Alert)</option>
                  </select>
                </div>
              </div>

              {/* Medical Concern / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical Concern / Chief Complaint Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={medicalConcern}
                  onChange={(e) => setMedicalConcern(e.target.value)}
                  placeholder="Describe your symptoms, onset time, current medications, or specific questions for the care team..."
                  className={`w-full p-3 text-xs rounded-xl border ${
                    errors.medicalConcern ? "border-red-500 bg-red-50/50" : "border-slate-300"
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.medicalConcern && <p className="text-[11px] text-red-500 mt-1">{errors.medicalConcern}</p>}
              </div>

              {/* Consent & HIPAA Checkboxes */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    I consent to clinical evaluation and triage data processing by certified People's Hospital healthcare personnel.
                  </span>
                </label>
                {errors.consentGiven && <p className="text-[11px] text-red-500 pl-6">{errors.consentGiven}</p>}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hipaaAgreed}
                    onChange={(e) => setHipaaAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    I have read and agree to the <strong>HIPAA Notice of Privacy Practices</strong> and understand my Protected Health Information (PHI) is encrypted end-to-end under 45 CFR § 164.312.
                  </span>
                </label>
                {errors.hipaaAgreed && <p className="text-[11px] text-red-500 pl-6">{errors.hipaaAgreed}</p>}
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  <span>256-bit encrypted submission</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Encrypting & Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Secure Health Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
