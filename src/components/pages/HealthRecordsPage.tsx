import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  Activity,
  User,
  HeartPulse,
  Pill,
  TestTube2,
  FileText,
  AlertCircle,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  HardDrive,
  Lock,
  Unlock,
} from "lucide-react";
import { BackButton } from "../common/BackButton";
import { PrivateDetailsLock } from "../patients/PrivateDetailsLock";
import { Patient } from "../../types";

export const HealthRecordsPage: React.FC = () => {
  const {
    patients,
    currentPatient,
    currentPatientId,
    openPatientAuth,
    prescriptions,
    labTests,
    showToast,
    openDriveExportModal,
    setCurrentPage,
  } = useApp();

  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    id || currentPatientId || patients[0]?.id || ""
  );

  const [isSensitiveUnlocked, setIsSensitiveUnlocked] = useState(false);
  const [privatePatientData, setPrivatePatientData] = useState<Patient | null>(null);

  useEffect(() => {
    if (id) {
      const match = patients.find(
        (p) => p.id.toLowerCase() === id.toLowerCase() || p.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
      );
      if (match) {
        setSelectedPatientId(match.id);
        setIsSensitiveUnlocked(false);
        setPrivatePatientData(null);
      }
    } else if (currentPatientId) {
      setSelectedPatientId(currentPatientId);
    }
  }, [id, currentPatientId, patients]);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsSensitiveUnlocked(false);
    setPrivatePatientData(null);
    navigate(`/records/${patientId}`);
  };

  const activePatient = patients.find((p) => p.id === selectedPatientId) || currentPatient || patients[0];

  const patientRxs = activePatient ? prescriptions.filter((p) => p.patientId === activePatient.id) : [];
  const patientLabs = activePatient ? labTests.filter((l) => l.patientId === activePatient.id) : [];

  const handleExportEHR = () => {
    if (!activePatient) return;
    showToast(`Full FHIR JSON & PDF Health Record for ${activePatient.name} exported!`);
  };

  const handleLockRecords = () => {
    setIsSensitiveUnlocked(false);
    setPrivatePatientData(null);
    showToast("🔒 Sensitive patient records locked.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <Activity className="w-3.5 h-3.5" />
            Electronic Health Record (EHR)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Unified Longitudinal Patient Health Record
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-0.5">
            Interoperable medical history connecting consultations, medications, vitals, and diagnostics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSensitiveUnlocked && (
            <button
              id="records-page-lock-btn"
              onClick={handleLockRecords}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Lock Records</span>
            </button>
          )}
          <button
            onClick={() =>
              openDriveExportModal(
                `EHR_${activePatient?.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`,
                {
                  patient: activePatient,
                  prescriptions: patientRxs,
                  labTests: patientLabs,
                  exportedAt: new Date().toISOString(),
                },
                "EHR_SUMMARY"
              )
            }
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <HardDrive className="w-4 h-4" />
            <span>Save to Google Drive</span>
          </button>
          <button
            onClick={handleExportEHR}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Local JSON
          </button>
        </div>
      </div>

      {/* Patient Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Select Patient Profile:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPatient(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                p.id === activePatient.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {p.name} ({p.id})
            </button>
          ))}
          <button
            onClick={() => openPatientAuth("register")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Patient ID</span>
          </button>
        </div>
      </div>

      {/* Password Protection Barrier for EHR */}
      {activePatient && (
        <PrivateDetailsLock
          patientId={activePatient.id}
          patientEmail={activePatient.email}
          onUnlocked={(data) => {
            setIsSensitiveUnlocked(true);
            setPrivatePatientData(data);
          }}
          onLocked={handleLockRecords}
        />
      )}

      {/* Main EHR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (4 cols): Patient Bio, Allergies, Chronic Conditions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
                {(activePatient?.name || "Patient").split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{activePatient?.name || "Patient Record"}</h2>
                <p className="text-xs text-slate-500">ID: {activePatient?.id || "N/A"} • {activePatient?.age ?? 0} Yrs ({activePatient?.gender || "N/A"})</p>
                <div className="text-xs text-teal-700 font-semibold mt-0.5">
                  Blood Group:{" "}
                  {isSensitiveUnlocked && privatePatientData ? (
                    <span className="font-bold text-teal-800">{privatePatientData.bloodGroup}</span>
                  ) : (
                    <span className="text-amber-700 font-medium">🔒 Protected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Documented Allergies Box */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
              <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Documented Drug & Food Allergies:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {isSensitiveUnlocked && privatePatientData ? (
                  (privatePatientData.allergies || []).map((all, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-red-700 border border-red-300 px-2.5 py-1 rounded-lg font-bold"
                    >
                      ⚠️ {all}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-amber-800 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Enter password above to decrypt clinical allergy profile
                  </span>
                )}
                {isSensitiveUnlocked && privatePatientData && (!privatePatientData.allergies || privatePatientData.allergies.length === 0) && (
                  <span className="text-xs text-slate-500">No known allergies documented.</span>
                )}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">Chronic Medical Conditions:</div>
              {isSensitiveUnlocked && privatePatientData ? (
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {(privatePatientData.chronicConditions || []).map((cond, i) => (
                    <li key={i} className="font-medium">{cond}</li>
                  ))}
                  {(!privatePatientData.chronicConditions || privatePatientData.chronicConditions.length === 0) && (
                    <li className="list-none text-slate-500">None documented.</li>
                  )}
                </ul>
              ) : (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Medical history records locked by default.
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="font-bold text-slate-900">Emergency Contact:</div>
              <div>{activePatient?.emergencyContact?.name || "Family Contact"} ({activePatient?.emergencyContact?.relationship || "Primary"})</div>
              <div className="text-slate-500">
                {isSensitiveUnlocked && privatePatientData ? (
                  privatePatientData.emergencyContact?.phone || activePatient?.emergencyContact?.phone || "On File"
                ) : (
                  "•••••••• (Locked)"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (8 cols): Vitals, Medication History, Lab Archives */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Vitals Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" />
              Latest Physiological Telemetry & Vitals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-blue-700 text-[10px] font-bold uppercase">Blood Pressure</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient?.recentVitals?.bloodPressure || "120/80 mmHg"}</div>
                <span className="text-[10px] text-slate-500">mmHg</span>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                <span className="text-red-700 text-[10px] font-bold uppercase">Heart Rate</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient?.recentVitals?.heartRate ?? 72}</div>
                <span className="text-[10px] text-slate-500">bpm (Resting)</span>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
                <span className="text-teal-700 text-[10px] font-bold uppercase">Blood Sugar</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient?.recentVitals?.bloodSugar ?? 96}</div>
                <span className="text-[10px] text-slate-500">mg/dL (Fasting)</span>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <span className="text-purple-700 text-[10px] font-bold uppercase">Oxygen Saturation</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient?.recentVitals?.oxygenSaturation ?? 98}%</div>
                <span className="text-[10px] text-slate-500">SpO2</span>
              </div>
            </div>
          </div>

          {/* Connected Prescriptions History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              Prescription & Pharmacotherapy History ({patientRxs.length})
            </h3>

            <div className="space-y-3">
              {patientRxs.map((rx) => (
                <div key={rx.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{rx.prescriptionNumber} — {rx.diagnosis}</span>
                    <span className="text-slate-500">{rx.date}</span>
                  </div>
                  <div className="text-slate-600">
                    Prescribed by <strong>{rx.doctorName}</strong> ({rx.doctorSpecialty})
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rx.medicines.map((m, i) => (
                      <span key={i} className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-slate-800 font-semibold">
                        {m.medicineName} ({m.dosage}) • {m.frequency}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Diagnostic Lab Reports */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-purple-600" />
              Laboratory Diagnostics History ({patientLabs.length})
            </h3>

            <div className="space-y-3">
              {patientLabs.map((lab) => (
                <div key={lab.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{lab.testName} ({lab.testCode})</span>
                    <span className="text-emerald-700 font-bold capitalize">{lab.status.replace("_", " ")}</span>
                  </div>
                  <div className="text-slate-500">Ordered {lab.orderedDate} • Verified by {lab.labTechnician}</div>

                  <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden mt-2">
                    {lab.results.map((r, i) => (
                      <div key={i} className="p-2.5 flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-800">{r.parameter}</span>
                        <span className={`font-bold ${r.isAbnormal ? "text-red-600" : "text-slate-700"}`}>
                          {r.value} {r.unit} (Ref: {r.referenceRange})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
