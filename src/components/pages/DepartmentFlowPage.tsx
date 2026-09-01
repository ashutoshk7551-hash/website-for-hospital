import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  GitBranch,
  User,
  Stethoscope,
  Pill,
  TestTube2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  HeartPulse,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BackButton } from "../common/BackButton";

export const DepartmentFlowPage: React.FC = () => {
  const { setCurrentPage, setActiveRole } = useApp();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeWorkflow, setActiveWorkflow] = useState<"opd" | "emergency">("opd");

  const opdSteps = [
    {
      step: 1,
      title: "Patient Arrival & OPD Registration",
      dept: "OPD & Front Desk",
      icon: User,
      color: "bg-blue-600",
      desc: "Patient checks in via portal or kiosk. Real-time token number generated and synced with Physician's schedule queue.",
      actionText: "Open Patient Portal",
      actionTarget: "patient-portal",
      roleTarget: "patient",
    },
    {
      step: 2,
      title: "Doctor Consultation & Clinical Diagnosis",
      dept: "Consultation Suite",
      icon: Stethoscope,
      color: "bg-teal-600",
      desc: "Physician examines patient, reviews longitudinal EHR vitals, and formulates clinical assessment.",
      actionText: "Open Doctor Portal",
      actionTarget: "doctor-portal",
      roleTarget: "doctor",
    },
    {
      step: 3,
      title: "Digital e-Prescription Authoring",
      dept: "Physician Workstation",
      icon: FileText,
      color: "bg-indigo-600",
      desc: "Doctor types prescription with automatic AI dosage ceiling check. Cryptographically signed and transmitted instantly.",
      actionText: "View e-Prescription",
      actionTarget: "digital-prescription",
    },
    {
      step: 4,
      title: "Instant Routing to Hospital Pharmacy",
      dept: "Smart Central Pharmacy",
      icon: Pill,
      color: "bg-emerald-600",
      desc: "Pharmacist receives e-Rx in queue. Runs drug-interaction screen against patient allergy history and checks batch availability.",
      actionText: "Open Pharmacist Portal",
      actionTarget: "pharmacist-portal",
      roleTarget: "pharmacist",
    },
    {
      step: 5,
      title: "Laboratory Diagnostic Ordering",
      dept: "Pathology & Diagnostics",
      icon: TestTube2,
      color: "bg-purple-600",
      desc: "Biochemistry & hematology orders transmitted electronically. Sample barcoded and tracked in real time.",
      actionText: "Open Lab Hub",
      actionTarget: "lab-mgmt",
      roleTarget: "lab_tech",
    },
    {
      step: 6,
      title: "Lab Results Synced with EHR",
      dept: "Diagnostics & EHR",
      icon: CheckCircle2,
      color: "bg-fuchsia-600",
      desc: "Validated biomarker findings immediately visible to both Physician and Patient in their personal portals.",
      actionText: "View Health Records",
      actionTarget: "health-records",
    },
    {
      step: 7,
      title: "Medication Dispensing & Patient Counseling",
      dept: "Pharmacy Counter",
      icon: Pill,
      color: "bg-emerald-700",
      desc: "Pharmacist verifies batch #, counsels patient on food timing, and completes digital dispensing sign-off.",
      actionText: "View Pharmacy Stock",
      actionTarget: "pharmacy-mgmt",
    },
    {
      step: 8,
      title: "Automated Follow-up & Pill Reminders",
      dept: "Patient Care Companion",
      icon: Clock,
      color: "bg-teal-700",
      desc: "Patient receives daily scheduled medication alerts and 8-week follow-up appointment prompts.",
      actionText: "Check Patient Dashboard",
      actionTarget: "patient-portal",
      roleTarget: "patient",
    },
  ];

  const emergencySteps = [
    {
      step: 1,
      title: "1-Click SOS or Paramedic Triage",
      dept: "Emergency / Ambulance",
      icon: HeartPulse,
      color: "bg-red-600",
      desc: "Trauma alert triggered with GPS location. Patient emergency allergy profile broadcast to incoming ER bay.",
      actionText: "Open Emergency Center",
      actionTarget: "emergency",
    },
    {
      step: 2,
      title: "Resuscitation & ICU Bed Reservation",
      dept: "Trauma & ICU Command",
      icon: Building2,
      color: "bg-rose-700",
      desc: "System auto-reserves ICU ventilator bed and notifies on-call trauma surgeon and anesthesiologist.",
      actionText: "View Hospital Beds",
      actionTarget: "hospital-dashboard",
      roleTarget: "admin",
    },
    {
      step: 3,
      title: "STAT Pharmacy & Blood Bank Dispatch",
      dept: "Emergency Pharmacy",
      icon: Pill,
      color: "bg-red-800",
      desc: "Immediate release of emergency medications (epinephrine, nitroglycerin, O-negative blood units).",
      actionText: "View Emergency Stock",
      actionTarget: "pharmacy-mgmt",
    },
    {
      step: 4,
      title: "Point-of-Care STAT Diagnostics",
      dept: "Emergency Pathology",
      icon: TestTube2,
      color: "bg-purple-700",
      desc: "Rapid blood gas, troponin, and toxicology results returned in under 8 minutes directly to ER monitors.",
      actionText: "View Diagnostics",
      actionTarget: "lab-mgmt",
      roleTarget: "lab_tech",
    },
  ];

  const currentSteps = activeWorkflow === "opd" ? opdSteps : emergencySteps;
  const currentStepData = currentSteps[activeStep] || currentSteps[0];
  const StepIcon = currentStepData.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            Hospital Software Integration Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Inter-Department Connected Care Lifecycle
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
            Explore how data and clinical tasks seamlessly flow across OPD, Doctor, Pharmacy, Lab, and EHR.
          </p>
        </div>

        {/* Workflow Toggle */}
        <div className="bg-white/10 p-1.5 rounded-2xl flex gap-1 text-xs">
          <button
            onClick={() => {
              setActiveWorkflow("opd");
              setActiveStep(0);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeWorkflow === "opd" ? "bg-white text-slate-950 shadow-sm" : "text-white hover:bg-white/10"
            }`}
          >
            OPD Routine Lifecycle (8 Steps)
          </button>
          <button
            onClick={() => {
              setActiveWorkflow("emergency");
              setActiveStep(0);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeWorkflow === "emergency" ? "bg-red-600 text-white shadow-sm" : "text-white hover:bg-white/10"
            }`}
          >
            Emergency Trauma Flow (4 Steps)
          </button>
        </div>
      </div>

      {/* Interactive Step Timeline Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Interactive Step-Through Simulation
          </h3>
          <span className="text-xs text-slate-500">
            Click any step to inspect department operations
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {currentSteps.map((st, i) => {
            const isSelected = i === activeStep;
            const isDone = i < activeStep;
            const Icon = st.icon;

            return (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20"
                    : isDone
                    ? "bg-slate-50 border-emerald-300"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isDone ? "✓" : st.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                    {st.title}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{st.dept}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Card */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl ${currentStepData.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
              <StepIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Step {currentStepData.step} • {currentStepData.dept}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentStepData.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {currentStepData.desc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {currentStepData.actionText && (
              <button
                onClick={() => {
                  if (currentStepData.roleTarget) setActiveRole(currentStepData.roleTarget as any);
                  setCurrentPage(currentStepData.actionTarget as any);
                }}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                {currentStepData.actionText} <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              </button>
            )}

            {activeStep < currentSteps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={() => setActiveStep(0)}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
              >
                Restart Lifecycle Flow ↺
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
