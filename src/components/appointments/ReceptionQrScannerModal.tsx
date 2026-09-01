import React, { useState } from "react";
import {
  QrCode,
  X,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  User,
  Stethoscope,
  Calendar,
  Clock,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Volume2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Appointment } from "../../types";

interface ReceptionQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAppointmentId?: string;
}

export const ReceptionQrScannerModal: React.FC<ReceptionQrScannerModalProps> = ({
  isOpen,
  onClose,
  initialAppointmentId,
}) => {
  const { appointments, checkInAppointment, showToast } = useApp();
  const [selectedAptId, setSelectedAptId] = useState<string>(
    initialAppointmentId || appointments[0]?.id || ""
  );
  const [manualTokenInput, setManualTokenInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Appointment | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetApt = appointments.find(
    (a) =>
      a.id === selectedAptId ||
      a.tokenNumber.toLowerCase() === manualTokenInput.trim().toLowerCase()
  ) || appointments[0];

  const handleScanAction = (apt: Appointment) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const verified = checkInAppointment(apt.id, "qr_scan");
      if (verified) {
        setScanResult(verified);
        showToast(`Reception Scanner: Check-in verified for ${verified.patientName}!`);
      } else {
        setScanError("QR barcode was invalid or already expired.");
      }
    }, 1000);
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTokenInput.trim()) return;

    const matched = appointments.find(
      (a) =>
        a.tokenNumber.toLowerCase() === manualTokenInput.trim().toLowerCase() ||
        a.id.toLowerCase() === manualTokenInput.trim().toLowerCase()
    );

    if (matched) {
      handleScanAction(matched);
    } else {
      setScanError(`No active appointment found for token "${manualTokenInput.trim()}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Reception Fast Check-In QR Scanner</h3>
              <p className="text-xs text-blue-200/80">
                Hospital OPD Arrival Terminal • Zero-Wait Patient Queue Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scanner Viewfinder Box */}
          <div className="relative bg-slate-950 rounded-2xl p-6 text-white overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
            {/* Corner guide markers */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-md" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-md" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-md" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-md" />

            {/* Laser scanning bar */}
            {isScanning && (
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-teal-500 via-emerald-300 to-teal-500 shadow-[0_0_15px_#2dd4bf] animate-pulse z-20" />
            )}

            <div className="text-center space-y-3 z-10">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">
                  {isScanning
                    ? "Reading Optical QR Code Data..."
                    : "Optical Barcode & QR Scanner Ready"}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                  Point the patient's digital or printed QR pass into the reception camera field.
                </p>
              </div>

              {targetApt && (
                <button
                  type="button"
                  onClick={() => handleScanAction(targetApt)}
                  disabled={isScanning}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>
                    {isScanning
                      ? "Decoding Payload..."
                      : `Trigger Scan for Token #${targetApt.tokenNumber}`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Scan Results Card */}
          {scanResult && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-emerald-950 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Patient Arrival Verified & Added to Doctor's OPD Queue!</span>
                </div>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full uppercase">
                  Status: {scanResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient</span>
                  <strong className="text-slate-900">{scanResult.patientName}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Doctor</span>
                  <strong className="text-slate-900">{scanResult.doctorName}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">OPD Room</span>
                  <strong className="text-slate-900">{scanResult.roomNumber}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Check-In Time</span>
                  <strong className="text-emerald-700 font-mono">{scanResult.checkedInAt}</strong>
                </div>
              </div>
            </div>
          )}

          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Quick Select & Manual Entry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick OPD Appointments List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select from Today's OPD Schedule ({appointments.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {appointments.map((apt) => {
                  const isSelected = apt.id === selectedAptId;
                  const isChecked = apt.status === "checked-in";
                  return (
                    <div
                      key={apt.id}
                      onClick={() => {
                        setSelectedAptId(apt.id);
                        setScanResult(null);
                        setScanError(null);
                      }}
                      className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 border-blue-400 ring-2 ring-blue-500/20"
                          : "bg-slate-50 border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">#{apt.tokenNumber}</span>
                          <span className="text-slate-700">• {apt.patientName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {apt.doctorName} • {apt.time}
                        </div>
                      </div>

                      {isChecked ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Checked-In
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAptId(apt.id);
                            handleScanAction(apt);
                          }}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Scan</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manual Token Lookup Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Manual Token Code Lookup
              </label>
              <form onSubmit={handleManualCheckIn} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500">
                  If the patient's phone screen is cracked or barcode is unreadable, enter the 3-digit token code or appointment reference ID.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualTokenInput}
                    onChange={(e) => setManualTokenInput(e.target.value)}
                    placeholder="e.g. C-45 or APT-601"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 bg-white text-xs uppercase font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Encrypted FHIR OPD Protocol 2.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
