export type PageId =
  | "home"
  | "about"
  | "patient-portal"
  | "patient-list"
  | "doctor-portal"
  | "pharmacist-portal"
  | "hospital-dashboard"
  | "admin"
  | "workspace-suite"
  | "google-drive-vault"
  | "gmail-hub"
  | "google-docs"
  | "google-sheets"
  | "google-calendar"
  | "google-slides"
  | "google-tasks"
  | "google-chat"
  | "google-forms"
  | "google-keep"
  | "pharmacy-mgmt"
  | "lab-mgmt"
  | "appointments"
  | "digital-prescription"
  | "medicine-search"
  | "doctor-pharmacist-connect"
  | "health-records"
  | "analytics"
  | "emergency"
  | "security-privacy"
  | "competition"
  | "department-flow"
  | "contact";

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  ABOUT: "/about",
  CONTACT: "/contact",
  APPOINTMENTS: "/appointments",
  APPOINTMENT_DETAIL: "/appointments/:id",
  PATIENT_PORTAL: "/patient-portal",
  PATIENT_DASHBOARD: "/patient-dashboard",
  PATIENT_LIST: "/patients",
  PATIENT_DETAIL: "/patients/:id",
  PROFILE_DETAIL: "/profile/:id",
  DOCTOR_PORTAL: "/doctor-portal",
  DOCTOR_DASHBOARD: "/doctor",
  PHARMACIST_PORTAL: "/pharmacist-portal",
  PHARMACIST_DASHBOARD: "/pharmacist",
  HOSPITAL_DASHBOARD: "/hospital-dashboard",
  ADMIN: "/admin",
  ADMIN_PORTAL: "/admin-portal",
  WORKSPACE_SUITE: "/workspace-suite",
  WORKSPACE: "/workspace",
  GOOGLE_DRIVE_VAULT: "/google-drive-vault",
  DRIVE: "/drive",
  GMAIL_HUB: "/gmail-hub",
  GMAIL: "/gmail",
  GOOGLE_DOCS: "/google-docs",
  DOCS: "/docs",
  GOOGLE_SHEETS: "/google-sheets",
  SHEETS: "/sheets",
  GOOGLE_CALENDAR: "/google-calendar",
  CALENDAR: "/calendar",
  GOOGLE_SLIDES: "/google-slides",
  SLIDES: "/slides",
  GOOGLE_TASKS: "/google-tasks",
  TASKS: "/tasks",
  GOOGLE_CHAT: "/google-chat",
  CHAT: "/chat",
  GOOGLE_FORMS: "/google-forms",
  FORMS: "/forms",
  GOOGLE_KEEP: "/google-keep",
  KEEP: "/keep",
  PHARMACY_MGMT: "/pharmacy-mgmt",
  PHARMACY: "/pharmacy",
  LAB_MGMT: "/lab-mgmt",
  LABORATORY: "/laboratory",
  DIGITAL_PRESCRIPTION: "/digital-prescription",
  PRESCRIPTIONS: "/prescriptions",
  MEDICINE_SEARCH: "/medicine-search",
  MEDICINES: "/medicines",
  MEDICINE_DETAIL: "/medicines/:id",
  DOCTOR_PHARMACIST_CONNECT: "/doctor-pharmacist-connect",
  HEALTH_RECORDS: "/health-records",
  RECORDS: "/records",
  RECORD_DETAIL: "/records/:id",
  ANALYTICS: "/analytics",
  EMERGENCY: "/emergency",
  SECURITY_PRIVACY: "/security-privacy",
  COMPETITION: "/competition",
  DEPARTMENT_FLOW: "/department-flow",
} as const;

/**
 * Converts a PageId to standard URL route pathname
 */
export function pageToPath(page: PageId): string {
  switch (page) {
    case "home":
      return "/";
    case "about":
      return "/about";
    case "contact":
      return "/contact";
    case "patient-portal":
      return "/patient-portal";
    case "patient-list":
      return "/patients";
    case "doctor-portal":
      return "/doctor-portal";
    case "pharmacist-portal":
      return "/pharmacist-portal";
    case "hospital-dashboard":
      return "/hospital-dashboard";
    case "admin":
      return "/admin";
    case "workspace-suite":
      return "/workspace-suite";
    case "google-drive-vault":
      return "/google-drive-vault";
    case "gmail-hub":
      return "/gmail-hub";
    case "google-docs":
      return "/google-docs";
    case "google-sheets":
      return "/google-sheets";
    case "google-calendar":
      return "/google-calendar";
    case "google-slides":
      return "/google-slides";
    case "google-tasks":
      return "/google-tasks";
    case "google-chat":
      return "/google-chat";
    case "google-forms":
      return "/google-forms";
    case "google-keep":
      return "/google-keep";
    case "pharmacy-mgmt":
      return "/pharmacy-mgmt";
    case "lab-mgmt":
      return "/lab-mgmt";
    case "appointments":
      return "/appointments";
    case "digital-prescription":
      return "/digital-prescription";
    case "medicine-search":
      return "/medicine-search";
    case "doctor-pharmacist-connect":
      return "/doctor-pharmacist-connect";
    case "health-records":
      return "/health-records";
    case "analytics":
      return "/analytics";
    case "emergency":
      return "/emergency";
    case "security-privacy":
      return "/security-privacy";
    case "competition":
      return "/competition";
    case "department-flow":
      return "/department-flow";
    default:
      return "/";
  }
}

/**
 * Converts a URL route pathname to PageId
 */
export function pathToPage(pathname: string): PageId {
  const clean = pathname.toLowerCase().replace(/\/$/, "");
  if (!clean || clean === "" || clean === "/home" || clean === "/dashboard") {
    return "home";
  }
  if (clean === "/about") return "about";
  if (clean === "/contact") return "contact";
  if (clean === "/patients" || clean === "/patient-list") return "patient-list";
  if (clean === "/patient-portal" || clean === "/patient-dashboard" || clean.startsWith("/patients/") || clean.startsWith("/profile/")) {
    return "patient-portal";
  }
  if (clean === "/doctor-portal" || clean === "/doctor") return "doctor-portal";
  if (clean === "/pharmacist-portal" || clean === "/pharmacist") return "pharmacist-portal";
  if (clean === "/hospital-dashboard") return "hospital-dashboard";
  if (clean === "/admin" || clean === "/admin-portal") return "admin";
  if (clean === "/workspace-suite" || clean === "/workspace") return "workspace-suite";
  if (clean === "/google-drive-vault" || clean === "/drive") return "google-drive-vault";
  if (clean === "/gmail-hub" || clean === "/gmail") return "gmail-hub";
  if (clean === "/google-docs" || clean === "/docs") return "google-docs";
  if (clean === "/google-sheets" || clean === "/sheets") return "google-sheets";
  if (clean === "/google-calendar" || clean === "/calendar") return "google-calendar";
  if (clean === "/google-slides" || clean === "/slides") return "google-slides";
  if (clean === "/google-tasks" || clean === "/tasks") return "google-tasks";
  if (clean === "/google-chat" || clean === "/chat") return "google-chat";
  if (clean === "/google-forms" || clean === "/forms") return "google-forms";
  if (clean === "/google-keep" || clean === "/keep") return "google-keep";
  if (clean === "/pharmacy-mgmt" || clean === "/pharmacy") return "pharmacy-mgmt";
  if (clean === "/lab-mgmt" || clean === "/laboratory") return "lab-mgmt";
  if (clean === "/appointments" || clean.startsWith("/appointments/")) return "appointments";
  if (clean === "/digital-prescription" || clean === "/prescriptions") return "digital-prescription";
  if (clean === "/medicine-search" || clean === "/medicines" || clean.startsWith("/medicines/") || clean.startsWith("/medicine/")) {
    return "medicine-search";
  }
  if (clean === "/doctor-pharmacist-connect") return "doctor-pharmacist-connect";
  if (clean === "/health-records" || clean === "/records" || clean.startsWith("/records/") || clean.startsWith("/record/")) {
    return "health-records";
  }
  if (clean === "/analytics") return "analytics";
  if (clean === "/emergency") return "emergency";
  if (clean === "/security-privacy") return "security-privacy";
  if (clean === "/competition") return "competition";
  if (clean === "/department-flow") return "department-flow";

  return "home";
}
