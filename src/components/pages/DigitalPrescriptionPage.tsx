import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  FileText,
  Activity,
  Pill,
  Printer,
  Download,
  Send,
  Sparkles,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const DigitalPrescriptionPage: React.FC = () => {
  const {
    prescriptions,
    updatePrescriptionStatus,
    setAiModalOpen,
    setAiModalInitialType,
    showToast,
    setCurrentPage,
  } = useApp();

  const [selectedRxId, setSelectedRxId] = useState<string>(prescriptions[0]?.id || "");
  const currentRx = prescriptions.find((r) => r.id === selectedRxId) || prescriptions[0];

  const handlePrint = () => {
    window.print();
  };

  const handleSendToPharmacy = () => {
    updatePrescriptionStatus(currentRx.id, "pending_pharmacy", "Routed to People's Hospital Pharmacy");
    showToast(`Prescription #${currentRx.prescriptionNumber} transmitted to People's Hospital Pharmacy Queue!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 mb-2">
            <Activity className="w-3.5 h-3.5" />
            Digital e-Prescription Interface
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Standardized Electronic Prescription (e-Rx)
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
            Tamper-proof, cryptographically signed electronic prescriptions eliminating illegibility errors.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setAiModalInitialType("prescription_audit");
              setAiModalOpen(true);
            }}
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-500 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Safety Audit
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Selector and Prescription View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Prescription List Column */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Active Prescription ({prescriptions.length})
          </h3>

          <div className="space-y-2.5">
            {prescriptions.map((rx) => {
              const isSelected = rx.id === currentRx?.id;
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRxId(rx.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
                    isSelected
                      ? "bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{rx.prescriptionNumber}</span>
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
                  <div className="text-xs text-slate-700">
                    Patient: <strong>{rx.patientName}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dr: {rx.doctorName} • {rx.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prescription Document Preview */}
        <div className="lg:col-span-8 space-y-6">
          {currentRx ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 relative overflow-hidden">
              {/* Prescription Hospital Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      PH
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      PEOPLE'S HOSPITAL & MEDICAL CENTER
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Department of Clinical Medicine & Pharmacy Informatics
                  </div>
                  <div className="text-[11px] text-slate-400">
                    742 Healthcare Boulevard, Medical District • Tel: (800) 555-PEOPLES
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-sm font-bold text-slate-900">{currentRx.doctorName}</div>
                  <div className="text-xs text-blue-700 font-semibold">{currentRx.doctorSpecialty}</div>
                  <div className="text-[11px] text-slate-400">License: #MED-994827-US</div>
                </div>
              </div>

              {/* Patient Demographics Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Patient Name</span>
                  <div className="font-bold text-slate-900">{currentRx.patientName}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Age / Gender</span>
                  <div className="font-bold text-slate-900">{currentRx.patientAge} Yrs / {currentRx.patientGender}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Rx Number</span>
                  <div className="font-bold text-blue-700">{currentRx.prescriptionNumber}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Date Prescribed</span>
                  <div className="font-bold text-slate-900">{currentRx.date}</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="text-xs">
                <span className="font-bold text-slate-700">Diagnosis / Indication: </span>
                <span className="text-slate-900 font-medium">{currentRx.diagnosis}</span>
              </div>

              {/* Rx Medication Body */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-2xl font-serif font-black text-slate-900">
                  <span>℞</span>
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                    Medication Orders & Dosage Schedule
                  </span>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {currentRx.medicines.map((med, idx) => (
                    <div key={idx} className="p-4 bg-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-sm">
                          {idx + 1}. {med.medicineName}
                        </div>
                        <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-blue-200">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-slate-700 flex flex-wrap gap-4 text-xs font-medium">
                        <span>Frequency: <strong className="text-slate-900">{med.frequency}</strong></span>
                        <span>Duration: <strong className="text-slate-900">{med.duration}</strong></span>
                      </div>
                      <div className="text-slate-500 text-[11px] italic">
                        Directions: {med.instructions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor's Advice & Clinical Notes */}
              {currentRx.clinicalNotes && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs text-slate-700">
                  <span className="font-bold text-amber-900">Physician's Advisory:</span> {currentRx.clinicalNotes}
                </div>
              )}

              {/* Footer: Digital Seal, QR Code & Transmit CTA */}
              <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-xl flex flex-col items-center justify-center p-1">
                    <QrCode className="w-8 h-8 text-slate-800" />
                    <span className="text-[8px] font-mono text-slate-500">SCAN VERIFY</span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" /> Digitally Authenticated
                    </div>
                    <div className="text-[10px] text-slate-400">
                      SHA-256 Signature Hash: 7b8a..90f2
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendToPharmacy}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Route to Pharmacy
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("pharmacist-portal");
                      showToast("Opened Pharmacist Verification Station");
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Dispense as Pharmacist
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
              No prescription selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
