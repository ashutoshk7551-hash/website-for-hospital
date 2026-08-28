import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserRole,
  Patient,
  Doctor,
  Appointment,
  Prescription,
  MedicineItem,
  LabTest,
  ChatMessage,
  MedicationReminder,
  HospitalStats,
  SecurityAuditLog,
  NotificationItem,
  AppointmentReminderLog,
  ReminderPreferences,
  StaffMember,
} from "../types";
import {
  initialPatients,
  initialDoctors,
  initialMedicines,
  initialPrescriptions,
  initialAppointments,
  initialLabTests,
  initialChatMessages,
  initialReminders,
  initialHospitalStats,
  initialAuditLogs,
  initialNotifications,
  initialStaffMembers,
} from "../data/mockData";

export type PageId =
  | "home"
  | "about"
  | "patient-portal"
  | "doctor-portal"
  | "pharmacist-portal"
  | "hospital-dashboard"
  | "admin"
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

export interface AppContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  patients: Patient[];
  doctors: Doctor[];
  medicines: MedicineItem[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  labTests: LabTest[];
  chatMessages: ChatMessage[];
  reminders: MedicationReminder[];
  hospitalStats: HospitalStats;
  auditLogs: SecurityAuditLog[];
  notifications: NotificationItem[];
  
  // Automated 1-Day Appointment Reminders & SMS Engine
  reminderLogs: AppointmentReminderLog[];
  reminderPreferences: ReminderPreferences;
  activeSmsPreview: AppointmentReminderLog | null;
  setActiveSmsPreview: (log: AppointmentReminderLog | null) => void;
  sendAppointmentReminder: (
    appointmentId: string,
    options?: {
      force?: boolean;
      channels?: ("sms" | "in-app")[];
      customPhone?: string;
      triggerType?: "automated_1_day" | "manual_dispatch" | "instant_preview";
    }
  ) => AppointmentReminderLog | null;
  runAutomatedReminderScan: (options?: { forceAllTomorrow?: boolean }) => {
    sentCount: number;
    scannedCount: number;
    logs: AppointmentReminderLog[];
  };
  updateReminderPreferences: (prefs: Partial<ReminderPreferences>) => void;
  confirmAppointmentViaSms: (reminderLogId: string) => void;
  lastReminderScan: { lastRun: string; sentCount: number; scannedCount: number } | null;
  
  // Patient Authentication & Profile Management
  currentPatientId: string | null;
  currentPatient: Patient | null;
  setCurrentPatientId: (id: string | null) => void;
  registerPatient: (patientData: Omit<Patient, "id">) => Patient;
  loginPatient: (patientIdOrEmail: string) => boolean;
  logoutPatient: () => void;
  patientAuthModalOpen: boolean;
  setPatientAuthModalOpen: (open: boolean) => void;
  patientAuthMode: "signin" | "register";
  setPatientAuthMode: (mode: "signin" | "register") => void;
  openPatientAuth: (mode?: "signin" | "register") => void;
  
  // Staff & Role Authentication Management
  staffMembers: StaffMember[];
  currentStaffId: string | null;
  currentStaff: StaffMember | null;
  staffAuthModalOpen: boolean;
  setStaffAuthModalOpen: (open: boolean) => void;
  staffAuthRole: UserRole;
  setStaffAuthRole: (role: UserRole) => void;
  openStaffAuth: (role?: UserRole) => void;
  loginStaff: (staffIdOrEmail: string, role?: UserRole) => boolean;
  logoutStaff: () => void;
  
  // Actions
  addPrescription: (prescription: Omit<Prescription, "id" | "prescriptionNumber" | "date" | "status">) => Prescription;
  updatePrescriptionStatus: (id: string, status: Prescription["status"], pharmacistNotes?: string) => void;
  bookAppointment: (apt: Omit<Appointment, "id" | "tokenNumber" | "status">) => Appointment;
  updateMedicineStock: (id: string, changeQty: number) => void;
  restockMedicine: (id: string, addedQty: number) => void;
  sendChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp" | "status">) => void;
  toggleReminder: (id: string) => void;
  updateLabTestStatus: (id: string, status: LabTest["status"], results?: LabTest["results"]) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Modals & UI helpers
  hipaaModalOpen: boolean;
  setHipaaModalOpen: (open: boolean) => void;
  inquiryModalOpen: boolean;
  setInquiryModalOpen: (open: boolean) => void;
  inquiryModalType: "general_inquiry" | "patient_intake" | "emergency_triage";
  setInquiryModalType: (type: "general_inquiry" | "patient_intake" | "emergency_triage") => void;
  openInquiryModal: (type?: "general_inquiry" | "patient_intake" | "emergency_triage") => void;
  aiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
  aiModalInitialType?: "interaction" | "medicine_info" | "prescription_audit" | "stock_forecast";
  setAiModalInitialType: (type?: "interaction" | "medicine_info" | "prescription_audit" | "stock_forecast") => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  triggerEmergencyAlert: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>("patient");
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === "/admin" || path.startsWith("/admin") || hash === "#admin") {
        return "admin";
      }
    }
    return "home";
  });

  const [hipaaModalOpen, setHipaaModalOpen] = useState<boolean>(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [inquiryModalType, setInquiryModalType] = useState<"general_inquiry" | "patient_intake" | "emergency_triage">("general_inquiry");

  const openInquiryModal = (type: "general_inquiry" | "patient_intake" | "emergency_triage" = "general_inquiry") => {
    setInquiryModalType(type);
    setInquiryModalOpen(true);
  };
  
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("pharmacare_patients");
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [currentPatientId, setCurrentPatientId] = useState<string | null>(() => {
    const saved = localStorage.getItem("pharmacare_current_patient_id");
    return saved !== null ? saved : initialPatients[0]?.id || "PAT-1082";
  });

  const [patientAuthModalOpen, setPatientAuthModalOpen] = useState<boolean>(false);
  const [patientAuthMode, setPatientAuthMode] = useState<"signin" | "register">("register");

  const openPatientAuth = (mode: "signin" | "register" = "register") => {
    setPatientAuthMode(mode);
    setPatientAuthModalOpen(true);
  };

  const currentPatient = patients.find((p) => p.id === currentPatientId) || patients[0] || null;

  // Staff Authentication State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem("pharmacare_staff_members");
    return saved ? JSON.parse(saved) : initialStaffMembers;
  });

  const [currentStaffId, setCurrentStaffId] = useState<string | null>(() => {
    const saved = localStorage.getItem("pharmacare_current_staff_id");
    return saved !== null ? saved : "DOC-201";
  });

  const [staffAuthModalOpen, setStaffAuthModalOpen] = useState<boolean>(false);
  const [staffAuthRole, setStaffAuthRole] = useState<UserRole>("doctor");

  const openStaffAuth = (role: UserRole = "doctor") => {
    setStaffAuthRole(role);
    setStaffAuthModalOpen(true);
  };

  const currentStaff = staffMembers.find((s) => s.id === currentStaffId) || staffMembers[0] || null;

  const [doctors] = useState<Doctor[]>(initialDoctors);

  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    const saved = localStorage.getItem("pharmacare_medicines");
    return saved ? JSON.parse(saved) : initialMedicines;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem("pharmacare_prescriptions");
    return saved ? JSON.parse(saved) : initialPrescriptions;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("pharmacare_appointments");
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [labTests, setLabTests] = useState<LabTest[]>(() => {
    const saved = localStorage.getItem("pharmacare_lab_tests");
    return saved ? JSON.parse(saved) : initialLabTests;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("pharmacare_chat");
    return saved ? JSON.parse(saved) : initialChatMessages;
  });

  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    const saved = localStorage.getItem("pharmacare_reminders");
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [hospitalStats, setHospitalStats] = useState<HospitalStats>(initialHospitalStats);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Automated 1-Day Appointment Reminder System States
  const [reminderLogs, setReminderLogs] = useState<AppointmentReminderLog[]>(() => {
    const saved = localStorage.getItem("pharmacare_reminder_logs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "REM-LOG-101",
        appointmentId: "APT-501",
        patientId: "PAT-1082",
        patientName: "Eleanor Vance",
        patientPhone: "+1 (555) 234-5678",
        doctorName: "Dr. Sarah Chen, MD",
        department: "Cardiology",
        appointmentDate: "2026-08-28",
        appointmentTime: "10:30 AM",
        roomNumber: "OPD Room 204",
        tokenNumber: "C-14",
        triggerType: "automated_1_day",
        channels: ["sms", "in-app"],
        smsStatus: "Delivered",
        smsMessage: "🏥 People's Hospital Reminder: Dear Eleanor Vance, your Cardiology appointment with Dr. Sarah Chen, MD is scheduled for tomorrow, Aug 28 at 10:30 AM in OPD Room 204 (Token: C-14). Please arrive 10 min early. Reply 1 to Confirm or call (555) 019-2831.",
        timestamp: "2026-08-27 08:00 AM",
        sentAt: "Today, 08:00 AM (24h prior)",
        daysUntilAppointment: 1,
        patientConfirmed: true,
      },
    ];
  });

  const [reminderPreferences, setReminderPreferences] = useState<ReminderPreferences>(() => {
    const saved = localStorage.getItem("pharmacare_reminder_prefs");
    return saved
      ? JSON.parse(saved)
      : {
          automatedSmsEnabled: true,
          automatedInAppEnabled: true,
          reminderWindowDays: 1,
          simulateSmsPopups: true,
          smsSenderId: "PEOPLES-HOSP",
          smsTemplate:
            "🏥 People's Hospital Reminder: Dear {patientName}, your appointment with {doctorName} ({department}) is scheduled for tomorrow, {date} at {time} in {roomNumber} (Token: {tokenNumber}). Please arrive 10 min early. Reply 1 to Confirm or call (555) 019-2831.",
        };
  });

  const [activeSmsPreview, setActiveSmsPreview] = useState<AppointmentReminderLog | null>(null);
  const [lastReminderScan, setLastReminderScan] = useState<{
    lastRun: string;
    sentCount: number;
    scannedCount: number;
  } | null>({
    lastRun: "Today, 08:00 AM",
    sentCount: 1,
    scannedCount: 3,
  });

  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiModalInitialType, setAiModalInitialType] = useState<"interaction" | "medicine_info" | "prescription_audit" | "stock_forecast" | undefined>(undefined);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global keyboard shortcut (Cmd+K or Ctrl+K) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("pharmacare_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    if (currentPatientId) {
      localStorage.setItem("pharmacare_current_patient_id", currentPatientId);
    } else {
      localStorage.removeItem("pharmacare_current_patient_id");
    }
  }, [currentPatientId]);

  useEffect(() => {
    localStorage.setItem("pharmacare_prescriptions", JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem("pharmacare_appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("pharmacare_medicines", JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem("pharmacare_chat", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("pharmacare_reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("pharmacare_lab_tests", JSON.stringify(labTests));
  }, [labTests]);

  useEffect(() => {
    localStorage.setItem("pharmacare_reminder_logs", JSON.stringify(reminderLogs));
  }, [reminderLogs]);

  useEffect(() => {
    localStorage.setItem("pharmacare_reminder_prefs", JSON.stringify(reminderPreferences));
  }, [reminderPreferences]);

  useEffect(() => {
    localStorage.setItem("pharmacare_staff_members", JSON.stringify(staffMembers));
  }, [staffMembers]);

  useEffect(() => {
    if (currentStaffId) {
      localStorage.setItem("pharmacare_current_staff_id", currentStaffId);
    } else {
      localStorage.removeItem("pharmacare_current_staff_id");
    }
  }, [currentStaffId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const registerPatient = (patientData: Omit<Patient, "id">): Patient => {
    // Generate clean unique ID format like PAT-2026-XXXX or PAT-108X
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `PAT-2026-${randomSuffix}`;

    const newPatient: Patient = {
      ...patientData,
      id: newId,
    };

    setPatients((prev) => [newPatient, ...prev]);
    setCurrentPatientId(newId);
    setActiveRole("patient");

    // Add welcoming notification
    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "🎉 Registration Successful! Welcome to People's Hospital",
      message: `Your Official Patient ID is ${newId}. You can now book doctor consultations, manage prescriptions, and review digital health vitals.`,
      type: "reminder",
      timestamp: "Just now",
      isRead: false,
      targetRole: "patient",
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    // Security audit log
    const regLog: SecurityAuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      userId: newId,
      userRole: "patient",
      action: "PATIENT_SELF_REGISTRATION",
      targetResource: `EHR_RECORD_${newId}`,
      ipAddress: "192.168.1.18 [Patient Portal Portal Client]",
      status: "SUCCESS",
    };
    setAuditLogs((prev) => [regLog, ...prev]);

    showToast(`Welcome, ${newPatient.name}! Your Patient ID is ${newId}`);
    return newPatient;
  };

  const loginPatient = (patientIdOrEmail: string): boolean => {
    const query = patientIdOrEmail.trim().toLowerCase();
    if (!query) return false;

    const matched = patients.find(
      (p) =>
        p.id.toLowerCase() === query ||
        p.email.toLowerCase() === query ||
        p.name.toLowerCase() === query ||
        p.phone.includes(query)
    );

    if (matched) {
      setCurrentPatientId(matched.id);
      setActiveRole("patient");
      showToast(`Welcome back, ${matched.name}! Switched to Patient ID ${matched.id}`);
      return true;
    } else {
      showToast("No patient record found with that ID or Email. Please sign up.");
      return false;
    }
  };

  const logoutPatient = () => {
    setCurrentPatientId(null);
    showToast("Signed out of patient profile.");
  };

  const loginStaff = (staffIdOrEmail: string, role?: UserRole): boolean => {
    const query = staffIdOrEmail.trim().toLowerCase();
    if (!query) return false;

    const matched = staffMembers.find((s) => {
      const matchesQuery =
        s.id.toLowerCase() === query ||
        s.email.toLowerCase() === query ||
        s.name.toLowerCase().includes(query) ||
        (s.licenseNumber && s.licenseNumber.toLowerCase() === query);
      return role ? matchesQuery && s.role === role : matchesQuery;
    });

    if (matched) {
      setCurrentStaffId(matched.id);
      setActiveRole(matched.role);

      // Route to respective portal page
      const pageMap: Record<UserRole, PageId> = {
        doctor: "doctor-portal",
        pharmacist: "pharmacist-portal",
        admin: "hospital-dashboard",
        lab_tech: "lab-mgmt",
        patient: "patient-portal",
      };
      setCurrentPage(pageMap[matched.role]);

      // Audit log entry
      const loginLog: SecurityAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString(),
        userId: matched.id,
        userRole: matched.role,
        action: "STAFF_AUTHENTICATION_SUCCESS",
        targetResource: `${matched.role.toUpperCase()}_WORKSPACE`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 50) + 100} [Staff Workstation]`,
        status: "SUCCESS",
      };
      setAuditLogs((prev) => [loginLog, ...prev]);

      showToast(`Authenticated as ${matched.name} (${matched.designation})`);
      return true;
    } else {
      showToast("Invalid Staff ID, License Number, or Credentials. Please verify.");
      return false;
    }
  };

  const logoutStaff = () => {
    setCurrentStaffId(null);
    showToast("Logged out of staff terminal.");
  };

  const addPrescription = (
    rxData: Omit<Prescription, "id" | "prescriptionNumber" | "date" | "status">
  ): Prescription => {
    const nextNum = 9042 + prescriptions.length;
    const newRx: Prescription = {
      ...rxData,
      id: `RX-${nextNum}`,
      prescriptionNumber: `RX-2026-${nextNum}`,
      date: new Date().toISOString().split("T")[0],
      status: "pending_pharmacy",
      safetyAlerts: [
        "✅ Sent electronically to Smart Pharmacy queue.",
        "Pharmacist verification pending before dispensing.",
      ],
    };

    setPrescriptions((prev) => [newRx, ...prev]);

    // Create a new notification for pharmacist
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "New e-Prescription Received",
      message: `Doctor created prescription ${newRx.prescriptionNumber} for ${newRx.patientName}. Transmitted to Pharmacy.`,
      type: "prescription",
      timestamp: "Just now",
      isRead: false,
      targetRole: "pharmacist",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Log audit
    const newLog: SecurityAuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      userId: `DOC-201`,
      userRole: "doctor",
      action: "GENERATE_E_PRESCRIPTION",
      targetResource: newRx.prescriptionNumber,
      ipAddress: "192.168.1.104 [Doctor Station]",
      status: "SUCCESS",
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast(`e-Prescription #${newRx.prescriptionNumber} created and dispatched to Pharmacy!`);
    return newRx;
  };

  const updatePrescriptionStatus = (
    id: string,
    status: Prescription["status"],
    pharmacistNotes?: string
  ) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === id) {
          const updated = {
            ...rx,
            status,
            pharmacistNotes: pharmacistNotes || rx.pharmacistNotes,
            dispensedDate: status === "dispensed" ? new Date().toLocaleString() : rx.dispensedDate,
          };

          // If dispensed, deduct stock from inventory and add to patient reminders!
          if (status === "dispensed") {
            rx.medicines.forEach((med) => {
              updateMedicineStock(med.medicineName, -1);
              // Add to patient medication reminders
              setReminders((prevRem) => [
                ...prevRem,
                {
                  id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                  medicineName: med.medicineName,
                  dosage: med.dosage,
                  scheduledTime: med.frequency.includes("morning") ? "08:00 AM" : "08:00 PM",
                  takenToday: false,
                  instructions: med.instructions || "Take as directed by doctor & pharmacist.",
                },
              ]);
            });

            setHospitalStats((prevStats) => ({
              ...prevStats,
              prescriptionsDispensedToday: prevStats.prescriptionsDispensedToday + 1,
            }));
          }
          return updated;
        }
        return rx;
      })
    );

    const statusLabels: Record<string, string> = {
      verified_by_pharmacist: "Verified by Pharmacist",
      dispensed: "Dispensed & Counseled",
      needs_clarification: "Clarification Requested from Doctor",
      pending_pharmacy: "Queued for Pharmacy",
    };

    showToast(`Prescription status updated: ${statusLabels[status] || status}`);
  };

  const calculateDaysUntil = (targetDateStr: string): number => {
    const simulatedToday = new Date("2026-08-27T00:00:00");
    const target = new Date(`${targetDateStr}T00:00:00`);
    const realToday = new Date();
    realToday.setHours(0, 0, 0, 0);

    if (targetDateStr.startsWith("2026-08-")) {
      const diffTime = target.getTime() - simulatedToday.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    const diffTime = target.getTime() - realToday.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const sendAppointmentReminder = (
    appointmentId: string,
    options?: {
      force?: boolean;
      channels?: ("sms" | "in-app")[];
      customPhone?: string;
      triggerType?: "automated_1_day" | "manual_dispatch" | "instant_preview";
    }
  ): AppointmentReminderLog | null => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return null;

    const patient = patients.find((p) => p.id === apt.patientId);
    const phone = options?.customPhone || apt.patientPhone || patient?.phone || "+1 (555) 234-5678";
    const channels = options?.channels || (["sms", "in-app"] as ("sms" | "in-app")[]);
    const triggerType = options?.triggerType || "automated_1_day";
    const daysUntil = calculateDaysUntil(apt.date);

    const message = reminderPreferences.smsTemplate
      .replace("{patientName}", apt.patientName)
      .replace("{doctorName}", apt.doctorName)
      .replace("{department}", apt.department)
      .replace("{date}", apt.date)
      .replace("{time}", apt.time)
      .replace("{roomNumber}", apt.roomNumber)
      .replace("{tokenNumber}", apt.tokenNumber);

    let notifId: string | undefined = undefined;

    // 1. Dispatch in-app notification if channel selected
    if (channels.includes("in-app")) {
      notifId = `notif-apt-rem-${Date.now()}`;
      const notif: NotificationItem = {
        id: notifId,
        title: `⏰ 1-Day Appointment Reminder: Tomorrow at ${apt.time}`,
        message: `Reminder for ${apt.patientName}: Your consultation with ${apt.doctorName} (${apt.department}) is scheduled for tomorrow, ${apt.date} at ${apt.time} in ${apt.roomNumber} (Token: ${apt.tokenNumber}).`,
        type: "reminder",
        timestamp: "Just now",
        isRead: false,
        targetRole: "patient",
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    // 2. Log in security audit trail
    const auditLog: SecurityAuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      userId: "SYSTEM_SMS_ENGINE",
      userRole: "admin",
      action: "DISPATCH_1_DAY_APPOINTMENT_REMINDER",
      targetResource: `${apt.id} -> ${phone} [${channels.join("+")}]`,
      ipAddress: "10.0.4.15 [Carrier Gateway TLS 1.3]",
      status: "SUCCESS",
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    // 3. Create reminder delivery record
    const newLog: AppointmentReminderLog = {
      id: `REM-LOG-${Date.now()}`,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientPhone: phone,
      doctorName: apt.doctorName,
      department: apt.department,
      appointmentDate: apt.date,
      appointmentTime: apt.time,
      roomNumber: apt.roomNumber,
      tokenNumber: apt.tokenNumber,
      triggerType,
      channels,
      smsStatus: "Delivered",
      smsMessage: message,
      inAppNotificationId: notifId,
      timestamp: new Date().toLocaleString(),
      sentAt: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${daysUntil === 1 ? "24h prior" : `${daysUntil} days prior`})`,
      daysUntilAppointment: daysUntil,
      patientConfirmed: false,
    };

    // 4. Update appointment state
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apt.id
          ? {
              ...a,
              reminderSent: true,
              reminderSentAt: new Date().toISOString(),
              reminderChannels: channels,
              reminderSmsStatus: "Delivered",
              reminderMessage: message,
            }
          : a
      )
    );

    setReminderLogs((prev) => [newLog, ...prev]);

    if (options?.triggerType === "instant_preview" || reminderPreferences.simulateSmsPopups) {
      setActiveSmsPreview(newLog);
    }

    showToast(`📩 1-Day Reminder (SMS + In-App) dispatched to ${apt.patientName} (${phone})!`);
    return newLog;
  };

  const runAutomatedReminderScan = (options?: { forceAllTomorrow?: boolean }) => {
    let sentCount = 0;
    const createdLogs: AppointmentReminderLog[] = [];

    appointments.forEach((apt) => {
      if (apt.status === "cancelled" || apt.status === "completed") return;
      const days = calculateDaysUntil(apt.date);
      const isDueForReminder = days === 1 || (options?.forceAllTomorrow && days >= 0 && days <= 2);

      if (isDueForReminder && (!apt.reminderSent || options?.forceAllTomorrow)) {
        const log = sendAppointmentReminder(apt.id, {
          force: true,
          triggerType: "automated_1_day",
        });
        if (log) {
          sentCount++;
          createdLogs.push(log);
        }
      }
    });

    const summary = {
      lastRun: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      sentCount,
      scannedCount: appointments.length,
    };
    setLastReminderScan(summary);

    if (sentCount > 0) {
      showToast(`🤖 Automated Engine scanned ${appointments.length} appointments: ${sentCount} 1-day reminders dispatched!`);
    } else {
      showToast(`🤖 Automated Engine scanned ${appointments.length} appointments: All upcoming reminders are up-to-date.`);
    }

    return {
      sentCount,
      scannedCount: appointments.length,
      logs: createdLogs,
    };
  };

  const updateReminderPreferences = (prefs: Partial<ReminderPreferences>) => {
    setReminderPreferences((prev) => {
      const updated = { ...prev, ...prefs };
      localStorage.setItem("pharmacare_reminder_prefs", JSON.stringify(updated));
      return updated;
    });
    showToast("Automated reminder preferences updated.");
  };

  const confirmAppointmentViaSms = (reminderLogId: string) => {
    setReminderLogs((prev) =>
      prev.map((log) => {
        if (log.id === reminderLogId) {
          return { ...log, patientConfirmed: true };
        }
        return log;
      })
    );
    showToast("✅ Patient confirmed appointment via SMS response ('Reply 1')!");
  };

  const bookAppointment = (
    aptData: Omit<Appointment, "id" | "tokenNumber" | "status">
  ): Appointment => {
    const deptInitial = (aptData.department[0] || "G").toUpperCase();
    const token = `${deptInitial}-${Math.floor(10 + Math.random() * 89)}`;
    const newApt: Appointment = {
      ...aptData,
      id: `APT-${600 + appointments.length}`,
      tokenNumber: token,
      status: "confirmed",
      roomNumber: aptData.type === "teleconsultation" ? "Tele-Health Room 1" : `Consultation Room ${101 + (appointments.length % 10)}`,
      reminderSent: false,
    };

    setAppointments((prev) => [newApt, ...prev]);

    setHospitalStats((prev) => ({
      ...prev,
      opdPatientsToday: prev.opdPatientsToday + 1,
    }));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Appointment Confirmed",
      message: `Appointment with ${newApt.doctorName} booked for ${newApt.date} at ${newApt.time} (Token: ${token}). Automated 1-day reminder active.`,
      type: "appointment",
      timestamp: "Just now",
      isRead: false,
      targetRole: "patient",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Check if appointment is tomorrow (1 day before); if so, trigger 1-day reminder immediately
    const days = calculateDaysUntil(newApt.date);
    if (days === 1 && reminderPreferences.automatedSmsEnabled) {
      setTimeout(() => {
        sendAppointmentReminder(newApt.id, {
          triggerType: "automated_1_day",
        });
      }, 600);
    }

    showToast(`Appointment successfully booked with ${newApt.doctorName}! Token: ${token}`);
    return newApt;
  };

  const updateMedicineStock = (nameOrId: string, changeQty: number) => {
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === nameOrId || med.name.toLowerCase().includes(nameOrId.toLowerCase())) {
          const newQty = Math.max(0, med.stockQuantity + changeQty);
          let newStatus: MedicineItem["status"] = "in_stock";
          if (newQty === 0) newStatus = "out_of_stock";
          else if (newQty < med.minThreshold) newStatus = "low_stock";
          return { ...med, stockQuantity: newQty, status: newStatus };
        }
        return med;
      })
    );
  };

  const restockMedicine = (id: string, addedQty: number) => {
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const newQty = med.stockQuantity + addedQty;
          return {
            ...med,
            stockQuantity: newQty,
            status: newQty < med.minThreshold ? "low_stock" : "in_stock",
          };
        }
        return med;
      })
    );
    showToast(`Restocked ${addedQty} units successfully!`);
  };

  const sendChatMessage = (
    msgData: Omit<ChatMessage, "id" | "timestamp" | "status">
  ) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered",
    };
    setChatMessages((prev) => [...prev, newMsg]);

    const recipientRole: UserRole = msgData.senderRole === "doctor" ? "pharmacist" : "doctor";
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Message from ${msgData.senderName}`,
      message: `Re: ${msgData.topic || "Clinical Collaboration"} - "${msgData.content.slice(0, 60)}..."`,
      type: "prescription",
      timestamp: "Just now",
      isRead: false,
      targetRole: recipientRole,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((rem) => (rem.id === id ? { ...rem, takenToday: !rem.takenToday } : rem))
    );
    showToast("Medication reminder status updated!");
  };

  const updateLabTestStatus = (
    id: string,
    status: LabTest["status"],
    results?: LabTest["results"]
  ) => {
    setLabTests((prev) =>
      prev.map((test) => {
        if (test.id === id) {
          return {
            ...test,
            status,
            results: results || test.results,
            completedDate: status === "completed" ? new Date().toLocaleString() : test.completedDate,
          };
        }
        return test;
      })
    );
    showToast(`Lab Test ${id} status updated to ${status}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast("All notifications marked as read.");
  };

  const triggerEmergencyAlert = () => {
    const sosNotif: NotificationItem = {
      id: `sos-${Date.now()}`,
      title: "🚨 EMERGENCY ALERT TRIGGERED",
      message: "Emergency response protocol simulated for Eleanor Vance. Triage team alerted.",
      type: "emergency",
      timestamp: "Just now",
      isRead: false,
    };
    setNotifications((prev) => [sosNotif, ...prev]);
    showToast("🚨 Emergency Protocol Activated: Triage & Ambulance Services Simulated!");
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentPage,
        setCurrentPage,
        patients,
        doctors,
        medicines,
        prescriptions,
        appointments,
        labTests,
        chatMessages,
        reminders,
        hospitalStats,
        auditLogs,
        notifications,
        // Automated 1-Day Appointment Reminder Engine
        reminderLogs,
        reminderPreferences,
        activeSmsPreview,
        setActiveSmsPreview,
        sendAppointmentReminder,
        runAutomatedReminderScan,
        updateReminderPreferences,
        confirmAppointmentViaSms,
        lastReminderScan,
        // Patient Auth & Profile
        currentPatientId,
        currentPatient,
        setCurrentPatientId,
        registerPatient,
        loginPatient,
        logoutPatient,
        patientAuthModalOpen,
        setPatientAuthModalOpen,
        patientAuthMode,
        setPatientAuthMode,
        openPatientAuth,
        // Staff & Role Auth
        staffMembers,
        currentStaffId,
        currentStaff,
        staffAuthModalOpen,
        setStaffAuthModalOpen,
        staffAuthRole,
        setStaffAuthRole,
        openStaffAuth,
        loginStaff,
        logoutStaff,
        addPrescription,
        updatePrescriptionStatus,
        bookAppointment,
        updateMedicineStock,
        restockMedicine,
        sendChatMessage,
        toggleReminder,
        updateLabTestStatus,
        markNotificationRead,
        clearAllNotifications,
        hipaaModalOpen,
        setHipaaModalOpen,
        inquiryModalOpen,
        setInquiryModalOpen,
        inquiryModalType,
        setInquiryModalType,
        openInquiryModal,
        aiModalOpen,
        setAiModalOpen,
        aiModalInitialType,
        setAiModalInitialType,
        searchModalOpen,
        setSearchModalOpen,
        triggerEmergencyAlert,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
