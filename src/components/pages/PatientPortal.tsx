import React, { useState } from "react";
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
} from "lucide-react";

export const PatientPortal: React.FC = () => {
  const {
    patients,
    appointments,
    prescriptions,
    labTests,
    reminders,
    toggleReminder,
    setCurrentPage,
    setAiModalOpen,
    setAiModalInitialType,
    triggerEmergencyAlert,
    showToast,
  } = useApp();

  // Active patient in demo
  const currentPatient = patients[0]; // Eleanor Vance
  const patientAppointments = appointments.filter((a) => a.patientId === currentPatient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === currentPatient.id);
  const patientLabTests = labTests.filter((l) => l.patientId === currentPatient.id);

  const [selectedLabTest, setSelectedLabTest] = useState<any | null>(null);

  const handleRequestRefill = (medName: string) => {
    showToast(`Refill request for ${medName} submitted to Smart Pharmacy!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold border border-white/30 shadow-inner">
              {currentPatient.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{currentPatient.name}</h1>
                <span className="text-xs bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                  ID: {currentPatient.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                {currentPatient.age} yrs • {currentPatient.gender} • Blood Group: <span className="font-bold text-teal-200">{currentPatient.bloodGroup}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentPatient.allergies.map((all, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-red-500/20 text-red-200 border border-red-400/30 px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 text-red-300" /> Allergy: {all}
                  </span>
                ))}
                {currentPatient.chronicConditions.map((cond, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-md font-medium"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
              onClick={triggerEmergencyAlert}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <HeartPulse className="w-4 h-4" />
              Emergency SOS
            </button>
          </div>
        </div>

        {/* Vitals Bar */}
        <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Blood Pressure</span>
            <div className="text-base font-bold text-white mt-0.5">{currentPatient.recentVitals.bloodPressure}</div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Heart Rate</span>
            <div className="text-base font-bold text-white mt-0.5">{currentPatient.recentVitals.heartRate} bpm</div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Fasting Blood Sugar</span>
            <div className="text-base font-bold text-white mt-0.5">{currentPatient.recentVitals.bloodSugar} mg/dL</div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span className="text-blue-200 text-[11px]">Body Weight</span>
            <div className="text-base font-bold text-white mt-0.5">{currentPatient.recentVitals.weight} kg</div>
          </div>
        </div>
      </div>

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
                {patientAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
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
                        <span className="text-blue-700 font-medium">Token: {apt.tokenNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 italic">
                        Reason: {apt.symptoms} • {apt.roomNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Appointment confirmed for ${apt.date}. Token #${apt.tokenNumber}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Check-in Pass
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
    </div>
  );
};
