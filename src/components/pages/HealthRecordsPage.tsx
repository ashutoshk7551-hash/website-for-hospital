import React, { useState } from "react";
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
} from "lucide-react";

export const HealthRecordsPage: React.FC = () => {
  const {
    patients,
    currentPatient,
    currentPatientId,
    openPatientAuth,
    prescriptions,
    labTests,
    showToast,
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    currentPatientId || patients[0]?.id || ""
  );

  React.useEffect(() => {
    if (currentPatientId) {
      setSelectedPatientId(currentPatientId);
    }
  }, [currentPatientId]);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || currentPatient || patients[0];

  const patientRxs = activePatient ? prescriptions.filter((p) => p.patientId === activePatient.id) : [];
  const patientLabs = activePatient ? labTests.filter((l) => l.patientId === activePatient.id) : [];

  const handleExportEHR = () => {
    if (!activePatient) return;
    showToast(`Full FHIR JSON & PDF Health Record for ${activePatient.name} exported!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
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
          <button
            onClick={handleExportEHR}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Complete EHR
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
              onClick={() => setSelectedPatientId(p.id)}
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

      {/* Main EHR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (4 cols): Patient Bio, Allergies, Chronic Conditions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
                {activePatient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{activePatient.name}</h2>
                <p className="text-xs text-slate-500">ID: {activePatient.id} • {activePatient.age} Yrs ({activePatient.gender})</p>
                <div className="text-xs text-teal-700 font-semibold mt-0.5">Blood Group: {activePatient.bloodGroup}</div>
              </div>
            </div>

            {/* Documented Allergies Box */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
              <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Documented Drug & Food Allergies:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activePatient.allergies.map((all, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-red-700 border border-red-300 px-2.5 py-1 rounded-lg font-bold"
                  >
                    ⚠️ {all}
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">Chronic Medical Conditions:</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {activePatient.chronicConditions.map((cond, i) => (
                  <li key={i} className="font-medium">{cond}</li>
                ))}
              </ul>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="font-bold text-slate-900">Emergency Contact:</div>
              <div>{activePatient.emergencyContact.name} ({activePatient.emergencyContact.relationship})</div>
              <div className="text-slate-500">{activePatient.emergencyContact.phone}</div>
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
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient.recentVitals.bloodPressure}</div>
                <span className="text-[10px] text-slate-500">mmHg</span>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                <span className="text-red-700 text-[10px] font-bold uppercase">Heart Rate</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient.recentVitals.heartRate}</div>
                <span className="text-[10px] text-slate-500">bpm (Resting)</span>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
                <span className="text-teal-700 text-[10px] font-bold uppercase">Blood Sugar</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient.recentVitals.bloodSugar}</div>
                <span className="text-[10px] text-slate-500">mg/dL (Fasting)</span>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <span className="text-purple-700 text-[10px] font-bold uppercase">Oxygen Saturation</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{activePatient.recentVitals.oxygenSaturation}%</div>
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
