import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Plus,
  Send,
  Sparkles,
  AlertTriangle,
  Pill,
  MessageSquare,
  CheckCircle2,
  Activity,
  Search,
  Check,
  ChevronRight,
} from "lucide-react";
import { PrescribedMedicine } from "../../types";

export const DoctorPortal: React.FC = () => {
  const {
    doctors,
    patients,
    appointments,
    prescriptions,
    addPrescription,
    setCurrentPage,
    setAiModalOpen,
    setAiModalInitialType,
    sendChatMessage,
    showToast,
  } = useApp();

  const currentDoctor = doctors[0]; // Dr. Sarah Chen
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0].id);
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [medicinesList, setMedicinesList] = useState<PrescribedMedicine[]>([
    {
      id: "m-1",
      medicineName: "Telmisartan 40mg",
      dosage: "40mg",
      frequency: "1-0-0 (Morning with food)",
      duration: "30 days",
      instructions: "Take with breakfast with full glass of water.",
      timing: "after-food",
    },
  ]);

  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFreq, setNewMedFreq] = useState("1-0-1");
  const [newMedDuration, setNewMedDuration] = useState("7 days");
  const [newMedInstruction, setNewMedInstruction] = useState("");

  const handleAddMedicineToRx = () => {
    if (!newMedName) return;
    const item: PrescribedMedicine = {
      id: `m-${Date.now()}`,
      medicineName: newMedName,
      dosage: newMedDosage || "1 Tablet",
      frequency: newMedFreq,
      duration: newMedDuration,
      instructions: newMedInstruction || "As directed by physician.",
      timing: "after-food",
    };
    setMedicinesList((prev) => [...prev, item]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedInstruction("");
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicinesList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreateAndSendRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicinesList.length === 0) {
      showToast("Please add at least one medication to the prescription.");
      return;
    }

    addPrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      doctorSpecialty: currentDoctor.specialty,
      diagnosis: diagnosis || "Essential Hypertension & Routine Clinical Follow-up",
      medicines: medicinesList,
      clinicalNotes: clinicalNotes || "Patient tolerated current regimen well. Instructed to monitor morning BP and adhere strictly to low-sodium diet.",
    });

    setDiagnosis("");
    setClinicalNotes("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentDoctor.avatar}
            alt={currentDoctor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{currentDoctor.name}</h1>
              <span className="text-xs bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold capitalize">
                ● {currentDoctor.status.replace("-", " ")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-0.5">
              {currentDoctor.specialty} • {currentDoctor.qualification}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              OPD Station: Room 204 • Experience: {currentDoctor.experienceYears} Years
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setAiModalInitialType("prescription_audit");
              setAiModalOpen(true);
            }}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Prescription Safety Audit
          </button>

          <button
            onClick={() => setCurrentPage("doctor-pharmacist-connect")}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            Consult Pharmacist
          </button>
        </div>
      </div>

      {/* Main Doctor Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (4 cols): OPD Patient Queue & Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Today's Patient Queue ({patients.length})
                </h3>
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded">
                OPD Live
              </span>
            </div>

            <div className="space-y-2">
              {patients.map((pat, idx) => {
                const isSelected = pat.id === selectedPatientId;
                return (
                  <div
                    key={pat.id}
                    onClick={() => setSelectedPatientId(pat.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-50/80 border-teal-300 ring-1 ring-teal-400"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{pat.name}</span>
                        <span className="text-[10px] text-slate-500">({pat.age}y, {pat.gender})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Blood: <span className="font-semibold text-slate-700">{pat.bloodGroup}</span> • BP: {pat.recentVitals.bloodPressure}
                      </div>
                      {pat.allergies.length > 0 && (
                        <div className="text-[10px] text-red-600 font-medium">
                          ⚠️ Allergy: {pat.allergies.join(", ")}
                        </div>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-teal-600" : "text-slate-400"}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Patient Medical Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Patient Medical History: {selectedPatient.name}
            </h4>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-900">Chronic Conditions:</span>
                <ul className="list-disc list-inside text-slate-600 mt-1 text-[11px]">
                  {selectedPatient.chronicConditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 bg-red-50/70 border border-red-100 rounded-xl">
                <span className="font-semibold text-red-900">Documented Allergies:</span>
                <div className="text-red-700 font-medium mt-0.5 text-[11px]">
                  {selectedPatient.allergies.join(", ") || "None documented"}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px]">
                <div>
                  <span className="font-semibold">Vitals:</span> Pulse {selectedPatient.recentVitals.heartRate} bpm, Blood Sugar {selectedPatient.recentVitals.bloodSugar} mg/dL, Temp {selectedPatient.recentVitals.temperature}°F
                </div>
                <div className="text-slate-400">Last updated {selectedPatient.recentVitals.lastUpdated}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (8 cols): Digital Prescription Generator */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Create Digital e-Prescription (Rx)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Target Patient: <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.id})
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAiModalInitialType("interaction");
                    setAiModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Interaction Screen
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAndSendRx} className="space-y-6">
              {/* Diagnosis Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Clinical Diagnosis / Primary Indication
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Stage 1 Essential Hypertension with nocturnal cough"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Medicine Table / List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Prescribed Medication Regimen ({medicinesList.length})
                  </label>
                </div>

                <div className="space-y-2">
                  {medicinesList.map((med, idx) => (
                    <div
                      key={med.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{idx + 1}. {med.medicineName}</span>
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.2 rounded font-medium">
                            {med.dosage}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          {med.frequency} • {med.duration} • {med.instructions}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Mini-Form */}
                <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-teal-900">Add Drug to Prescription:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Amoxicillin 625mg)"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg/125mg)"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none"
                    />
                    <select
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none"
                    >
                      <option value="1-0-0 (Once daily morning)">Once Daily (Morning)</option>
                      <option value="0-0-1 (Once daily bedtime)">Once Daily (Bedtime)</option>
                      <option value="1-0-1 (Twice daily)">Twice Daily (Morning & Night)</option>
                      <option value="1-1-1 (Thrice daily)">Thrice Daily</option>
                      <option value="PRN (As needed for acute symptoms)">PRN (As Needed)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Duration & Instructions (e.g. 14 days, with full meal)"
                      value={newMedInstruction}
                      onChange={(e) => setNewMedInstruction(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedicineToRx}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition"
                    >
                      + Add Drug
                    </button>
                  </div>
                </div>
              </div>

              {/* Treatment Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Doctor's Clinical Notes & Follow-up Instructions
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="e.g. Instructed patient on home blood pressure recording. Schedule repeat lipid profile in 8 weeks."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Submit & Send to Pharmacy Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transmits digitally to Pharmacist Verification Queue in real time.</span>
                </div>

                <button
                  type="submit"
                  id="send-to-pharmacy-btn"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  Digitally Sign & Send to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
