import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Activity,
  Shield,
  HeartPulse,
  PhoneCall,
  Lock,
  Sparkles,
  Award,
  ArrowUpRight,
} from "lucide-react";

export const Footer: React.FC = () => {
  const {
    setCurrentPage,
    resetToHome,
    setAiModalOpen,
    triggerEmergencyAlert,
    setHipaaModalOpen,
    openInquiryModal,
  } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Top CTA Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/50">
              <Award className="w-3.5 h-3.5" />
              Competition-Grade Healthcare Informatics Prototype
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              People's Hospital Healthcare Ecosystem
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Unifying Patients, Doctors, Pharmacists, Laboratories and Hospital Administrators on a zero-friction digital healthcare workflow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={resetToHome}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer border border-slate-700"
              title="Return to Main Home Dashboard"
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => openInquiryModal("general_inquiry")}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Submit Patient Intake / Inquiry</span>
            </button>
            <button
              onClick={() => setCurrentPage("competition")}
              className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-blue-600" />
              View Innovation Showcase
            </button>
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              AI Clinical Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div
              id="footer-brand-logo"
              onClick={resetToHome}
              className="flex items-center gap-3 cursor-pointer group w-fit"
              title="Return to Main Landing Dashboard"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-teal-300 transition-colors">
                People's<span className="text-teal-400"> Hospital</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              “People's Hospital uses digital technology to bring patients, doctors, pharmacists, laboratories and pharmacies together in one connected healthcare ecosystem.”
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>HL7 & FHIR Architecture</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>256-Bit Role Access</span>
              </div>
            </div>
          </div>

          {/* Col 2: Hospital & Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stakeholder Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentPage("admin")} className="hover:text-teal-300 transition text-teal-300 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Staff Admin Hub (/admin)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("patient-portal")} className="hover:text-teal-300 transition cursor-pointer">
                  Patient Health Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("doctor-portal")} className="hover:text-teal-300 transition cursor-pointer">
                  Doctor Clinical Station
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("pharmacist-portal")} className="hover:text-teal-300 transition cursor-pointer">
                  Pharmacist Verification
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("hospital-dashboard")} className="hover:text-teal-300 transition cursor-pointer">
                  Hospital Admin Analytics
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("lab-mgmt")} className="hover:text-teal-300 transition cursor-pointer">
                  Laboratory Diagnostic Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Smart Clinical Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smart Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentPage("google-drive-vault")} className="hover:text-blue-300 transition text-blue-300 font-semibold flex items-center gap-1">
                  <span>Google Drive Health Vault</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("pharmacy-mgmt")} className="hover:text-teal-300 transition">
                  Smart Pharmacy Inventory
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("digital-prescription")} className="hover:text-teal-300 transition">
                  Digital e-Prescriptions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("doctor-pharmacist-connect")} className="hover:text-teal-300 transition">
                  Doctor ↔ Pharmacist Connect
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("department-flow")} className="hover:text-teal-300 transition">
                  Department Flow Engine
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("medicine-search")} className="hover:text-teal-300 transition">
                  Drug & Formulary Search
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("health-records")} className="hover:text-teal-300 transition">
                  EHR & Lab Records
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Safety & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentPage("emergency")} className="hover:text-red-400 transition flex items-center gap-1 font-semibold text-red-400">
                  <HeartPulse className="w-3.5 h-3.5" />
                  Emergency Assistance
                </button>
              </li>
              <li>
                <button
                  onClick={() => setHipaaModalOpen(true)}
                  className="hover:text-teal-300 transition text-teal-400 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>HIPAA Compliance Notice (Modal)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("security-privacy")} className="hover:text-teal-300 transition cursor-pointer">
                  Security Architecture & Audit Logs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("about")} className="hover:text-teal-300 transition">
                  System Architecture
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("competition")} className="hover:text-teal-300 transition">
                  Problem & Solution Matrix
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("contact")} className="hover:text-teal-300 transition">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Required Final Statement & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 space-y-4 text-center">
          <div className="text-lg sm:text-xl font-extrabold text-teal-400 tracking-tight">
            “Future of Healthcare is Connected.”
          </div>

          <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-slate-300">Disclaimer:</span> This website is an educational prototype. It does not replace professional medical advice, diagnosis, or treatment. All clinical decision-support and medication records presented are for simulation and demonstration of healthcare informatics capabilities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 pt-2">
            <span>© 2026 People's Hospital. All Rights Reserved.</span>
            <span>•</span>
            <span>Healthcare Informatics Prototype</span>
            <span>•</span>
            <button onClick={() => setCurrentPage("security-privacy")} className="hover:underline">
              Security Protocol v2.4
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
