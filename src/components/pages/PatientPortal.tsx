import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  User,
  Calendar,
  Pill,
  Clock,
  FileText,
  Activity,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Download,
  Plus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Smartphone,
  BellRing,
  Send,
  CheckCheck,
  HardDrive,
  QrCode,
  X,
  LogOut,
  Flame,
  Edit3,
  Save,
  Lock,
  Unlock,
  Shield,
} from "lucide-react";
import { AppointmentQrCodePass } from "../appointments/AppointmentQrCodePass";
import { Appointment, Patient } from "../../types";
import { BackButton } from "../common/BackButton";
import { PrivateDetailsLock } from "../patients/PrivateDetailsLock";

export const PatientPortal: React.FC = () => {
  const [viewQrApt, setViewQrApt] = useState<Appointment | null>(null);
  const {
    patients,
    currentPatient,
    currentPatientId,
    setCurrentPatientId,
    openPatientAuth,
    logoutPatient,
    syncPatientProfileToFirestore,
    firebaseUser,
    appointments,
    prescriptions,
    labTests,
    reminders,
    toggleReminder,
    setCurrentPage,
    setAiModalOpen,
    setAiModalInitialType,
    triggerEmergencyAlert,
    sendAppointmentReminder,
    setActiveSmsPreview,
    reminderLogs,
    showToast,
  } = useApp();

  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Sensitive details password lock states: null by default until verified
  const [isSensitiveUnlocked, setIsSensitiveUnlocked] = useState<boolean>(false);
  const [privatePatientData, setPrivatePatientData] = useState<Patient | null>(null);

  useEffect(() => {
    if (id) {
      const match = patients.find(
        (p) => p.id.toLowerCase() === id.toLowerCase() || p.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
      );
      if (match && match.id !== currentPatientId) {
        setCurrentPatientId(match.id);
      }
    }
  }, [id, patients, currentPatientId, setCurrentPatientId]);

  const activePatient = currentPatient || (id ? patients.find(p => p.id === id) : null) || patients[0];

  // Edit Profile Modal State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editBp, setEditBp] = useState(activePatient?.recentVitals?.bloodPressure || "120/80 mmHg");
  const [editHr, setEditHr] = useState(activePatient?.recentVitals?.heartRate || 72);
  const [editBs, setEditBs] = useState(activePatient?.recentVitals?.bloodSugar || 96);
  const [editWeight, setEditWeight] = useState(activePatient?.recentVitals?.weight || 65);
  const [editPhone, setEditPhone] = useState(activePatient?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEditProfile = () => {
    if (activePatient) {
      setEditBp(activePatient.recentVitals?.bloodPressure || "120/80 mmHg");
      setEditHr(activePatient.recentVitals?.heartRate || 72);
      setEditBs(activePatient.recentVitals?.bloodSugar || 96);
      setEditWeight(activePatient.recentVitals?.weight || 65);
      setEditPhone(activePatient.phone || "");
      setEditProfileOpen(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setIsSaving(true);
    try {
      await syncPatientProfileToFirestore({
        phone: editPhone,
        recentVitals: {
          ...(activePatient.recentVitals || {
            bloodPressure: "120/80 mmHg",
            heartRate: 72,
            bloodSugar: 96,
            temperature: 98.6,
            weight: 65,
            lastUpdated: new Date().toLocaleDateString(),
          }),
          bloodPressure: editBp,
          heartRate: Number(editHr),
          bloodSugar: Number(editBs),
          weight: Number(editWeight),
          lastUpdated: new Date().toLocaleDateString(),
        },
      });
      setEditProfileOpen(false);
      showToast("Health vitals & profile synced to Cloud Firestore!");
    } catch (err: any) {
      showToast("Failed to sync changes: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLockRecords = () => {
    setIsSensitiveUnlocked(false);
    setPrivatePatientData(null);
    showToast("🔒 Sensitive patient records locked.");
  };

  const patientAppointments = activePatient
    ? appointments.filter((a) => a.patientId === activePatient.id)
    : [];

  const patientReminderLogs = activePatient
    ? reminderLogs.filter((l) => l.patientId === activePatient.id || l.patientPhone === activePatient.phone)
    : [];
  const patientPrescriptions = activePatient
    ? prescriptions.filter((p) => p.patientId === activePatient.id)
    : [];
  const patientLabTests = activePatient
    ? labTests.filter((l) => l.patientId === activePatient.id)
    : [];

  const [selectedLabTest, setSelectedLabTest] = useState<any | null>(null);

  const handleRequestRefill = (medName: string) => {
    showToast(`Refill request for ${medName} submitted to Smart Pharmacy!`);
  };

  if (!activePatient) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <BackButton label="Back to Home" fallbackPage="home" showHomeButton={true} />
        </div>
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <User className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">No Patient Profile Loaded</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Please register as a new patient to generate your unique Patient ID or sign in to access your electronic health record.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => openPatientAuth("register")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition"
            >
              Register New Patient (Generate ID)
            </button>
            <button
              onClick={() => openPatientAuth("signin")}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-2xl transition"
            >
              Sign In Existing Record
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold border border-white/30 shadow-inner">
              {activePatient.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{activePatient.name}</h1>
                <span className="text-xs bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                  ID: {activePatient.id}
                </span>
                {isSensitiveUnlocked ? (
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Records Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> Password Protected
                  </span>
                )}
                <button
                  onClick={() => openPatientAuth("signin")}
                  className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-md border border-white/20 transition flex items-center gap-1"
                  title="Switch patient or register new ID"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Switch / New ID</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                {activePatient.age} yrs • {activePatient.gender} • Blood Group:{" "}
                {isSensitiveUnlocked && privatePatientData ? (
                  <span className="font-bold text-teal-200">{privatePatientData.bloodGroup}</span>
                ) : (
                  <span className="font-mono text-amber-200 text-xs bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    🔒 Locked (Password Required)
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {isSensitiveUnlocked && privatePatientData ? (
                  <>
                    {(privatePatientData.allergies || []).map((all, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-red-500/20 text-red-200 border border-red-400/30 px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3 text-red-300" /> Allergy: {all}
                      </span>
                    ))}
                    {(privatePatientData.chronicConditions || []).map((cond, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-md font-medium"
                      >
                        {cond}
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="text-[11px] bg-slate-900/60 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Medical history & allergies hidden by default until password verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isSensitiveUnlocked && (
              <button
                id="portal-top-lock-records-btn"
                onClick={handleLockRecords}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                title="Re-hide sensitive patient details"
              >
                <Lock className="w-4 h-4" />
                <span>Lock Records</span>
              </button>
            )}
            <button
              onClick={handleOpenEditProfile}
              className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-teal-200 hover:text-white text-xs font-bold rounded-xl border border-teal-400/30 transition flex items-center gap-1.5 cursor-pointer"
              title="Update Blood Pressure, Sugar, Vitals & Phone in Firestore"
            >
              <Edit3 className="w-4 h-4 text-teal-300" />
              <span>Update Vitals</span>
            </button>
            <button
              onClick={() => setCurrentPage("google-drive-vault")}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              Google Drive Vault
            </button>
            <button
              onClick={() => setCurrentPage("appointments")}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              Book Appointment
            </button>
            <button
              onClick={() => {
                setAiModalInitialType("medicine_info");
                setAiModalOpen(true);
              }}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Medicine Assistant
            </button>
            <button
              id="patient-portal-emergency-sos-btn"
              onClick={triggerEmergencyAlert}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              Emergency SOS
            </button>
            <button
              id="patient-portal-signout-btn"
              onClick={logoutPatient}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-red-300 hover:text-white text-xs font-bold rounded-xl border border-red-500/30 transition flex items-center gap-2 cursor-pointer"
              title="Sign Out of Patient Profile"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Vitals Bar */}
        <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Blood Pressure</span>
            <div className="text-base font-bold text-white mt-0.5">{activePatient?.recentVitals?.bloodPressure || "120/80 mmHg"}</div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Heart Rate</span>
            <div className="text-base font-bold text-white mt-0.5">{activePatient?.recentVitals?.heartRate ?? 72} bpm</div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Fasting Blood Sugar</span>
            <div className="text-base font-bold text-white mt-0.5">{activePatient?.recentVitals?.bloodSugar ?? 96} mg/dL</div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Body Weight</span>
            <div className="text-base font-bold text-white mt-0.5">{activePatient?.recentVitals?.weight ?? 65} kg</div>
          </div>
        </div>
      </div>

      {/* Password Protection Barrier Component */}
      <PrivateDetailsLock
        patientId={activePatient.id}
        patientEmail={activePatient.email}
        onUnlocked={(data) => {
          setIsSensitiveUnlocked(true);
          setPrivatePatientData(data);
        }}
        onLocked={handleLockRecords}
      />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Appointments, Medications, Prescriptions */}
        <div className="lg:col-span-8 space-y-8">
          {/* UPCOMING APPOINTMENTS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                  <p className="text-xs text-slate-500">Scheduled consultations & follow-ups</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage("appointments")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Book New <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {patientAppointments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No scheduled appointments.</div>
            ) : (
              <div className="space-y-3">
                {patientAppointments.map((apt) => {
                  const sentLog = patientReminderLogs.find((l) => l.appointmentId === apt.id);
                  const isSent = apt.reminderSent || !!sentLog;

                  return (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{apt.doctorName}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                            {apt.department}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full capitalize">
                            {apt.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.time}
                          </span>
                          <span className="text-blue-700 font-medium">Token: #{apt.tokenNumber}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 italic">
                          Reason: {apt.symptoms} • {apt.roomNumber}
                        </div>

                        {/* Automated Reminder Status Badge */}
                        <div className="pt-1 flex items-center gap-2">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md border border-teal-200">
                              <CheckCheck className="w-3 h-3 text-teal-600" /> 1-Day Reminder Sent (SMS + In-App)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-md border border-amber-200">
                              <BellRing className="w-3 h-3 text-amber-600" /> Automated 1-Day Reminder Scheduled
                            </span>
                          )}

                          {sentLog?.patientConfirmed && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              Confirmed by You
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isSent && sentLog ? (
                          <button
                            onClick={() => setActiveSmsPreview(sentLog)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-teal-300" />
                            <span>View SMS</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const log = sendAppointmentReminder(apt.id, {
                                triggerType: "instant_preview",
                              });
                              if (log) setActiveSmsPreview(log);
                            }}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Test SMS</span>
                          </button>
                        )}

                        <button
                          onClick={() => setViewQrApt(apt)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Pass</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AUTOMATED SMS REMINDERS & NOTIFICATION HISTORY */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Automated SMS Reminders & Alerts
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-mono">
                      {activePatient.phone}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Encrypted SMS reminders delivered to your mobile phone 24h before visits.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Active
              </span>
            </div>

            {patientReminderLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                No reminders sent yet. The system automatically sends text messages 1 day prior to each appointment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {patientReminderLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-300">PEOPLES-HOSP SMS</span>
                        <span className="text-[10px] text-slate-400">• {log.sentAt}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed max-w-xl">
                        "{log.smsMessage}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {log.patientConfirmed ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-800/40">
                          <CheckCheck className="w-3 h-3" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Delivered</span>
                      )}

                      <button
                        onClick={() => setActiveSmsPreview(log)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1"
                      >
                        <Smartphone className="w-3 h-3 text-teal-300" />
                        <span>Open Mobile View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE MEDICATIONS & SCHEDULE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Current Medications & Schedule</h3>
                  <p className="text-xs text-slate-500">Prescribed dosage and adherence log</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAiModalInitialType("interaction");
                  setAiModalOpen(true);
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Check Interaction
              </button>
            </div>

            <div className="space-y-3">
              {patientPrescriptions.flatMap((rx) =>
                rx.medicines.map((med) => (
                  <div
                    key={med.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{med.medicineName}</span>
                        <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded border border-teal-200">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-800">Frequency:</span> {med.frequency} • <span className="font-medium text-slate-800">Duration:</span> {med.duration}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Instructions: {med.instructions}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRequestRefill(med.medicineName)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                      >
                        Request Refill
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* e-PRESCRIPTION ARCHIVE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Digital e-Prescriptions</h3>
                  <p className="text-xs text-slate-500">Digitally signed & verified by Hospital Pharmacy</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage("digital-prescription")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {patientPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rx.prescriptionNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          rx.status === "dispensed"
                            ? "bg-green-100 text-green-800"
                            : rx.status === "verified_by_pharmacist"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rx.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Prescribed by <span className="font-semibold">{rx.doctorName}</span> ({rx.doctorSpecialty}) on {rx.date}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Diagnosis: {rx.diagnosis}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage("digital-prescription");
                      showToast(`Opened e-Prescription #${rx.prescriptionNumber}`);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    View Digital Rx
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Medicine Reminders, Lab Reports, Emergency Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* MEDICATION REMINDERS (Interactive Pill Checklist) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Today's Medicine Reminders
                </h4>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                {reminders.filter((r) => r.takenToday).length} / {reminders.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  onClick={() => toggleReminder(rem.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    rem.takenToday
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${rem.takenToday ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {rem.medicineName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {rem.dosage} • Time: <span className="font-semibold text-slate-700">{rem.scheduledTime}</span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                      rem.takenToday ? "bg-emerald-600 text-white" : "border-2 border-slate-300 hover:border-emerald-500"
                    }`}
                  >
                    {rem.takenToday && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT LAB REPORTS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recent Lab Reports
                </h4>
              </div>
              <button
                onClick={() => setCurrentPage("lab-mgmt")}
                className="text-xs font-semibold text-purple-600 hover:underline"
              >
                All Tests
              </button>
            </div>

            <div className="space-y-2.5">
              {patientLabTests.map((lab) => (
                <div
                  key={lab.id}
                  onClick={() => setSelectedLabTest(lab)}
                  className="p-3 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer transition space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{lab.testName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        lab.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {lab.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>{lab.department} • {lab.orderedDate}</span>
                    <span className="text-purple-700 font-semibold">View Findings →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMERGENCY CONTACT & HOSPITAL CARD */}
          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
              <HeartPulse className="w-4 h-4" />
              Emergency Care Profile
            </div>
            <div className="text-xs text-red-950 space-y-1">
              <div>
                <span className="font-semibold">Primary Contact:</span> {currentPatient.emergencyContact.name} ({currentPatient.emergencyContact.relationship})
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {currentPatient.emergencyContact.phone}
              </div>
              <div className="pt-1 text-[11px] text-red-800">
                Hospital Rapid Emergency Dispatch: <strong>1-800-PHARMA-CARE (Ext 911)</strong>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage("emergency")}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Open Emergency Protocol Center
            </button>
          </div>
        </div>
      </div>

      {/* Lab Report Modal Popup */}
      {selectedLabTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedLabTest.testName}</h3>
                <p className="text-xs text-slate-500">Test Code: {selectedLabTest.testCode} • {selectedLabTest.department}</p>
              </div>
              <button
                onClick={() => setSelectedLabTest(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">Biomarker Results:</div>
              {selectedLabTest.results.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  Sample is currently {selectedLabTest.status.replace("_", " ")}. Findings will appear once verified by laboratory technician.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {selectedLabTest.results.map((res: any, idx: number) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-semibold text-slate-800">{res.parameter}</div>
                        <div className="text-[10px] text-slate-400">Ref: {res.referenceRange} {res.unit}</div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${res.isAbnormal ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" : "text-emerald-700"}`}>
                          {res.value} {res.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedLabTest.doctorNotes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
                  <span className="font-semibold text-slate-900">Doctor's Interpretation:</span> {selectedLabTest.doctorNotes}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">Verified by {selectedLabTest.labTechnician}</span>
              <button
                onClick={() => {
                  showToast("Lab report PDF downloaded successfully!");
                  setSelectedLabTest(null);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Report PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Pass Modal */}
      {viewQrApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-scale-up">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-sm">OPD Check-In QR Pass</span>
              </div>
              <button
                onClick={() => setViewQrApt(null)}
                className="p-1 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AppointmentQrCodePass appointment={viewQrApt} showSimulateScanButton={true} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Health Profile & Vitals Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-blue-700 to-teal-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-5 h-5 text-teal-200" />
                <div>
                  <h3 className="font-bold text-base">Update Digital Vitals & Contact</h3>
                  <p className="text-[11px] text-blue-100">Live synchronization with Cloud Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={editBp}
                    onChange={(e) => setEditBp(e.target.value)}
                    placeholder="120/80 mmHg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={editHr}
                    onChange={(e) => setEditHr(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fasting Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={editBs}
                    onChange={(e) => setEditBs(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving to Firestore..." : "Save & Sync"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
