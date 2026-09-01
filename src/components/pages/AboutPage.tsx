import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Activity,
  ShieldCheck,
  Award,
  HeartPulse,
  Stethoscope,
  Pill,
  Building2,
  TestTube2,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Calendar,
  Lock,
  Zap,
} from "lucide-react";
import { BackButton } from "../common/BackButton";

export const AboutPage: React.FC = () => {
  const { setCurrentPage, setActiveRole, openInquiryModal } = useApp();

  const values = [
    {
      title: "Patient-Centric Care",
      desc: "Every touchpoint is designed for patient dignity, rapid recovery, and frictionless access to electronic health records and medication.",
      icon: HeartPulse,
      color: "text-red-500 bg-red-50",
    },
    {
      title: "Clinical Excellence",
      desc: "Multi-disciplinary team of board-certified physicians, clinical pharmacologists, and licensed laboratory diagnosticians.",
      icon: Stethoscope,
      color: "text-teal-600 bg-teal-50",
    },
    {
      title: "Interoperable Technology",
      desc: "Built on HL7 FHIR standards, end-to-end encryption, and AI pharmacology screening to eliminate medication errors.",
      icon: Zap,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Zero-Stockout Pharmacy",
      desc: "Automated intelligent replenishment systems and barcode-verified dispensing to safeguard medicine availability.",
      icon: Pill,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  const leadership = [
    {
      name: "Dr. Arthur Campbell, MD",
      role: "Chief Medical Officer (CMO)",
      spec: "Cardiology & Healthcare Informatics",
      desc: "Over 22 years of clinical leadership pioneering hospital digital transformation and patient safety protocols.",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=faces",
    },
    {
      name: "Sarah Jenkins, PharmD",
      role: "Director of Clinical Pharmacy",
      spec: "Pharmacotherapy & Formulary Management",
      desc: "Specialist in anti-microbial stewardship, medication reconciliation, and electronic prescription verification.",
      avatar: "https://images.unsplash.com/photo-1594824813589-983084bf6d07?w=300&h=300&fit=crop&crop=faces",
    },
    {
      name: "Dr. Evelyn Reed, MD, PhD",
      role: "Head of Pathology & Diagnostics",
      spec: "Molecular Diagnostics & Hematology",
      desc: "Oversees CAP-accredited diagnostic labs processing automated real-time test reports and emergency cross-matching.",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=faces",
    },
    {
      name: "Marcus Vance, MBA, CPHIMS",
      role: "Director of Healthcare Technology",
      spec: "Health Information Systems & AI Integration",
      desc: "Architect of the People's Hospital connected ecosystem, HL7 data interoperability, and cloud health vault infrastructure.",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=faces",
    },
  ];

  return (
    <div className="space-y-10 pb-16 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Award className="w-4 h-4 text-teal-400" />
            <span>Healthcare Ecosystem & Institutional Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            About <span className="text-teal-400">People's Hospital</span> Health System
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            People's Hospital is an integrated clinical institution dedicated to delivering transparent, compassionate, and digitally connected healthcare. Our unified platform bridges patients, doctors, pharmacists, laboratories, and hospital administrators in real-time.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setCurrentPage("appointments")}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book an Appointment</span>
            </button>
            <button
              onClick={() => openInquiryModal("general_inquiry")}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-teal-300" />
              <span>Contact Hospital Administration</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Guiding Clinical Principles
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every clinical decision, technological innovation, and patient interaction is grounded in four fundamental pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${v.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Infrastructure Breakdown */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="text-xs text-teal-400 font-bold uppercase tracking-wider">
              Connected Healthcare Architecture
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              End-to-End Hospital Workflow Integration
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage("department-flow")}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Explore Department Flow</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Stethoscope className="w-4 h-4" />
              <span>Outpatient & Inpatient Clinical Station</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Physicians access complete longitudinal EHR, allergy profiles, vital charts, and digitally sign e-prescriptions transmitted directly to the central pharmacy.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Pill className="w-4 h-4" />
              <span>Smart Dispensing & Pharmacy Unit</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Clinical pharmacists perform automated interaction audits, verify dosage ceilings, and dispense medications with instant batch decrementing and patient counseling.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <TestTube2 className="w-4 h-4" />
              <span>CAP-Accredited Diagnostic Labs</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Automated specimen barcode intake, real-time hematology and biochemistry analysis, and instant encrypted publication of test results to the patient portal.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinical Leadership & Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Guided by experienced medical practitioners, pharmacologists, and healthcare informatics specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 text-center"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-teal-500 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                <div className="text-xs font-semibold text-teal-700">{member.role}</div>
                <div className="text-[11px] text-slate-500 font-medium">{member.spec}</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
