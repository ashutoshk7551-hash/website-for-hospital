import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  ShieldCheck,
  Lock,
  FileCheck,
  KeyRound,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  Database,
  Search,
} from "lucide-react";
import { BackButton } from "../common/BackButton";

export const SecurityPrivacyPage: React.FC = () => {
  const [searchLog, setSearchLog] = useState("");

  const auditLogs = [
    {
      id: "log-101",
      timestamp: "2026-08-26 10:24:12 UTC",
      user: "Dr. Sarah Chen (MD)",
      role: "Doctor",
      action: "CREATE_PRESCRIPTION",
      resource: "Rx #RX-2026-8812 (Eleanor Vance)",
      status: "SUCCESS",
      ip: "10.14.88.*** (Hospital VPN)",
    },
    {
      id: "log-102",
      timestamp: "2026-08-26 10:25:40 UTC",
      user: "Pharm. Robert Miller (RPh)",
      role: "Pharmacist",
      action: "VERIFY_DISPENSE",
      resource: "Rx #RX-2026-8812 (Telmisartan 40mg)",
      status: "SUCCESS",
      ip: "10.14.92.*** (Pharmacy Station 3)",
    },
    {
      id: "log-103",
      timestamp: "2026-08-26 10:26:05 UTC",
      user: "Eleanor Vance",
      role: "Patient",
      action: "VIEW_LAB_REPORT",
      resource: "Lab #LAB-1029 (Comprehensive Metabolic Panel)",
      status: "SUCCESS",
      ip: "172.56.21.*** (Patient Portal Mobile)",
    },
    {
      id: "log-104",
      timestamp: "2026-08-26 10:27:18 UTC",
      user: "Alex Wong (CLT)",
      role: "Lab Tech",
      action: "UPDATE_BIOMARKERS",
      resource: "Lab #LAB-1031 (Blood Glucose & HbA1c)",
      status: "SUCCESS",
      ip: "10.14.105.*** (Biochemistry Analyzer)",
    },
    {
      id: "log-105",
      timestamp: "2026-08-26 10:28:02 UTC",
      user: "System Daemon",
      role: "System",
      action: "DRUG_INTERACTION_SCREEN",
      resource: "Safety Engine / Gemini 3.7 Endpoint",
      status: "VERIFIED",
      ip: "127.0.0.1 (Internal Service Mesh)",
    },
  ];

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.user.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold mb-2 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            HIPAA, GDPR & FHIR R4 Compliant
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Healthcare Security, Privacy & Audit Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Strict Role-Based Access Control (RBAC), end-to-end cryptographic encryption, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>AES-256 At Rest • TLS 1.3 In Flight</span>
        </div>
      </div>

      {/* RBAC MATRIX */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Role-Based Access Control (RBAC) Permissions Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Zero-Trust architectural isolation ensuring users only access authorized health records
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
            5 Distinct Roles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Resource / Module</th>
                <th className="px-4 py-3 text-center">Patient</th>
                <th className="px-4 py-3 text-center">Doctor</th>
                <th className="px-4 py-3 text-center">Pharmacist</th>
                <th className="px-4 py-3 text-center">Lab Tech</th>
                <th className="px-4 py-3 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { module: "View Own Health Records & Vitals", patient: true, doctor: true, pharm: false, lab: false, admin: false },
                { module: "Author e-Prescriptions (Rx)", patient: false, doctor: true, pharm: false, lab: false, admin: false },
                { module: "Verify & Dispense Medications", patient: false, doctor: false, pharm: true, lab: false, admin: false },
                { module: "Update Lab Biomarkers & Reports", patient: false, doctor: false, pharm: false, lab: true, admin: false },
                { module: "Hospital Bed & Operations Overview", patient: false, doctor: false, pharm: false, lab: false, admin: true },
                { module: "Doctor ↔ Pharmacist Collaboration", patient: false, doctor: true, pharm: true, lab: false, admin: false },
                { module: "Emergency SOS Trigger", patient: true, doctor: true, pharm: true, lab: true, admin: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.module}</td>
                  <td className="px-4 py-3 text-center">{row.patient ? "✅" : "⛔"}</td>
                  <td className="px-4 py-3 text-center">{row.doctor ? "✅" : "⛔"}</td>
                  <td className="px-4 py-3 text-center">{row.pharm ? "✅" : "⛔"}</td>
                  <td className="px-4 py-3 text-center">{row.lab ? "✅" : "⛔"}</td>
                  <td className="px-4 py-3 text-center">{row.admin ? "✅" : "⛔"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMMUTABLE AUDIT LOGS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Immutable System Access Audit Log
            </h3>
            <p className="text-xs text-slate-500">Every record read, write, or transmit event is cryptographically indexed</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3.5 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-900">{log.user}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">({log.role})</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Target: <strong className="text-slate-800">{log.resource}</strong>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                <div className="flex items-center gap-1 justify-end font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {log.status}
                </div>
                <div>{log.timestamp} • {log.ip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
