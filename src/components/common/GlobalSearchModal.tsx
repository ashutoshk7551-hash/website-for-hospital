import React, { useState, useEffect, useRef } from "react";
import { useApp, PageId } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  Search,
  X,
  Activity,
  User,
  Stethoscope,
  Pill,
  Building2,
  TestTube2,
  Calendar,
  FileText,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Award,
  GitBranch,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  category: "portal" | "service" | "clinical" | "safety" | "info";
  categoryLabel: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  keywords: string[];
  pageId?: PageId;
  targetRole?: UserRole;
  customAction?: () => void;
  badge?: string;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    setCurrentPage,
    setActiveRole,
    setAiModalOpen,
    setAiModalInitialType,
    triggerEmergencyAlert,
    medicines,
    doctors,
    labTests,
  } = useApp();

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "portals" | "services" | "medicines" | "doctors" | "labs">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery("");
      setSelectedFilter("all");
      setSelectedIndex(0);
    }
  }, [searchModalOpen]);

  const allServices: ServiceItem[] = [
    {
      id: "srv-patient-portal",
      title: "Patient Health Portal",
      category: "portal",
      categoryLabel: "User Portal",
      description: "Access your digital medical records, active prescriptions, medication reminders, and vital signs.",
      icon: User,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      keywords: ["patient", "my records", "portal", "profile", "vitals", "reminders", "prescriptions"],
      pageId: "patient-portal",
      targetRole: "patient",
      badge: "Patient Role",
    },
    {
      id: "srv-doctor-portal",
      title: "Doctor Clinical Portal",
      category: "portal",
      categoryLabel: "User Portal",
      description: "Manage patient queues, write digital e-prescriptions, review lab tests, and document clinical consults.",
      icon: Stethoscope,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      keywords: ["doctor", "physician", "clinic", "consultation", "queue", "prescribe", "ehr"],
      pageId: "doctor-portal",
      targetRole: "doctor",
      badge: "Doctor Role",
    },
    {
      id: "srv-pharmacist-portal",
      title: "Pharmacist Dispensary Portal",
      category: "portal",
      categoryLabel: "User Portal",
      description: "Prescription verification queue, automated drug interaction screenings, batch dispensing, and label printing.",
      icon: Pill,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      keywords: ["pharmacist", "pharmacy", "dispense", "verify", "safety", "interaction", "stock"],
      pageId: "pharmacist-portal",
      targetRole: "pharmacist",
      badge: "Pharmacist Role",
    },
    {
      id: "srv-admin-portal",
      title: "Hospital Administrator Dashboard",
      category: "portal",
      categoryLabel: "User Portal",
      description: "Real-time bed occupancy, ICU capacity, staff allocation, patient flow metrics, and hospital throughput.",
      icon: Building2,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      keywords: ["admin", "hospital", "beds", "icu", "ward", "management", "executive", "occupancy", "throughput"],
      pageId: "hospital-dashboard",
      targetRole: "admin",
      badge: "Admin Role",
    },
    {
      id: "srv-lab-portal",
      title: "Laboratory & Diagnostic Pathology",
      category: "portal",
      categoryLabel: "User Portal",
      description: "Sample collection logs, specimen testing workflow, hematology, biochemistry, and critical alerts.",
      icon: TestTube2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      keywords: ["lab", "laboratory", "blood test", "pathology", "specimen", "cbc", "diagnostics"],
      pageId: "lab-mgmt",
      targetRole: "lab_tech",
      badge: "Lab Role",
    },
    {
      id: "srv-medicine-search",
      title: "Medicine & Drug Formulary Search",
      category: "service",
      categoryLabel: "Service",
      description: "Search 100+ hospital medicines, generic equivalents, stock quantities, indications, and pricing.",
      icon: Search,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      keywords: ["medicine", "drug", "tablet", "syrup", "inventory", "stock", "search", "pharmacy", "cost", "price"],
      pageId: "medicine-search",
    },
    {
      id: "srv-appointments",
      title: "Doctor Appointment Booking",
      category: "service",
      categoryLabel: "Service",
      description: "Book OPD visits with Cardiology, Endocrinology, Pediatrics, Neurology, and General Medicine specialists.",
      icon: Calendar,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      keywords: ["appointment", "booking", "schedule", "opd", "doctor visit", "token", "calendar", "consultation"],
      pageId: "appointments",
    },
    {
      id: "srv-digital-rx",
      title: "Digital e-Prescription System",
      category: "clinical",
      categoryLabel: "Clinical Tool",
      description: "Tamper-evident digital prescriptions with QR verification, e-signatures, dosage instructions, and direct dispatch.",
      icon: FileText,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      keywords: ["prescription", "rx", "digital rx", "doctor signature", "electronic prescription", "dosage", "medication"],
      pageId: "digital-prescription",
    },
    {
      id: "srv-doc-pharm-connect",
      title: "Doctor ↔ Pharmacist Real-Time Connect",
      category: "clinical",
      categoryLabel: "Clinical Tool",
      description: "Direct instant communication channel between physicians and pharmacists for medication reviews and clarifications.",
      icon: MessageSquare,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-700",
      keywords: ["chat", "connect", "doctor pharmacist", "communication", "clarification", "message", "collaboration"],
      pageId: "doctor-pharmacist-connect",
    },
    {
      id: "srv-ai-clinical",
      title: "AI Clinical Decision Support (Gemini 3.7)",
      category: "clinical",
      categoryLabel: "AI Intelligence",
      description: "Evidence-based pharmacology intelligence, drug-drug interaction screening, dosage checks, and inventory forecasting.",
      icon: Sparkles,
      iconBg: "bg-gradient-to-r from-blue-500 to-teal-500",
      iconColor: "text-white",
      keywords: ["ai", "gemini", "decision support", "interaction", "drug safety", "intelligence", "screening", "dosage"],
      customAction: () => {
        setAiModalInitialType("interaction");
        setAiModalOpen(true);
      },
      badge: "AI Powered",
    },
    {
      id: "srv-health-records",
      title: "Unified Health Records (EHR)",
      category: "service",
      categoryLabel: "Medical Records",
      description: "Comprehensive patient health profile including historical diagnoses, vitals trends, allergies, and emergency info.",
      icon: FileText,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
      keywords: ["records", "ehr", "emr", "health records", "allergies", "history", "blood pressure", "vitals"],
      pageId: "health-records",
    },
    {
      id: "srv-hospital-flow",
      title: "Hospital Integration Flow & Architecture",
      category: "service",
      categoryLabel: "System Flow",
      description: "Interactive visual mapping of hospital patient pathways from triage and doctor consultation to pharmacy and lab.",
      icon: GitBranch,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      keywords: ["flow", "architecture", "departments", "workflow", "process", "diagram", "triage", "pipeline"],
      pageId: "department-flow",
    },
    {
      id: "srv-analytics",
      title: "Hospital Operational Analytics",
      category: "service",
      categoryLabel: "Analytics",
      description: "Key performance indicators, patient turnaround time, bed capacity utilization, and prescription fulfillment charts.",
      icon: BarChart3,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      keywords: ["analytics", "charts", "metrics", "kpi", "performance", "revenue", "statistics", "reports"],
      pageId: "analytics",
    },
    {
      id: "srv-emergency",
      title: "24/7 Emergency SOS & Resuscitation Center",
      category: "safety",
      categoryLabel: "Emergency",
      description: "Rapid ambulance dispatch, trauma team activation, emergency hotlines, and instant critical broadcast.",
      icon: PhoneCall,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      keywords: ["emergency", "sos", "ambulance", "trauma", "urgent", "resuscitation", "911", "hotline", "critical"],
      pageId: "emergency",
      customAction: () => {
        setCurrentPage("emergency");
        triggerEmergencyAlert();
      },
      badge: "Emergency 24/7",
    },
    {
      id: "srv-security",
      title: "Security, HIPAA & Privacy Audit",
      category: "safety",
      categoryLabel: "Security",
      description: "Role-based access logs, cryptographic verification, patient data protection standards, and compliance status.",
      icon: ShieldCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      keywords: ["security", "hipaa", "privacy", "audit", "compliance", "encryption", "logs", "access"],
      pageId: "security-privacy",
    },
    {
      id: "srv-competition",
      title: "Healthcare Ecosystem Showcase",
      category: "info",
      categoryLabel: "Overview",
      description: "See how People's Hospital connected ecosystem overcomes the barriers of fragmented traditional healthcare.",
      icon: Award,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      keywords: ["competition", "showcase", "demo", "overview", "comparison", "problem", "innovation"],
      pageId: "competition",
    },
  ];

  // Filtered lists
  const queryLower = query.toLowerCase().trim();

  // 1. Filtered Services
  const filteredServices = allServices.filter((s) => {
    if (selectedFilter === "portals" && s.category !== "portal") return false;
    if (selectedFilter === "services" && s.category !== "service" && s.category !== "clinical" && s.category !== "safety") return false;
    if (selectedFilter === "medicines" || selectedFilter === "doctors" || selectedFilter === "labs") return false;

    if (!queryLower) return true;
    return (
      s.title.toLowerCase().includes(queryLower) ||
      s.description.toLowerCase().includes(queryLower) ||
      s.categoryLabel.toLowerCase().includes(queryLower) ||
      s.keywords.some((k) => k.toLowerCase().includes(queryLower))
    );
  });

  // 2. Filtered Medicines
  const filteredMedicines = (selectedFilter === "all" || selectedFilter === "medicines")
    ? medicines.filter((m) => {
        if (!queryLower && selectedFilter !== "medicines") return false;
        if (!queryLower && selectedFilter === "medicines") return true;
        return (
          m.name.toLowerCase().includes(queryLower) ||
          m.genericName.toLowerCase().includes(queryLower) ||
          m.category.toLowerCase().includes(queryLower) ||
          m.indications.toLowerCase().includes(queryLower)
        );
      }).slice(0, 6)
    : [];

  // 3. Filtered Doctors
  const filteredDoctors = (selectedFilter === "all" || selectedFilter === "doctors")
    ? doctors.filter((d) => {
        if (!queryLower && selectedFilter !== "doctors") return false;
        if (!queryLower && selectedFilter === "doctors") return true;
        return (
          d.name.toLowerCase().includes(queryLower) ||
          d.department.toLowerCase().includes(queryLower) ||
          d.specialty.toLowerCase().includes(queryLower)
        );
      }).slice(0, 4)
    : [];

  // 4. Filtered Labs
  const filteredLabs = (selectedFilter === "all" || selectedFilter === "labs")
    ? labTests.filter((l) => {
        if (!queryLower && selectedFilter !== "labs") return false;
        if (!queryLower && selectedFilter === "labs") return true;
        return (
          l.testName.toLowerCase().includes(queryLower) ||
          l.testCode.toLowerCase().includes(queryLower) ||
          l.department.toLowerCase().includes(queryLower)
        );
      }).slice(0, 4)
    : [];

  const totalResultsCount =
    filteredServices.length +
    filteredMedicines.length +
    filteredDoctors.length +
    filteredLabs.length;

  const handleSelectService = (service: ServiceItem) => {
    setSearchModalOpen(false);
    if (service.customAction) {
      service.customAction();
      return;
    }
    if (service.targetRole) {
      setActiveRole(service.targetRole);
    }
    if (service.pageId) {
      setCurrentPage(service.pageId);
    }
  };

  const handleSelectMedicine = (medName: string) => {
    setSearchModalOpen(false);
    setCurrentPage("medicine-search");
  };

  const handleSelectDoctor = () => {
    setSearchModalOpen(false);
    setCurrentPage("appointments");
  };

  const handleSelectLab = () => {
    setActiveRole("lab_tech");
    setCurrentPage("lab-mgmt");
    setSearchModalOpen(false);
  };

  if (!searchModalOpen) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 sm:pt-16 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSearchModalOpen(false);
        }
      }}
    >
      <div
        id="global-search-dialog"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
      >
        {/* Header Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, portals, doctors, medicines, lab tests..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
            />
          </div>

          {query && (
            <button
              id="clear-search-query-btn"
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-200/80 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-300">
            <span>ESC</span>
          </div>

          <button
            id="close-search-modal-btn"
            onClick={() => setSearchModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Category Pills */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedFilter === "all"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Services ({allServices.length})
          </button>
          <button
            onClick={() => setSelectedFilter("portals")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedFilter === "portals"
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Role Portals (5)
          </button>
          <button
            onClick={() => setSelectedFilter("services")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedFilter === "services"
                ? "bg-teal-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Clinical Services
          </button>
          <button
            onClick={() => setSelectedFilter("medicines")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedFilter === "medicines"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Medicines ({medicines.length})
          </button>
          <button
            onClick={() => setSelectedFilter("doctors")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedFilter === "doctors"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Specialists ({doctors.length})
          </button>
          <button
            onClick={() => setSelectedFilter("labs")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedFilter === "labs"
                ? "bg-purple-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Lab Tests
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 max-h-[60vh]"
        >
          {/* Empty Query Suggestion Chips */}
          {!query && selectedFilter === "all" && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Shortcuts & Popular Actions
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCurrentPage("appointments");
                    setSearchModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-200/60 transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("medicine-search");
                    setSearchModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-teal-200/60 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Medicine Formulary</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("digital-prescription");
                    setSearchModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-amber-200/60 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Digital e-Prescriptions</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("doctor-pharmacist-connect");
                    setSearchModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-cyan-200/60 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Doctor ↔ Pharmacist Chat</span>
                </button>
                <button
                  onClick={() => {
                    setAiModalInitialType("interaction");
                    setAiModalOpen(true);
                    setSearchModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-purple-200/60 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Clinical Support</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("emergency");
                    triggerEmergencyAlert();
                    setSearchModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-red-200/60 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                  <span>Emergency SOS</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Services & Portals */}
          {filteredServices.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Hospital Services & Portals</span>
                <span className="text-slate-400 font-normal">{filteredServices.length} found</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.id}
                      id={service.id}
                      onClick={() => handleSelectService(service)}
                      className="p-3 bg-white hover:bg-blue-50/40 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-sm cursor-pointer transition flex items-start gap-3 group"
                    >
                      <div className={`w-9 h-9 rounded-xl ${service.iconBg} ${service.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                            {service.title}
                          </h4>
                          {service.badge && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                              {service.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Open Service</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Medicines & Formulary */}
          {filteredMedicines.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Pharmacy Medicines & Formularies</span>
                <button
                  onClick={() => {
                    setCurrentPage("medicine-search");
                    setSearchModalOpen(false);
                  }}
                  className="text-teal-600 hover:underline text-[11px] font-semibold"
                >
                  View full catalog →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredMedicines.map((med) => (
                  <div
                    key={med.id}
                    id={`search-med-${med.id}`}
                    onClick={() => handleSelectMedicine(med.name)}
                    className="p-3 bg-white hover:bg-teal-50/40 rounded-xl border border-slate-200 hover:border-teal-300 shadow-2xs cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition truncate">
                          {med.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {med.genericName} • {med.strength} ({med.dosageForm})
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900">${med.unitPrice.toFixed(2)}</div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        med.stockQuantity > 100
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : med.stockQuantity > 0
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {med.stockQuantity} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Doctors & Specialists */}
          {filteredDoctors.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Hospital Physicians & Specialists</span>
                <button
                  onClick={() => {
                    setCurrentPage("appointments");
                    setSearchModalOpen(false);
                  }}
                  className="text-blue-600 hover:underline text-[11px] font-semibold"
                >
                  Book Appointment →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    id={`search-doc-${doc.id}`}
                    onClick={handleSelectDoctor}
                    className="p-3 bg-white hover:bg-blue-50/40 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {doc.department} • {doc.specialty}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                        {doc.experienceYears} yrs exp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Laboratory Tests */}
          {filteredLabs.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Diagnostic Pathology Tests</span>
                <button
                  onClick={handleSelectLab}
                  className="text-purple-600 hover:underline text-[11px] font-semibold"
                >
                  Open Lab Workstation →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredLabs.map((lab) => (
                  <div
                    key={lab.id}
                    id={`search-lab-${lab.id}`}
                    onClick={handleSelectLab}
                    className="p-3 bg-white hover:bg-purple-50/40 rounded-xl border border-slate-200 hover:border-purple-300 shadow-2xs cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <TestTube2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition truncate">
                          {lab.testName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Code: {lab.testCode} • {lab.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                        {lab.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zero Results State */}
          {totalResultsCount === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No matching hospital services found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find anything matching "<span className="font-semibold text-slate-700">{query}</span>". Try searching for terms like "appointment", "prescription", "paracetamol", or "cardiology".
              </p>
              <button
                onClick={() => setQuery("")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-4 sm:px-5 gap-2">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 font-bold text-[10px]">ESC</kbd> to close</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Use shortcut <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 font-bold text-[10px]">Ctrl+K</kbd> anywhere</span>
          </div>

          <div className="flex items-center gap-1.5 text-teal-700 font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>People's Hospital Service Directory</span>
          </div>
        </div>
      </div>
    </div>
  );
};
