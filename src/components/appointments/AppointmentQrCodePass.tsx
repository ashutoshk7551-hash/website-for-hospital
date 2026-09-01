import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  CheckCircle2,
  Printer,
  Copy,
  Download,
  Share2,
  Building2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  ShieldCheck,
  Smartphone,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Appointment } from "../../types";
import { useApp } from "../../context/AppContext";

interface AppointmentQrCodePassProps {
  appointment: Appointment;
  onCheckInSuccess?: () => void;
  showSimulateScanButton?: boolean;
  compact?: boolean;
}

export const AppointmentQrCodePass: React.FC<AppointmentQrCodePassProps> = ({
  appointment,
  onCheckInSuccess,
  showSimulateScanButton = true,
  compact = false,
}) => {
  const { checkInAppointment, showToast } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  // Generate standardized FHIR-compatible Check-In payload for the QR Code
  const qrPayload = JSON.stringify({
    schema: "PEOPLES_HOSPITAL_OPD_V1",
    action: "PATIENT_ARRIVAL_CHECKIN",
    aptId: appointment.id,
    token: appointment.tokenNumber,
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone || "+1 (555) 234-8901",
    doctor: appointment.doctorName,
    dept: appointment.department,
    scheduledDate: appointment.date,
    scheduledTime: appointment.time,
    room: appointment.roomNumber,
    checkInUrl: `https://peopleshospital.health/reception/checkin?token=${encodeURIComponent(
      appointment.tokenNumber
    )}&id=${encodeURIComponent(appointment.id)}`,
    issuedAt: new Date().toISOString(),
  });

  const isCheckedIn = appointment.status === "checked-in" || justCheckedIn;

  const handleSimulateReceptionScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const result = checkInAppointment(appointment.id, "qr_scan");
      setIsScanning(false);
      if (result) {
        setJustCheckedIn(true);
        if (onCheckInSuccess) onCheckInSuccess();
      }
    }, 900);
  };

  const handleCopyCheckInCode = () => {
    navigator.clipboard?.writeText(
      `Hospital Token: ${appointment.tokenNumber} | Patient: ${appointment.patientName} | Doctor: ${appointment.doctorName}`
    );
    showToast(`Token #${appointment.tokenNumber} details copied to clipboard!`);
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById(`qr-svg-${appointment.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `PeoplesHospital_QR_Pass_${appointment.tokenNumber}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("QR Pass SVG downloaded successfully!");
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="p-2 bg-slate-900 rounded-xl text-white shrink-0 relative overflow-hidden group">
          <QRCodeSVG
            id={`qr-svg-${appointment.id}`}
            value={qrPayload}
            size={56}
            level="M"
            bgColor="#0f172a"
            fgColor="#ffffff"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">OPD Token</span>
            {isCheckedIn ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Arrived
              </span>
            ) : (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Ready to Scan
              </span>
            )}
          </div>
          <div className="text-base font-black text-slate-900 truncate">#{appointment.tokenNumber}</div>
          <div className="text-[11px] text-slate-500 truncate">{appointment.doctorName}</div>
        </div>

        {showSimulateScanButton && !isCheckedIn && (
          <button
            type="button"
            onClick={handleSimulateReceptionScan}
            disabled={isScanning}
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            title="Simulate reception scan"
          >
            {isScanning ? (
              <ScanLine className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            ) : (
              <ScanLine className="w-3.5 h-3.5" />
            )}
            <span>Scan</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 shadow-md p-6 relative overflow-hidden transition hover:shadow-lg">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600" />

      {/* Header section */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-teal-300 flex items-center justify-center shadow-xs font-bold text-sm">
            PH
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Reception QR Check-In Pass
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>People's Hospital • Main OPD Reception</span>
            </div>
          </div>
        </div>

        {/* Arrival Status Badge */}
        {isCheckedIn ? (
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arrived & Checked-In</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono mt-0.5">
              Verified at {appointment.checkedInAt || "10:30 AM"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full inline-flex items-center gap-1">
              <ScanLine className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Awaiting Arrival Scan</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Show to Reception Desk</span>
          </div>
        )}
      </div>

      {/* Body: QR Code & Appointment Details */}
      <div className="py-5 flex flex-col sm:flex-row items-center gap-6">
        {/* QR Code Container */}
        <div className="relative flex flex-col items-center shrink-0">
          <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-900/10 shadow-sm relative overflow-hidden group">
            {/* Scanning line animation when active */}
            {isScanning && (
              <div className="absolute inset-0 bg-teal-500/20 backdrop-blur-xs flex items-center justify-center z-10 animate-fade-in">
                <div className="w-full h-1 bg-teal-400 shadow-[0_0_12px_#2dd4bf] absolute top-1/2 -translate-y-1/2 animate-bounce" />
                <div className="text-[11px] font-bold text-teal-950 bg-white/90 px-2.5 py-1 rounded-full shadow">
                  Scanning...
                </div>
              </div>
            )}

            <QRCodeSVG
              id={`qr-svg-${appointment.id}`}
              value={qrPayload}
              size={136}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          <div className="text-center mt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Token Number</div>
            <div className="text-xl font-black font-mono text-blue-600">#{appointment.tokenNumber}</div>
          </div>
        </div>

        {/* Appointment & Patient Information */}
        <div className="flex-1 w-full space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{appointment.patientName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Consulting Doctor</span>
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{appointment.doctorName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule</span>
              <div className="font-medium text-slate-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{appointment.date}</span>
                <span className="text-slate-400">•</span>
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{appointment.time}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Location</span>
              <div className="font-medium text-slate-800 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{appointment.roomNumber || "OPD Room 102"}</span>
              </div>
            </div>
          </div>

          {/* Scannable instructions / Check-In Notification */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-2">
            <QrCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Present this digital pass at the OPD self-service kiosk or to the reception staff for zero-contact instant arrival confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-slate-200 pt-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyCheckInCode}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
            title="Copy check-in token details"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Token</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
            title="Download QR SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
            title="Print Pass"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>

        {/* Reception Simulation Action */}
        {showSimulateScanButton && (
          <div>
            {isCheckedIn ? (
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Patient Queue Position: #{appointment.queuePosition || 1}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateReceptionScan}
                disabled={isScanning}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <ScanLine className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Scan...</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Simulate Reception Scan</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
