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
  HardDrive,
  Copy,
} from "lucide-react";
import {
  PatientDatabaseService,
  PatientFormValidator,
  ValidationErrors,
} from "../../services/patientService";
import { AlertUrgency } from "../../services/notificationService";

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
  const [preferredDoctor, setPreferredDoctor] = useState("Dr. Sarah Jenkins");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [urgency, setUrgency] = useState<AlertUrgency>("routine");
  const [medicalConcern, setMedicalConcern] = useState("");
  const [allergies, setAllergies] = useState<string[]>(currentPatient?.allergies || []);
  const [chronicConditions, setChronicConditions] = useState<string[]>(currentPatient?.chronicConditions || []);
  const [consentGiven, setConsentGiven] = useState(true);
  const [hipaaAgreed, setHipaaAgreed] = useState(true);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  // Sync with current patient if opened
  React.useEffect(() => {
    if (currentPatient) {
      setFullName(currentPatient.name);
      setPhone(currentPatient.phone);
      setEmail(currentPatient.email);
      setGender(currentPatient.gender);
      setAllergies(currentPatient.allergies || []);
      setChronicConditions(currentPatient.chronicConditions || []);
    }
  }, [currentPatient, isOpen]);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setFullName(currentPatient?.name || "");
    setPhone(currentPatient?.phone || "");
    setEmail(currentPatient?.email || "");
    setDateOfBirth("1992-05-18");
    setMedicalConcern("");
    setErrors({});
    setSubmissionError(null);
    setSubmittedResult(null);
  };

  const handleResetAndClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // 1. Run Validation using centralized PatientFormValidator
    if (submissionType === "patient_intake") {
      const validation = PatientFormValidator.validatePatientIntake({
        fullName,
        phone,
        email,
        dateOfBirth,
        gender,
        department,
        symptoms: medicalConcern,
        urgency: urgency === "emergency" ? "emergency" : urgency === "high" ? "urgent" : "routine",
        allergies,
        chronicConditions,
        consentGiven,
        hipaaAgreed,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        showToast("Please review the highlighted required fields.");
        return;
      }
    } else {
      const validation = PatientFormValidator.validateContactUs({
        fullName,
        phone,
        email,
        dateOfBirth,
        department,
        subject: submissionType === "emergency_triage" ? "Emergency Triage Request" : "General Clinical Inquiry",
        symptomsOrMessage: medicalConcern,
        urgency: urgency === "emergency" ? "emergency" : urgency === "high" ? "urgent" : "routine",
        consentGiven,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        showToast("Please review the highlighted required fields.");
        return;
      }
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let result;

      if (submissionType === "patient_intake") {
        result = await PatientDatabaseService.submitPatientIntake({
          fullName,
          phone,
          email,
          dateOfBirth,
          gender,
          bloodGroup: "O+",
          department,
          symptoms: medicalConcern,
          urgency: urgency === "emergency" ? "emergency" : urgency === "high" ? "urgent" : "routine",
          allergies,
          chronicConditions,
          consentGiven,
          hipaaAgreed,
        });
      } else {
        result = await PatientDatabaseService.submitContactUs({
          fullName,
          phone,
          email,
          dateOfBirth,
          department,
          subject: submissionType === "emergency_triage" ? "Emergency Triage Request" : "General Clinical Inquiry",
          symptomsOrMessage: medicalConcern,
          urgency: urgency === "emergency" ? "emergency" : urgency === "high" ? "urgent" : "routine",
          consentGiven,
        });
      }

      setSubmittedResult(result);
      showToast(`Submission logged! Reference ID: ${result.trackingId}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmissionError(
        err.message || "Unable to transmit record to central database. For emergency assistance, please call 911."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tracking Reference ID</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black font-mono text-teal-700">{submittedResult.trackingId || submittedResult.referenceId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(submittedResult.trackingId || submittedResult.referenceId);
                          showToast("Tracking ID copied to clipboard!");
                        }}
                        className="p-1 text-slate-400 hover:text-teal-600 rounded transition cursor-pointer"
                        title="Copy Tracking ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage Sync</div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{submittedResult.data?.storageSource === "database_api" ? "Server Database" : "Encrypted Local DB"}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Patient Name:</span>
                    <div className="font-bold text-slate-900">{submittedResult.data?.fullName || fullName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Department:</span>
                    <div className="font-bold text-slate-900">{submittedResult.data?.department || department}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Phone:</span>
                    <div className="font-mono text-slate-900">{submittedResult.data?.phone || phone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Email:</span>
                    <div className="font-mono text-slate-900 truncate">{submittedResult.data?.email || email}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Medical Concern Logged:</span>
                  <p className="text-slate-800 italic">"{submittedResult.data?.symptoms || submittedResult.data?.primaryConcern || submittedResult.data?.message || medicalConcern}"</p>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                  <span>Timestamp: {submittedResult.data?.createdAt || new Date().toISOString()}</span>
                  <span>AES-256 Validated</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Submit Another Record
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Done & Close
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
                  General Inquiry / Contact
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType("patient_intake")}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                    submissionType === "patient_intake" ? "bg-white text-teal-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Patient Intake
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

              {/* Submission Error Banner */}
              {submissionError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Submission Failed</span>
                  </div>
                  <p>{submissionError}</p>
                  <div className="p-2.5 bg-red-100/70 border border-red-200 rounded-xl text-[11px] text-red-900 font-semibold flex items-center justify-between">
                    <span>🚨 Medical Emergency Hotline:</span>
                    <a href="tel:911" className="underline font-bold text-red-700 hover:text-red-900">
                      Call 911 / (555) 911-0000
                    </a>
                  </div>
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
