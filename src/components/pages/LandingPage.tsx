import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Activity,
  Calendar,
  Pill,
  Search,
  User,
  Stethoscope,
  Building2,
  TestTube2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  HeartPulse,
  Share2,
  Users,
  Award,
  AlertTriangle,
  GitBranch,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const {
    setCurrentPage,
    setActiveRole,
    setAiModalOpen,
    hospitalStats,
    prescriptions,
    medicines,
    appointments,
  } = useApp();

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-teal-50/40 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Next-Gen Smart Healthcare & Pharmacy Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Connecting Healthcare.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600">
                  Empowering Patients.
                </span>{" "}
                Transforming Pharmacy.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                An intelligent digital platform connecting patients, doctors, pharmacists, hospitals, laboratories and pharmacies for faster, safer and more patient-centred healthcare.
              </p>

              {/* Prominent Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  id="hero-book-apt-btn"
                  onClick={() => setCurrentPage("appointments")}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4" />
                  Book Doctor Appointment
                </button>

                <button
                  id="hero-consult-pharm-btn"
                  onClick={() => setCurrentPage("doctor-pharmacist-connect")}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-teal-500/25 flex items-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Pill className="w-4 h-4" />
                  Consult Pharmacist
                </button>

                <button
                  id="hero-find-pharm-btn"
                  onClick={() => setCurrentPage("medicine-search")}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  Find Pharmacy / Medicine
                </button>

                <button
                  id="hero-patient-login-btn"
                  onClick={() => {
                    setActiveRole("patient");
                    setCurrentPage("patient-portal");
                  }}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <User className="w-4 h-4 text-teal-400" />
                  Patient Login
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-Time e-Prescriptions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>AI Drug-Interaction Safety</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Live Smart Inventory</span>
                </div>
              </div>
            </div>

            {/* Right Hero: Interactive Ecosystem Diagram / Healthcare Visual */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 relative">
                {/* Central Hub Badge */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                    <Activity className="w-3.5 h-3.5 animate-pulse text-teal-600" />
                    Centralized Healthcare Exchange
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">
                    Multi-Stakeholder Connected Architecture
                  </h3>
                </div>

                {/* Interactive Network Node Grid */}
                <div className="grid grid-cols-2 gap-3 relative">
                  {/* Patient Node */}
                  <div
                    onClick={() => {
                      setActiveRole("patient");
                      setCurrentPage("patient-portal");
                    }}
                    className="p-3.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-2xl cursor-pointer transition text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">1. Patients</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Appointments, EHR, Reminders</div>
                  </div>

                  {/* Doctor Node */}
                  <div
                    onClick={() => {
                      setActiveRole("doctor");
                      setCurrentPage("doctor-portal");
                    }}
                    className="p-3.5 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200 rounded-2xl cursor-pointer transition text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">2. Doctors</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">e-Prescription, Consultations</div>
                  </div>

                  {/* Pharmacist Node */}
                  <div
                    onClick={() => {
                      setActiveRole("pharmacist");
                      setCurrentPage("pharmacist-portal");
                    }}
                    className="p-3.5 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl cursor-pointer transition text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">3. Pharmacists</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Dispensing, Safety Screening</div>
                  </div>

                  {/* Laboratory Node */}
                  <div
                    onClick={() => {
                      setActiveRole("lab_tech");
                      setCurrentPage("lab-mgmt");
                    }}
                    className="p-3.5 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200 rounded-2xl cursor-pointer transition text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <TestTube2 className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">4. Laboratory</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Samples & Digital Reports</div>
                  </div>

                  {/* Hospital Admin Node */}
                  <div
                    onClick={() => {
                      setActiveRole("admin");
                      setCurrentPage("hospital-dashboard");
                    }}
                    className="col-span-2 p-3.5 bg-slate-900 text-white rounded-2xl cursor-pointer transition text-left hover:bg-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">5. Hospital Administrator Hub</div>
                        <div className="text-[11px] text-slate-300">Beds, Analytics, Inter-Department Sync</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-teal-400" />
                  </div>
                </div>

                {/* Real-Time Pulse Metric */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    Ecosystem Live Status:
                  </span>
                  <span className="font-bold text-slate-800">
                    {prescriptions.length} Active Rx • {medicines.length} Drug SKUs Synced
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK METRICS & SYSTEM HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hospital Beds</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {hospitalStats.totalBeds - hospitalStats.occupiedBeds}{" "}
              <span className="text-xs font-normal text-slate-500">Available / {hospitalStats.totalBeds}</span>
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              ICU Available: {hospitalStats.icuBedsAvailable} Units
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OPD Appointments</span>
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {hospitalStats.opdPatientsToday}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Active Doctors on Duty: {hospitalStats.activeDoctorsOnDuty}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rx Dispensed Today</span>
              <Pill className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {hospitalStats.prescriptionsDispensedToday}
            </div>
            <div className="text-xs text-teal-600 font-medium mt-1">
              0% Paper Delay (Direct e-Rx)
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Response</span>
              <HeartPulse className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {hospitalStats.emergencyCasesToday}{" "}
              <span className="text-xs font-normal text-slate-500">Triage Cases</span>
            </div>
            <div className="text-xs text-red-600 font-medium mt-1">
              24/7 Digital Rapid Dispatch
            </div>
          </div>
        </div>
      </section>

      {/* CORE WORKFLOW PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            End-to-End Hospital & Pharmacy Digitization
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How People's Hospital Unifies Healthcare
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Eliminate communication bottlenecks between doctors, pharmacies, and labs with digital workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Doctor-Pharmacist Bridge */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Doctor ↔ Pharmacist Connect
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctors write digital prescriptions with automated dose guidance. Pharmacists instantly receive, verify against stock, and screen for interactions before dispensing.
            </p>
            <button
              onClick={() => setCurrentPage("doctor-pharmacist-connect")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              Explore Collaboration Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Smart Pharmacy & Inventory */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Smart Pharmacy Inventory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time batch tracking, expiration warnings, automated reordering thresholds, and AI-assisted demand forecasting to prevent medication stockouts.
            </p>
            <button
              onClick={() => setCurrentPage("pharmacy-mgmt")}
              className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1.5"
            >
              Open Pharmacy Management <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Patient Care Dashboard */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Patient-Centred Care & EHR
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patients manage appointments, receive timely pill reminders, download lab reports, view digital prescriptions, and connect with their care team anytime.
            </p>
            <button
              onClick={() => {
                setActiveRole("patient");
                setCurrentPage("patient-portal");
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5"
            >
              Launch Patient Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* AI & SMART HEALTHCARE HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                AI Clinical Decision Support Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Intelligent Clinical Intelligence at Your Fingertips
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Powered by Gemini 3.7 AI models, People's Hospital AI provides real-time pharmacology screening, drug interaction warnings, prescription safety audits, and stock replenishment forecasting.
              </p>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Policy:</strong> AI tools operate strictly as decision-support assistance. All clinical determinations are finalized by certified physicians and pharmacists.
                </span>
              </div>

              <div className="pt-2">
                <button
                  id="landing-open-ai-modal"
                  onClick={() => setAiModalOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Try AI Drug Interaction & Clinical Checker
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    Drug-Drug Interaction Screen
                  </span>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Live AI</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Instant multi-agent pharmacokinetic & cytochrome P450 pathway screening.
                </p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    e-Prescription Dosage Auditor
                  </span>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Safety</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Calculates renal adjustments, allergy flags, and pediatric therapeutic ceilings.
                </p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Predictive Stock Depletion
                  </span>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Forecasting</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Seasonal epidemic surge models forecast replenishment orders weeks in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK JUMP TO ALL 17 PAGES / MODULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Explore Complete Platform Modules</h3>
            <p className="text-xs text-slate-500">Access all 17 competition-ready portals and interactive dashboards</p>
          </div>
          <button
            onClick={() => setCurrentPage("competition")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Award className="w-4 h-4" />
            Competition Presentation
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { id: "patient-portal", label: "Patient Portal", icon: User, desc: "Personal Health Hub", role: "patient" },
            { id: "doctor-portal", label: "Doctor Portal", icon: Stethoscope, desc: "Clinical Station", role: "doctor" },
            { id: "pharmacist-portal", label: "Pharmacist Portal", icon: Pill, desc: "Rx Verification", role: "pharmacist" },
            { id: "hospital-dashboard", label: "Hospital Admin", icon: Building2, desc: "Bed & Resource Mgmt", role: "admin" },
            { id: "pharmacy-mgmt", label: "Smart Pharmacy", icon: Pill, desc: "Inventory & Batches" },
            { id: "lab-mgmt", label: "Laboratory Hub", icon: TestTube2, desc: "Sample Tracking & Reports", role: "lab_tech" },
            { id: "appointments", label: "Appointments", icon: Calendar, desc: "Booking System" },
            { id: "digital-prescription", label: "e-Prescription", icon: Activity, desc: "Digital Rx Workflow" },
            { id: "medicine-search", label: "Medicine Search", icon: Search, desc: "Formulary Catalog" },
            { id: "doctor-pharmacist-connect", label: "Doctor-Pharm Chat", icon: Share2, desc: "Live Collaboration" },
            { id: "health-records", label: "Health Records", icon: Activity, desc: "Unified EHR & History" },
            { id: "analytics", label: "Analytics Hub", icon: Zap, desc: "Recharts Dashboards" },
            { id: "department-flow", label: "Hospital Flow", icon: GitBranch, desc: "Inter-Department Map" },
            { id: "emergency", label: "Emergency 24/7", icon: HeartPulse, desc: "Rapid Triage & SOS" },
            { id: "security-privacy", label: "Security & HIPAA", icon: ShieldCheck, desc: "Audit & Access Control" },
            { id: "competition", label: "Innovation Pitch", icon: Award, desc: "Before vs After Matrix" },
            { id: "about", label: "About Platform", icon: Activity, desc: "Ecosystem Architecture" },
            { id: "contact", label: "Contact & Help", icon: Users, desc: "Hospital Directory" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.role) setActiveRole(item.role as any);
                  setCurrentPage(item.id as any);
                }}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition shadow-2xs group flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center mb-2 transition">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
