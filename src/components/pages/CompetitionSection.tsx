import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Pill,
  Stethoscope,
  Activity,
} from "lucide-react";

export const CompetitionSection: React.FC = () => {
  const { setCurrentPage, setAiModalOpen } = useApp();

  const comparisonRows = [
    {
      problem: "Prescription Delivery & Legibility",
      traditional: "Handwritten paper slips with high risk of handwriting misinterpretation and physical loss.",
      smart: "Cryptographically signed e-Prescriptions with standard terminology (RxNorm/SNOMED) and zero paper delay.",
    },
    {
      problem: "Doctor-Pharmacist Communication",
      traditional: "Unreliable telephone pings, manual voicemail tags, or delayed patient return visits.",
      smart: "Instant secure messaging thread with linked prescription context and one-click dosage reviews.",
    },
    {
      problem: "Drug Safety & Interaction Screening",
      traditional: "Manual memory checks or retrospective pharmacy audits after dispensing.",
      smart: "Automated Gemini 3.7 AI multi-agent interaction screening before the patient even leaves the clinic.",
    },
    {
      problem: "Pharmacy Inventory & Stockouts",
      traditional: "Periodic physical counts leading to unexpected stockouts of life-saving medications.",
      smart: "Real-time batch tracking with automatic low-stock alarms and epidemic demand forecasting.",
    },
    {
      problem: "Laboratory Diagnostic Turnaround",
      traditional: "Paper lab slips carried by hand between departments taking 3-6 hours.",
      smart: "Direct electronic specimen tracking and instant EHR sync with doctor/patient alerts in 40 minutes.",
    },
    {
      problem: "Patient Adherence & Continuity",
      traditional: "Forgotten doses, missing paper records, and no follow-up tracking.",
      smart: "Interactive daily pill checklist, refill requests, and automatic follow-up reminders.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      {/* Presentation Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Award className="w-4 h-4 text-teal-300" />
            Healthcare Informatics Competition Showcase
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How People's Hospital Solves Healthcare's Greatest Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Bridging the historic communication chasm between physicians, clinical pharmacists, and patients through unified digital architecture.
          </p>
        </div>
      </div>

      {/* BEFORE VS AFTER MATRIX */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
            System Evolution Analysis
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Traditional Healthcare vs People's Hospital Smart Ecosystem
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
            <thead className="text-[11px] uppercase tracking-wider font-bold">
              <tr className="border-b border-slate-200">
                <th className="p-4 bg-slate-50 text-slate-700 w-1/4">Healthcare Dimension</th>
                <th className="p-4 bg-red-50 text-red-900 w-3/8">Traditional Fragmented Hospital</th>
                <th className="p-4 bg-teal-50 text-teal-900 w-3/8">People's Hospital Smart System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">{row.problem}</td>
                  <td className="p-4 text-slate-600 bg-red-50/20">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-800 font-medium bg-teal-50/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{row.smart}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TECHNOLOGY STACK BREAKDOWN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Engineered for Production Scale
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Technical Architecture & Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Frontend Engine</h3>
            <p className="text-xs text-slate-600">
              React 18+, TypeScript, Tailwind CSS, Lucide icons, and responsive fluid grid architecture.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI Intelligence Core</h3>
            <p className="text-xs text-slate-600">
              Gemini 3.7 models with structured server-side clinical prompts for pharmacology, interactions, and forecasting.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Backend API Services</h3>
            <p className="text-xs text-slate-600">
              Express Node.js runtime proxying secure microservices with zero client-side credential exposure.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Healthcare Standards</h3>
            <p className="text-xs text-slate-600">
              HL7 FHIR R4 data models, RxNorm code structures, AES-256 encryption, and HIPAA RBAC security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
