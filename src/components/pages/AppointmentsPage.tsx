import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  CheckCircle2,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  BellRing,
  Send,
  Lock,
  Printer,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { AutomatedReminderEngine } from "../appointments/AutomatedReminderEngine";
import { HealthcareApiService } from "../../services/api";
import { AlertUrgency } from "../../services/notificationService";

export const AppointmentsPage: React.FC = () => {
  const {
    doctors,
    patients,
    currentPatient,
    currentPatientId,
    openPatientAuth,
    bookAppointment,
    sendAppointmentReminder,
    setActiveSmsPreview,
    showToast,
    setCurrentPage,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    currentPatientId || patients[0]?.id || ""
  );

  // Form Fields
  const [fullName, setFullName] = useState(currentPatient?.name || patients[0]?.name || "Eleanor Vance");
  const [phone, setPhone] = useState(currentPatient?.phone || patients[0]?.phone || "+1 (555) 234-8901");
  const [email, setEmail] = useState(currentPatient?.email || patients[0]?.email || "eleanor.vance@example.com");
  const [dateOfBirth, setDateOfBirth] = useState("1988-06-14");
  const [gender, setGender] = useState(currentPatient?.gender || "Female");
  const [urgency, setUrgency] = useState<AlertUrgency>("routine");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("10:30 AM");
  const [consultType, setConsultType] = useState<"in_person" | "teleconsultation">("in_person");
  const [symptoms, setSymptoms] = useState<string>("");
  const [enableSmsReminder, setEnableSmsReminder] = useState<boolean>(true);
  const [consentGiven, setConsentGiven] = useState(true);
  const [hipaaAgreed, setHipaaAgreed] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<any | null>(null);

  // Sync when currentPatient changes
  useEffect(() => {
    if (currentPatient) {
      setSelectedPatientId(currentPatient.id);
      setFullName(currentPatient.name);
      setPhone(currentPatient.phone);
      setEmail(currentPatient.email);
      setGender(currentPatient.gender);
    }
  }, [currentPatient]);

  const departments = ["All", "Cardiology", "Endocrinology", "Pediatrics", "Internal Medicine", "Orthopedics"];

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDept === "All") return true;
    return doc.department === selectedDept;
  });

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:15 AM",
    "02:00 PM",
    "02:45 PM",
    "03:30 PM",
    "04:15 PM",
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate form fields
    const validation = HealthcareApiService.validateSubmissionForm({
      fullName,
      phone,
      email,
      dateOfBirth,
      medicalConcern: symptoms || "Routine Clinical Consultation & Examination",
      department: selectedDoctor.department,
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
      // 2. Submit to central database & trigger transactional notification hooks
      const dbSubmission = await HealthcareApiService.submitAppointment({
        fullName,
        phone,
        email,
        dateOfBirth,
        gender,
        department: selectedDoctor.department,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        preferredDate: date,
        preferredTime: time,
        consultType,
        symptoms: symptoms || "Routine Clinical Consultation",
        urgency,
        consentGiven,
        hipaaAgreed,
      });

      // 3. Register in local OPD scheduler state
      const token = Math.floor(100 + Math.random() * 900);
      const booked = bookAppointment({
        patientId: currentPatientId || selectedPatientId || "P-NEW",
        patientName: fullName,
        patientPhone: phone,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        department: selectedDoctor.department,
        date,
        time,
        type: consultType,
        symptoms: symptoms || "Routine Clinical Consultation",
        roomNumber: `Room ${Math.floor(200 + Math.random() * 80)}`,
        reminderSent: false,
      });

      setConfirmedPass({
        ...booked,
        referenceId: dbSubmission.referenceId,
        encryptedPayloadHash: dbSubmission.encryptedPayloadHash,
        urgency: dbSubmission.urgency,
        notificationSummary: dbSubmission.notificationSummary,
      });

      showToast(`Appointment booked! Ref #${dbSubmission.referenceId} | Token #${booked.tokenNumber}`);
    } catch (err) {
      console.error("Booking error:", err);
      setErrors({ form: "Failed to transmit appointment to backend database. Please retry." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Smart Hospital OPD Scheduling & Automated Reminders
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Book Doctor Consultation & Token Pass
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
            Encrypted form-to-database registration with automated 1-day SMS & in-app patient reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/10 px-4 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Database Sync (AES-256)</span>
        </div>
      </div>

      {/* Automated 1-Day Appointment Reminder Engine Control Center */}
      <AutomatedReminderEngine />

      {confirmedPass ? (
        /* Confirmation Pass Card */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-emerald-300 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Appointment Registered in Central DB!</h2>
            <p className="text-xs text-slate-500">Your digital token has been logged in the Hospital OPD Queue.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Queue Token #</div>
                <div className="text-3xl font-black text-blue-600">#{confirmedPass.tokenNumber}</div>
                <div className="text-xs font-mono font-bold text-teal-700 mt-0.5">Ref: {confirmedPass.referenceId}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase">
                  {confirmedPass.type.replace("_", " ")}
                </span>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                  Urgency: {confirmedPass.urgency || "ROUTINE"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Doctor:</span>
                <div className="font-bold text-slate-900">{confirmedPass.doctorName}</div>
                <div className="text-slate-500">{confirmedPass.department}</div>
              </div>
              <div>
                <span className="text-slate-400">Patient:</span>
                <div className="font-bold text-slate-900">{confirmedPass.patientName}</div>
                <div className="text-slate-500 font-mono">{confirmedPass.patientPhone}</div>
              </div>
              <div>
                <span className="text-slate-400">Date & Time:</span>
                <div className="font-bold text-slate-900">
                  {confirmedPass.date} at {confirmedPass.time}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Location:</span>
                <div className="font-bold text-slate-900">{confirmedPass.roomNumber} (Main OPD)</div>
              </div>
            </div>

            {/* Notification Summary */}
            {confirmedPass.notificationSummary && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{confirmedPass.notificationSummary}</span>
              </div>
            )}

            {/* Automated 1-Day Reminder Status in Pass */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-teal-900">
                <BellRing className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="font-bold">Automated 1-Day Reminder Active:</span>
                  <div className="text-[11px] text-teal-700">
                    SMS and in-app alert scheduled for 24 hours prior to appointment.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const log = sendAppointmentReminder(confirmedPass.id, {
                    triggerType: "instant_preview",
                  });
                  if (log) {
                    setActiveSmsPreview(log);
                  }
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Test SMS Preview</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 font-mono pt-1">
              Audit Hash: {confirmedPass.encryptedPayloadHash || "sha256_e749a9018bf2c110e9f4"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Token Pass</span>
            </button>
            <button
              onClick={() => setConfirmedPass(null)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => setCurrentPage("patient-portal")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Go to Patient Portal
            </button>
          </div>
        </div>
      ) : (
        /* Booking Workflow Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Department & Doctor Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Department Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Department
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedDept === dept
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Choose Physician ({filteredDoctors.length} Available)
              </label>
              <div className="space-y-3">
                {filteredDoctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {doc.specialty}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {doc.qualification} • {doc.experienceYears} Years Exp
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Consultation Fee: ${doc.consultationFee}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-blue-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Date, Time & Confirmation Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleBooking} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Patient & Consultation Details
                </h3>
                <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                  HIPAA Secure
                </span>
              </div>

              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Legal Name"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border ${
                      errors.fullName ? "border-red-500 bg-red-50/50" : "border-slate-300"
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone (SMS Alerts) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full pl-9 pr-2.5 py-2 rounded-xl border ${
                        errors.phone ? "border-red-500 bg-red-50/50" : "border-slate-300"
                      } focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className={`w-full pl-9 pr-2.5 py-2 rounded-xl border ${
                        errors.email ? "border-red-500 bg-red-50/50" : "border-slate-300"
                      } focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl border ${
                      errors.dateOfBirth ? "border-red-500 bg-red-50/50" : "border-slate-300"
                    } focus:outline-none focus:border-blue-500`}
                  />
                  {errors.dateOfBirth && <p className="text-[11px] text-red-500 mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as AlertUrgency)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none"
                  >
                    <option value="routine">Routine</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High Urgency</option>
                  </select>
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType("in_person")}
                    className={`py-2 font-semibold rounded-xl border transition cursor-pointer ${
                      consultType === "in_person"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Hospital In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultType("teleconsultation")}
                    className={`py-2 font-semibold rounded-xl border transition cursor-pointer ${
                      consultType === "teleconsultation"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Teleconsultation
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chief Symptoms / Reason for Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild chest tightness on exertion, routine blood pressure review..."
                  className={`w-full p-2.5 rounded-xl border ${
                    errors.medicalConcern ? "border-red-500 bg-red-50/50" : "border-slate-300"
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.medicalConcern && <p className="text-[11px] text-red-500 mt-1">{errors.medicalConcern}</p>}
              </div>

              {/* Consent & HIPAA agreement */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px] text-slate-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600"
                  />
                  <span>I authorize People's Hospital to process this OPD appointment registration.</span>
                </label>
                {errors.consentGiven && <p className="text-red-500 pl-5">{errors.consentGiven}</p>}

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hipaaAgreed}
                    onChange={(e) => setHipaaAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600"
                  />
                  <span>
                    I agree to the <strong>HIPAA Privacy Policy</strong> (AES-256 transmission).
                  </span>
                </label>
                {errors.hipaaAgreed && <p className="text-red-500 pl-5">{errors.hipaaAgreed}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Encrypting & Transmitting to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Generate OPD Token Pass</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
