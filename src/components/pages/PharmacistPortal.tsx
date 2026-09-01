import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Clock,
  Search,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowRight,
  Package,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Prescription } from "../../types";
import { BackButton } from "../common/BackButton";

export const PharmacistPortal: React.FC = () => {
  const {
    prescriptions,
    updatePrescriptionStatus,
    medicines,
    setCurrentPage,
    setAiModalOpen,
    setAiModalInitialType,
    sendChatMessage,
    currentStaff,
    openStaffAuth,
    showToast,
  } = useApp();

  const activePharmacistName = currentStaff?.role === "pharmacist" ? currentStaff.name : "Pharm. Robert Miller, RPh";

  const [selectedRxId, setSelectedRxId] = useState<string>(prescriptions[0]?.id || "");
  const selectedRx = prescriptions.find((r) => r.id === selectedRxId) || prescriptions[0];

  const [counselingNotes, setCounselingNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (filterStatus === "all") return true;
    return rx.status === filterStatus;
  });

  const lowStockCount = medicines.filter((m) => m.status === "low_stock" || m.status === "out_of_stock").length;
  const expiringSoonCount = medicines.filter((m) => m.status === "expiring_soon").length;

  const handleVerify = (rx: Prescription) => {
    updatePrescriptionStatus(rx.id, "verified_by_pharmacist", counselingNotes || "Verified against hospital formulary & allergy records.");
  };

  const handleDispense = (rx: Prescription) => {
    updatePrescriptionStatus(
      rx.id,
      "dispensed",
      counselingNotes || "Medication dispensed with full patient counseling on timing, side-effects and storage."
    );
  };

  const handleRequestClarification = (rx: Prescription) => {
    updatePrescriptionStatus(rx.id, "needs_clarification", "Clarification requested regarding dosage/formulation.");
    // Send automated chat message to Doctor!
    sendChatMessage({
      senderRole: "pharmacist",
      senderName: "Pharm. Robert Miller, RPh",
      recipientName: rx.doctorName,
      topic: "Prescription Clarification",
      relatedPrescriptionId: rx.id,
      urgency: "urgent",
      content: `Hello ${rx.doctorName}, regarding prescription ${rx.prescriptionNumber} for ${rx.patientName}: Could you please clarify the dosage/timing for ${rx.medicines.map((m) => m.medicineName).join(", ")}?`,
    });
    showToast(`Clarification query sent directly to ${rx.doctorName}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Pharmacist Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 flex items-center justify-center text-white text-2xl font-bold">
            <Pill className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Hospital Pharmacy Informatics Station
              </h1>
              <span className="text-xs bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                {activePharmacistName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              Smart Verification, Drug Safety Screening & Automated Dispensing
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
              <span>Queue: <strong>{prescriptions.filter((p) => p.status === "pending_pharmacy").length} Pending</strong></span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">{lowStockCount} Low Stock SKUs</span>
              <span>•</span>
              <span className="text-red-300 font-semibold">{expiringSoonCount} Expiring Soon</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="pharmacist-switch-login-btn"
            onClick={() => openStaffAuth("pharmacist")}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentStaff?.role === "pharmacist" ? "Switch Pharmacist" : "Pharmacist Sign In"}</span>
          </button>

          <button
            onClick={() => {
              setAiModalInitialType("interaction");
              setAiModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Drug-Drug Interaction Screen
          </button>
          <button
            onClick={() => setCurrentPage("pharmacy-mgmt")}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            Inventory & Batches
          </button>
        </div>
      </div>

      {/* Main Pharmacist Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (4 cols): Incoming Prescription Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Digital e-Prescription Queue ({filteredPrescriptions.length})
              </h3>
              <div className="flex gap-1 text-[11px]">
                {["all", "pending_pharmacy", "dispensed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2 py-1 rounded-md capitalize font-medium transition ${
                      filterStatus === st
                        ? "bg-emerald-100 text-emerald-900 font-bold"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {st === "all" ? "All" : st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredPrescriptions.map((rx) => {
                const isSelected = rx.id === selectedRx?.id;
                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedRxId(rx.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{rx.prescriptionNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          rx.status === "dispensed"
                            ? "bg-green-100 text-green-800"
                            : rx.status === "verified_by_pharmacist"
                            ? "bg-teal-100 text-teal-800"
                            : rx.status === "needs_clarification"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rx.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      Patient: <strong className="text-slate-900">{rx.patientName}</strong> ({rx.patientAge}y)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Prescribed by {rx.doctorName} • {rx.date}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">
                      Items: {rx.medicines.map((m) => m.medicineName.split(" ")[0]).join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Prescription Verification & Dispensing Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedRx ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Prescription Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md">
                      {selectedRx.prescriptionNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        selectedRx.status === "dispensed"
                          ? "bg-green-100 text-green-800"
                          : selectedRx.status === "verified_by_pharmacist"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedRx.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Patient: <strong>{selectedRx.patientName}</strong> ({selectedRx.patientAge}y, {selectedRx.patientGender}) • Doctor: <strong>{selectedRx.doctorName}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAiModalInitialType("prescription_audit");
                    setAiModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Safety Audit
                </button>
              </div>

              {/* Clinical Alerts / Safety Notes */}
              {selectedRx.safetyAlerts && selectedRx.safetyAlerts.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Automated Pharmacovigilance & Formulary Flags:
                  </div>
                  {selectedRx.safetyAlerts.map((alert, i) => (
                    <div key={i} className="text-xs text-amber-800">
                      • {alert}
                    </div>
                  ))}
                </div>
              )}

              {/* Medication Verification Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Prescription Drugs & Pharmacy Inventory Check
                </h4>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {selectedRx.medicines.map((med, idx) => {
                    const stockItem = medicines.find((m) =>
                      m.name.toLowerCase().includes(med.medicineName.toLowerCase().split(" ")[0])
                    );

                    return (
                      <div key={idx} className="p-3.5 bg-white space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 text-sm">{med.medicineName}</div>
                          <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            Dosage: {med.dosage}
                          </span>
                        </div>
                        <div className="text-slate-600 flex flex-wrap gap-3 text-xs">
                          <span><strong>Schedule:</strong> {med.frequency}</span>
                          <span><strong>Duration:</strong> {med.duration}</span>
                          <span><strong>Instructions:</strong> {med.instructions}</span>
                        </div>
                        {stockItem && (
                          <div className="pt-1 text-[11px] flex items-center gap-2">
                            <span className="text-slate-500">Stock Availability:</span>
                            <span
                              className={`font-semibold ${
                                stockItem.stockQuantity > stockItem.minThreshold
                                  ? "text-emerald-600"
                                  : "text-amber-600 font-bold"
                              }`}
                            >
                              {stockItem.stockQuantity} units available (Batch #{stockItem.batchNumber})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pharmacist Counseling & Verification Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pharmacist Clinical Counseling & Dispensing Notes
                </label>
                <textarea
                  rows={2}
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  placeholder="e.g. Verified contraindications. Patient counseled on morning administration and dietary precautions."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleRequestClarification(selectedRx)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Clarification from Doctor
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(selectedRx)}
                    disabled={selectedRx.status === "verified_by_pharmacist" || selectedRx.status === "dispensed"}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Prescription
                  </button>

                  <button
                    onClick={() => handleDispense(selectedRx)}
                    disabled={selectedRx.status === "dispensed"}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/25"
                  >
                    <Pill className="w-4 h-4" />
                    Dispense & Counsel Patient
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select a prescription from the queue to review and dispense.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
