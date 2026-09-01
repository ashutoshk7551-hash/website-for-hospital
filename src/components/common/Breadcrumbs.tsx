import React from "react";
import { useApp, PageId } from "../../context/AppContext";
import {
  ChevronRight,
  Home,
  ArrowLeft,
  Activity,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Building2,
  TestTube2,
  FileText,
  Search,
  MessageSquare,
  BarChart3,
  HeartPulse,
  Shield,
  Award,
  GitBranch,
  PhoneCall,
  HardDrive,
  Mail,
  Info,
  Users,
  Sparkles,
  Table,
  Presentation,
  CheckSquare,
  ClipboardList,
  StickyNote,
} from "lucide-react";

interface PageMeta {
  title: string;
  category?: string;
  categoryPage?: PageId;
  icon: any;
}

const PAGE_METADATA: Record<PageId, PageMeta> = {
  home: {
    title: "Home",
    icon: Home,
  },
  about: {
    title: "About Us & Architecture",
    category: "Information",
    categoryPage: "about",
    icon: Info,
  },
  contact: {
    title: "Contact & Support",
    category: "Information",
    categoryPage: "contact",
    icon: PhoneCall,
  },
  "patient-portal": {
    title: "Patient Health Portal",
    category: "Stakeholder Portals",
    categoryPage: "patient-portal",
    icon: User,
  },
  "patient-list": {
    title: "Patient Registry & Directory",
    category: "Clinical Data",
    categoryPage: "patient-list",
    icon: Users,
  },
  "doctor-portal": {
    title: "Doctor Clinical Workstation",
    category: "Stakeholder Portals",
    categoryPage: "doctor-portal",
    icon: Stethoscope,
  },
  "pharmacist-portal": {
    title: "Pharmacist Dispensing Hub",
    category: "Stakeholder Portals",
    categoryPage: "pharmacist-portal",
    icon: Pill,
  },
  "hospital-dashboard": {
    title: "Hospital Operations & Analytics",
    category: "Stakeholder Portals",
    categoryPage: "hospital-dashboard",
    icon: Building2,
  },
  admin: {
    title: "Staff Admin Portal (/admin)",
    category: "Administration",
    categoryPage: "admin",
    icon: Shield,
  },
  "google-drive-vault": {
    title: "Google Drive Cloud Vault",
    category: "Cloud Integrations",
    categoryPage: "google-drive-vault",
    icon: HardDrive,
  },
  "gmail-hub": {
    title: "Gmail Clinical Hub",
    category: "Cloud Integrations",
    categoryPage: "gmail-hub",
    icon: Mail,
  },
  "google-docs": {
    title: "Google Docs Clinical Hub",
    category: "Cloud Integrations",
    categoryPage: "google-docs",
    icon: FileText,
  },
  "workspace-suite": {
    title: "Google Workspace Clinical Suite",
    category: "Cloud Integrations",
    categoryPage: "workspace-suite",
    icon: Sparkles,
  },
  "google-sheets": {
    title: "Google Sheets Patient Registry",
    category: "Cloud Integrations",
    categoryPage: "google-sheets",
    icon: Table,
  },
  "google-calendar": {
    title: "Google Calendar Clinical Schedule",
    category: "Cloud Integrations",
    categoryPage: "google-calendar",
    icon: Calendar,
  },
  "google-slides": {
    title: "Google Slides Case Studies",
    category: "Cloud Integrations",
    categoryPage: "google-slides",
    icon: Presentation,
  },
  "google-tasks": {
    title: "Google Tasks Care Tracker",
    category: "Cloud Integrations",
    categoryPage: "google-tasks",
    icon: CheckSquare,
  },
  "google-chat": {
    title: "Google Chat Care Channel",
    category: "Cloud Integrations",
    categoryPage: "google-chat",
    icon: MessageSquare,
  },
  "google-forms": {
    title: "Google Forms Intake Surveys",
    category: "Cloud Integrations",
    categoryPage: "google-forms",
    icon: ClipboardList,
  },
  "google-keep": {
    title: "Google Keep Bedside Notes",
    category: "Cloud Integrations",
    categoryPage: "google-keep",
    icon: StickyNote,
  },
  "pharmacy-mgmt": {
    title: "Pharmacy Inventory & Batch Management",
    category: "Clinical Services",
    categoryPage: "pharmacy-mgmt",
    icon: Pill,
  },
  "lab-mgmt": {
    title: "Laboratory Diagnostic Reports",
    category: "Clinical Services",
    categoryPage: "lab-mgmt",
    icon: TestTube2,
  },
  appointments: {
    title: "Book & Manage Appointments",
    category: "Patient Services",
    categoryPage: "appointments",
    icon: Calendar,
  },
  "digital-prescription": {
    title: "Digital e-Prescriptions (Rx)",
    category: "Clinical Services",
    categoryPage: "digital-prescription",
    icon: FileText,
  },
  "medicine-search": {
    title: "Hospital Formulary & Medicine Catalog",
    category: "Clinical Services",
    categoryPage: "medicine-search",
    icon: Search,
  },
  "doctor-pharmacist-connect": {
    title: "Doctor ↔ Pharmacist Real-Time Connect",
    category: "Clinical Collaboration",
    categoryPage: "doctor-pharmacist-connect",
    icon: MessageSquare,
  },
  "health-records": {
    title: "Longitudinal EHR & Lab Records",
    category: "Patient Records",
    categoryPage: "health-records",
    icon: Activity,
  },
  analytics: {
    title: "Hospital Intelligence & OPD Analytics",
    category: "Administration",
    categoryPage: "analytics",
    icon: BarChart3,
  },
  emergency: {
    title: "Emergency Triage & SOS Dispatch",
    category: "Critical Care",
    categoryPage: "emergency",
    icon: HeartPulse,
  },
  "security-privacy": {
    title: "Security, Privacy & Audit Logs",
    category: "Compliance",
    categoryPage: "security-privacy",
    icon: Shield,
  },
  competition: {
    title: "Innovation Showcase & Problem Matrix",
    category: "System Overview",
    categoryPage: "competition",
    icon: Award,
  },
  "department-flow": {
    title: "Hospital Department Flow Engine",
    category: "System Overview",
    categoryPage: "department-flow",
    icon: GitBranch,
  },
};

export const Breadcrumbs: React.FC = () => {
  const { currentPage, setCurrentPage, goBack, canGoBack, navigationHistory } = useApp();

  // Do not show breadcrumb bar on the home landing page
  if (currentPage === "home") {
    return null;
  }

  const currentMeta = PAGE_METADATA[currentPage] || {
    title: currentPage.replace(/-/g, " "),
    icon: Activity,
  };

  const CurrentIcon = currentMeta.icon;
  const previousPageId =
    navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : "home";
  const previousMeta = PAGE_METADATA[previousPageId] || { title: "Previous View" };

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      className="w-full bg-white border-b border-slate-200/90 py-2.5 px-3 sm:px-6 lg:px-8 shadow-2xs transition-all animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Back Button & Trail */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Quick Back Button */}
          <button
            id="global-breadcrumb-back-btn"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 text-xs font-semibold border border-slate-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
            title={`Go back to ${previousMeta.title}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden xs:block" />

          {/* Breadcrumb Hierarchy */}
          <ol className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            {/* Level 1: Home */}
            <li className="inline-flex items-center">
              <button
                id="breadcrumb-home-link"
                onClick={() => setCurrentPage("home")}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-700 font-medium transition cursor-pointer hover:underline underline-offset-2"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Home</span>
              </button>
            </li>

            {/* Level 2: Optional Category */}
            {currentMeta.category && (
              <>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </li>
                <li>
                  <span className="text-slate-400 font-medium hidden sm:inline">
                    {currentMeta.category}
                  </span>
                </li>
              </>
            )}

            {/* Level 3: Current Page */}
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            </li>
            <li className="flex items-center gap-1.5 font-semibold text-slate-900 bg-slate-100/90 text-teal-900 px-2.5 py-1 rounded-md border border-slate-200/60">
              <CurrentIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[320px] md:max-w-none">
                {currentMeta.title}
              </span>
            </li>
          </ol>
        </div>

        {/* Right: Quick Action Return to Home */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage("home")}
            className="text-[11px] font-medium text-slate-500 hover:text-teal-700 transition flex items-center gap-1 bg-slate-50 hover:bg-teal-50/60 px-2.5 py-1 rounded-md border border-slate-200/60"
            title="Return to Main Landing Dashboard"
          >
            <Activity className="w-3 h-3 text-teal-600" />
            <span className="hidden sm:inline">Return to Main Dashboard</span>
            <span className="sm:hidden">Home</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
