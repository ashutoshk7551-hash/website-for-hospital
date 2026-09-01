import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageId, pageToPath, pathToPage, ROUTES } from "../routes/routeConfig";
export type { PageId };
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
import {
  db,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
} from "../lib/firebase";
import {
  auth,
  googleAuthProvider,
  savePatientProfileToFirestore,
  getPatientProfileFromFirestore,
  subscribeToPatientProfile,
  saveAppointmentToFirestore,
  getPatientAppointmentsFromFirestore,
  subscribeToPatientAppointments,
} from "../services/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  supabase,
  isSupabaseConfigured,
  signUpPatientSupabase,
  signInPatientSupabase,
  signOutPatientSupabase,
  saveAppointmentToSupabase,
  fetchPatientAppointmentsFromSupabase,
  mapSupabasePatientToModel,
  mapModelToSupabasePatient,
  mapSupabaseAppointmentToModel,
} from "../lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AppContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentPage: PageId;
  setCurrentPage: (page: PageId, options?: { replace?: boolean }) => void;
  navigateTo: (path: string, options?: { replace?: boolean }) => void;
  navigationHistory: PageId[];
  goBack: () => void;
  canGoBack: boolean;
  resetToHome: () => void;
  isAuthInitializing: boolean;
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
  firebaseUser: FirebaseUser | null;
  isFirebaseAuthLoading: boolean;
  supabaseUser: SupabaseUser | null;
  isSupabaseConfigured: boolean;
  setCurrentPatientId: (id: string | null) => void;
  registerPatient: (patientData: Omit<Patient, "id">) => Patient;
  loginPatient: (patientIdOrEmail: string) => boolean;
  registerPatientWithFirebase: (
    email: string,
    password: string,
    patientData: Omit<Patient, "id">
  ) => Promise<Patient>;
  loginPatientWithFirebase: (email: string, password: string) => Promise<Patient | null>;
  loginPatientWithGoogle: () => Promise<Patient | null>;
  signUpWithSupabase: (
    email: string,
    password: string,
    patientData: Omit<Patient, "id">
  ) => Promise<Patient>;
  signInWithSupabase: (email: string, password: string) => Promise<Patient | null>;
  signOutWithSupabase: () => Promise<void>;
  syncPatientProfileToFirestore: (data: Partial<Patient>) => Promise<void>;
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
  checkInAppointment: (appointmentId: string, method?: "qr_scan" | "reception_manual") => Appointment | null;
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
  // Google Drive Cloud Vault
  driveUser: any | null;
  driveAccessToken: string | null;
  isDriveConnected: boolean;
  setDriveAuth: (user: any, token: string | null) => void;
  driveExportModalOpen: boolean;
  setDriveExportModalOpen: (open: boolean) => void;
  driveExportData: {
    title: string;
    data: any;
    recordType: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE";
  } | null;
  openDriveExportModal: (
    titleOrData:
      | string
      | {
          title: string;
          data: any;
          recordType: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE";
        },
    data?: any,
    recordType?: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE"
  ) => void;
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
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

  // Derive current page directly from URL location pathname
  const currentPage = pathToPage(location.pathname);
  const [navigationHistory, setNavigationHistory] = useState<PageId[]>([currentPage]);

  // Handle route change sync
  useEffect(() => {
    const page = pathToPage(location.pathname);
    setNavigationHistory((prev) => {
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  }, [location.pathname]);

  // Auth & Storage Initial Hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthInitializing(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize navigation with React Router
  const setCurrentPage = (targetPage: PageId, options?: { replace?: boolean }) => {
    const targetPath = pageToPath(targetPage);
    navigate(targetPath, { replace: options?.replace });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navigateTo = (path: string, options?: { replace?: boolean }) => {
    navigate(path, { replace: options?.replace });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step back through browser history stack
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Reset entire navigation directly back to home
  const resetToHome = () => {
    navigate("/");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canGoBack = typeof window !== "undefined" ? window.history.length > 1 || location.pathname !== "/" : true;

  const [hipaaModalOpen, setHipaaModalOpen] = useState<boolean>(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [inquiryModalType, setInquiryModalType] = useState<"general_inquiry" | "patient_intake" | "emergency_triage">("general_inquiry");

  // Google Drive Cloud Vault Auth & Export States
  const [driveUser, setDriveUser] = useState<any | null>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [driveExportModalOpen, setDriveExportModalOpen] = useState<boolean>(false);
  const [driveExportData, setDriveExportData] = useState<{
    title: string;
    data: any;
    recordType: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE";
  } | null>(null);

  const isDriveConnected = Boolean(driveAccessToken && driveUser);

  const setDriveAuth = (user: any, token: string | null) => {
    setDriveUser(user);
    setDriveAccessToken(token);
  };

  const openDriveExportModal = (
    titleOrData:
      | string
      | {
          title: string;
          data: any;
          recordType: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE";
        },
    data?: any,
    recordType?: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE"
  ) => {
    if (typeof titleOrData === "string") {
      setDriveExportData({
        title: titleOrData,
        data: data || {},
        recordType: recordType || "EHR_SUMMARY",
      });
    } else {
      setDriveExportData(titleOrData);
    }
    setDriveExportModalOpen(true);
  };

  const openInquiryModal = (type: "general_inquiry" | "patient_intake" | "emergency_triage" = "general_inquiry") => {
    setInquiryModalType(type);
    setInquiryModalOpen(true);
  };
  
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  // Real-time Cloud Firestore synchronization for global 'patients' collection
  useEffect(() => {
    const patientsRef = collection(db, "patients");

    const unsubscribe = onSnapshot(
      patientsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed initial demo patients to Firestore if collection is empty
          try {
            for (const p of initialPatients) {
              const seedData = {
                name: p.name,
                age: Number(p.age) || 30,
                gender: p.gender || "Other",
                phone: p.phone || "",
                email: p.email || "",
                bloodGroup: p.bloodGroup || "O+",
                medicalHistory: p.medicalHistory || ["None documented"],
                allergies: p.allergies || ["None reported"],
                chronicConditions: p.chronicConditions || ["None reported"],
                emergencyContact: p.emergencyContact || {
                  name: "Emergency Contact",
                  relationship: "Family",
                  phone: p.phone || "",
                },
                recentVitals: p.recentVitals || {
                  bloodPressure: "120/80 mmHg",
                  heartRate: 72,
                  bloodSugar: 96,
                  temperature: 98.6,
                  weight: 65,
                  lastUpdated: new Date().toLocaleDateString(),
                },
                createdAt: serverTimestamp(),
              };
              await addDoc(patientsRef, seedData);
            }
          } catch (seedErr) {
            console.warn("Auto-seeding patients collection error:", seedErr);
          }
          return;
        }

        const loadedPatients: Patient[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === "function") {
              createdAtStr = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === "string") {
              createdAtStr = data.createdAt;
            }
          }

          return {
            id: docSnap.id,
            name: data.name || "Unnamed Patient",
            age: typeof data.age === "number" ? data.age : parseInt(data.age, 10) || 0,
            gender: data.gender || "Other",
            bloodGroup: data.bloodGroup || "O+",
            phone: data.phone || "",
            email: data.email || "",
            medicalHistory: Array.isArray(data.medicalHistory) ? data.medicalHistory : [],
            allergies: Array.isArray(data.allergies) ? data.allergies : [],
            chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : [],
            emergencyContact: data.emergencyContact || {
              name: "Emergency Contact",
              relationship: "Family",
              phone: data.phone || "",
            },
            recentVitals: data.recentVitals || {
              bloodPressure: "120/80 mmHg",
              heartRate: 72,
              bloodSugar: 96,
              temperature: 98.6,
              weight: 65,
              lastUpdated: "Recently recorded",
            },
            createdAt: createdAtStr,
          };
        });

        // Sort by createdAt descending
        loadedPatients.sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });

        setPatients(loadedPatients);
      },
      (error) => {
        console.error("Firestore onSnapshot error on 'patients' collection:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const [currentPatientId, setCurrentPatientId] = useState<string | null>(() => {
    const saved = localStorage.getItem("pharmacare_current_patient_id");
    if (saved === "none" || saved === "guest" || saved === "null") return null;
    return saved !== null ? saved : initialPatients[0]?.id || "PAT-1082";
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseAuthLoading, setIsFirebaseAuthLoading] = useState<boolean>(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  const [patientAuthModalOpen, setPatientAuthModalOpen] = useState<boolean>(false);
  const [patientAuthMode, setPatientAuthMode] = useState<"signin" | "register">("register");

  const openPatientAuth = (mode: "signin" | "register" = "register") => {
    setPatientAuthMode(mode);
    setPatientAuthModalOpen(true);
  };

  const currentPatient = currentPatientId
    ? patients.find((p) => p.id === currentPatientId) || null
    : null;

  // Realtime Supabase Auth and database synchronization listener
  useEffect(() => {
    // Check initial Supabase session and load patient record & appointments from Supabase tables
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        try {
          // Query 'patients' table where id = auth.uid()
          const { data: patientRow } = await supabase
            .from("patients")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (patientRow) {
            const mappedPatient = mapSupabasePatientToModel(patientRow);
            setPatients((prev) => {
              const idx = prev.findIndex((p) => p.id === mappedPatient.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = mappedPatient;
                return copy;
              }
              return [mappedPatient, ...prev];
            });
            setCurrentPatientId(mappedPatient.id);
          }

          // Query 'appointments' table where patient_id = auth.uid()
          const remoteApts = await fetchPatientAppointmentsFromSupabase(session.user.id);
          if (remoteApts && remoteApts.length > 0) {
            setAppointments((prev) => {
              const remoteIds = new Set(remoteApts.map((a) => a.id));
              const others = prev.filter((a) => !remoteIds.has(a.id));
              return [...remoteApts, ...others];
            });
          }
        } catch (e) {
          console.warn("Supabase initial session sync error:", e);
        }
      }
    });

    // Subscribe to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseUser(session?.user || null);
      if (session?.user) {
        try {
          const { data: patientRow } = await supabase
            .from("patients")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (patientRow) {
            const mappedPatient = mapSupabasePatientToModel(patientRow);
            setPatients((prev) => {
              const idx = prev.findIndex((p) => p.id === mappedPatient.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = mappedPatient;
                return copy;
              }
              return [mappedPatient, ...prev];
            });
            setCurrentPatientId(mappedPatient.id);
          }

          const remoteApts = await fetchPatientAppointmentsFromSupabase(session.user.id);
          if (remoteApts && remoteApts.length > 0) {
            setAppointments((prev) => {
              const remoteIds = new Set(remoteApts.map((a) => a.id));
              const others = prev.filter((a) => !remoteIds.has(a.id));
              return [...remoteApts, ...others];
            });
          }
        } catch (e) {
          console.warn("Supabase onAuthStateChange error:", e);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Realtime Firebase Auth and Firestore Patient & Appointments listener
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeAppointments: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsFirebaseAuthLoading(false);

      if (user) {
        // Authenticated user: Load and subscribe to Firestore patient profile
        try {
          const profile = await getPatientProfileFromFirestore(user.uid);
          if (profile) {
            setPatients((prev) => {
              const existingIdx = prev.findIndex((p) => p.id === profile.id);
              if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = profile;
                return updated;
              }
              return [profile, ...prev];
            });
            setCurrentPatientId(user.uid);
          }

          // Fetch patient's appointments from Firestore
          const remoteApts = await getPatientAppointmentsFromFirestore(user.uid);
          if (remoteApts && remoteApts.length > 0) {
            setAppointments((prev) => {
              const ids = new Set(remoteApts.map((a) => a.id));
              const nonConflicting = prev.filter((a) => !ids.has(a.id));
              return [...remoteApts, ...nonConflicting];
            });
          }

          // Realtime listener for patient profile
          unsubscribeProfile = subscribeToPatientProfile(
            user.uid,
            (updatedProfile) => {
              if (updatedProfile) {
                setPatients((prev) => {
                  const idx = prev.findIndex((p) => p.id === updatedProfile.id);
                  if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = updatedProfile;
                    return updated;
                  }
                  return [updatedProfile, ...prev];
                });
              }
            },
            (err) => console.warn("Firestore profile sync error:", err)
          );

          // Realtime listener for appointments
          unsubscribeAppointments = subscribeToPatientAppointments(
            user.uid,
            (updatedApts) => {
              if (updatedApts) {
                setAppointments((prev) => {
                  const userAptIds = new Set(updatedApts.map((a) => a.id));
                  const others = prev.filter((a) => a.patientId !== user.uid && !userAptIds.has(a.id));
                  return [...updatedApts, ...others];
                });
              }
            },
            (err) => console.warn("Firestore appointment sync error:", err)
          );
        } catch (err) {
          console.error("Error loading patient data from Firestore:", err);
        }
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeAppointments) unsubscribeAppointments();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeAppointments) unsubscribeAppointments();
    };
  }, []);

  // Staff Authentication State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem("pharmacare_staff_members");
    return saved ? JSON.parse(saved) : initialStaffMembers;
  });

  const [currentStaffId, setCurrentStaffId] = useState<string | null>(() => {
    const saved = localStorage.getItem("pharmacare_current_staff_id");
    if (saved === "none" || saved === "guest" || saved === "null") return null;
    return saved !== null ? saved : "DOC-201";
  });

  const [staffAuthModalOpen, setStaffAuthModalOpen] = useState<boolean>(false);
  const [staffAuthRole, setStaffAuthRole] = useState<UserRole>("doctor");

  const openStaffAuth = (role: UserRole = "doctor") => {
    setStaffAuthRole(role);
    setStaffAuthModalOpen(true);
  };

  const currentStaff = currentStaffId
    ? staffMembers.find((s) => s.id === currentStaffId) || null
    : null;

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

  // Sync to localStorage (patients are persisted to Cloud Firestore in real-time)
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
    // Write directly to Firestore patients collection with serverTimestamp()
    const payload = {
      name: patientData.name.trim(),
      age: Number(patientData.age) || 0,
      gender: patientData.gender || "Other",
      phone: patientData.phone.trim(),
      email: patientData.email.toLowerCase().trim(),
      bloodGroup: patientData.bloodGroup || "O+",
      medicalHistory: Array.isArray(patientData.medicalHistory)
        ? patientData.medicalHistory
        : ["No major conditions recorded"],
      allergies: Array.isArray(patientData.allergies)
        ? patientData.allergies
        : ["None reported"],
      chronicConditions: Array.isArray(patientData.chronicConditions)
        ? patientData.chronicConditions
        : ["None reported"],
      emergencyContact: patientData.emergencyContact || {
        name: "Emergency Contact",
        relationship: "Family",
        phone: patientData.phone.trim(),
      },
      recentVitals: patientData.recentVitals || {
        bloodPressure: "120/80 mmHg",
        heartRate: 72,
        bloodSugar: 96,
        temperature: 98.6,
        weight: 65,
        lastUpdated: new Date().toLocaleDateString(),
      },
      createdAt: serverTimestamp(),
    };

    // Save to Cloud Firestore
    addDoc(collection(db, "patients"), payload)
      .then((docRef) => {
        setCurrentPatientId(docRef.id);
      })
      .catch((err) => {
        console.error("Error adding patient to Firestore:", err);
      });

    // Provide immediate responsive patient object
    const tempId = `PAT-${Date.now().toString().slice(-6)}`;
    const newPatient: Patient = {
      ...patientData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);
    setCurrentPatientId(tempId);
    setActiveRole("patient");

    // Add welcoming notification
    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "🎉 Registration Successful! Welcome to People's Hospital",
      message: `Your record is stored in Cloud Firestore and synced across all devices.`,
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
      userId: tempId,
      userRole: "patient",
      action: "PATIENT_SELF_REGISTRATION",
      targetResource: `EHR_RECORD_FIRESTORE`,
      ipAddress: "192.168.1.18 [Cloud Firestore Client]",
      status: "SUCCESS",
    };
    setAuditLogs((prev) => [regLog, ...prev]);

    showToast(`Welcome, ${newPatient.name}! Saved to Cloud Firestore.`);
    return newPatient;
  };

  const registerPatientWithFirebase = async (
    email: string,
    password: string,
    patientData: Omit<Patient, "id">
  ): Promise<Patient> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const uid = userCredential.user.uid;

    const payload = {
      name: patientData.name.trim(),
      age: Number(patientData.age) || 0,
      gender: patientData.gender || "Other",
      phone: patientData.phone.trim(),
      email: email.trim().toLowerCase(),
      bloodGroup: patientData.bloodGroup || "O+",
      medicalHistory: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory : [],
      allergies: Array.isArray(patientData.allergies) ? patientData.allergies : ["None reported"],
      chronicConditions: Array.isArray(patientData.chronicConditions) ? patientData.chronicConditions : ["None reported"],
      emergencyContact: patientData.emergencyContact || {
        name: "Emergency Contact",
        relationship: "Family",
        phone: patientData.phone.trim(),
      },
      recentVitals: patientData.recentVitals || {
        bloodPressure: "120/80 mmHg",
        heartRate: 72,
        bloodSugar: 96,
        temperature: 98.6,
        weight: 65,
        lastUpdated: new Date().toLocaleDateString(),
      },
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "patients", uid), payload, { merge: true });

    const newPatient: Patient = {
      ...patientData,
      id: uid,
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== uid)]);
    setCurrentPatientId(uid);
    setActiveRole("patient");
    setCurrentPage("patient-portal");

    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "🎉 Welcome to People's Hospital! Digital Health Record Created",
      message: `Your Patient Account (${email}) is connected with Cloud Firestore. UID: ${uid}.`,
      type: "reminder",
      timestamp: "Just now",
      isRead: false,
      targetRole: "patient",
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    showToast(`Welcome, ${newPatient.name}! Profile saved to Cloud Firestore.`);
    return newPatient;
  };

  const loginPatientWithFirebase = async (
    email: string,
    password: string
  ): Promise<Patient | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const uid = userCredential.user.uid;

    let profile = await getPatientProfileFromFirestore(uid);
    if (!profile) {
      const defaultProfile: Patient = {
        id: uid,
        name: userCredential.user.displayName || email.split("@")[0],
        email: email.trim(),
        age: 32,
        gender: "Female",
        bloodGroup: "O+",
        phone: "+1 (555) 234-5678",
        medicalHistory: ["None documented"],
        createdAt: new Date().toISOString(),
        emergencyContact: {
          name: "Family Guardian",
          relationship: "Spouse",
          phone: "+1 (555) 999-9999",
        },
        allergies: ["None known"],
        chronicConditions: ["None documented"],
        recentVitals: {
          bloodPressure: "120/80 mmHg",
          heartRate: 72,
          bloodSugar: 96,
          temperature: 98.6,
          weight: 65,
          lastUpdated: "Just synced",
        },
      };
      profile = await savePatientProfileToFirestore(uid, defaultProfile);
    }

    setPatients((prev) => [profile!, ...prev.filter((p) => p.id !== uid)]);
    setCurrentPatientId(uid);
    setActiveRole("patient");
    setCurrentPage("patient-portal");
    showToast(`Welcome back, ${profile.name}! Signed in via Firebase.`);
    return profile;
  };

  const loginPatientWithGoogle = async (): Promise<Patient | null> => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const uid = result.user.uid;

    let profile = await getPatientProfileFromFirestore(uid);
    if (!profile) {
      const defaultProfile: Patient = {
        id: uid,
        name: result.user.displayName || "Google Patient",
        email: result.user.email || "",
        age: 30,
        gender: "Female",
        bloodGroup: "O+",
        phone: result.user.phoneNumber || "+1 (555) 000-0000",
        medicalHistory: ["None documented"],
        createdAt: new Date().toISOString(),
        emergencyContact: {
          name: "Primary Contact",
          relationship: "Family",
          phone: "+1 (555) 999-9999",
        },
        allergies: ["None known"],
        chronicConditions: ["None documented"],
        recentVitals: {
          bloodPressure: "120/80 mmHg",
          heartRate: 72,
          bloodSugar: 95,
          temperature: 98.6,
          weight: 65,
          lastUpdated: "Just synced",
        },
      };
      profile = await savePatientProfileToFirestore(uid, defaultProfile);
    }

    setPatients((prev) => [profile!, ...prev.filter((p) => p.id !== uid)]);
    setCurrentPatientId(uid);
    setActiveRole("patient");
    setCurrentPage("patient-portal");
    showToast(`Welcome back, ${profile.name}! Signed in with Google.`);
    return profile;
  };

  const signUpWithSupabase = async (
    email: string,
    password: string,
    patientData: Omit<Patient, "id">
  ): Promise<Patient> => {
    const res = await signUpPatientSupabase(email, password, patientData);
    if (res.error || !res.patient) {
      throw new Error(res.error || "Failed to create Supabase account.");
    }

    const newPatient = res.patient;
    setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== newPatient.id)]);
    setCurrentPatientId(newPatient.id);
    setActiveRole("patient");
    setCurrentPage("patient-portal");

    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Supabase Account Created",
      message: `Welcome ${newPatient.name}! Your patient profile and credentials have been securely stored in Supabase PostgreSQL database.`,
      type: "reminder",
      timestamp: "Just now",
      isRead: false,
      targetRole: "patient",
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    showToast(`Welcome, ${newPatient.name}! Profile registered in Supabase.`);
    return newPatient;
  };

  const signInWithSupabase = async (
    email: string,
    password: string
  ): Promise<Patient | null> => {
    const res = await signInPatientSupabase(email, password);
    if (res.error || !res.patient) {
      throw new Error(res.error || "Invalid Supabase email or password.");
    }

    const patient = res.patient;
    setPatients((prev) => [patient, ...prev.filter((p) => p.id !== patient.id)]);
    setCurrentPatientId(patient.id);
    setActiveRole("patient");
    setCurrentPage("patient-portal");

    // Also fetch appointments from Supabase table
    try {
      const apts = await fetchPatientAppointmentsFromSupabase(patient.id);
      if (apts.length > 0) {
        setAppointments((prev) => {
          const remoteIds = new Set(apts.map((a) => a.id));
          const others = prev.filter((a) => !remoteIds.has(a.id));
          return [...apts, ...others];
        });
      }
    } catch (e) {
      console.warn("Could not fetch appointments from Supabase:", e);
    }

    showToast(`Welcome back, ${patient.name}! Signed in via Supabase.`);
    return patient;
  };

  const signOutWithSupabase = async () => {
    await signOutPatientSupabase();
    await logoutPatient();
  };

  const syncPatientProfileToFirestore = async (data: Partial<Patient>) => {
    if (!currentPatientId) return;
    const existing = patients.find((p) => p.id === currentPatientId);
    if (!existing) return;
    const updated: Patient = { ...existing, ...data };
    await savePatientProfileToFirestore(currentPatientId, updated);
    
    // Also sync to Supabase if configured
    try {
      await supabase.from("patients").upsert(mapModelToSupabasePatient(updated));
    } catch (e) {
      console.warn("Supabase profile sync warning:", e);
    }

    setPatients((prev) => prev.map((p) => (p.id === currentPatientId ? updated : p)));
    showToast("Profile synced to cloud databases.");
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

  const logoutPatient = async () => {
    const prevId = currentPatientId;
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout warning:", e);
    }
    try {
      await signOutPatientSupabase();
    } catch (e) {
      console.warn("Supabase signout warning:", e);
    }
    setCurrentPatientId(null);
    setSupabaseUser(null);
    setFirebaseUser(null);
    localStorage.removeItem("pharmacare_current_patient_id");
    localStorage.setItem("pharmacare_current_patient_id", "guest");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("patient_auth");
    localStorage.removeItem("token");
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing session storage:", e);
    }
    
    // Audit log
    if (prevId) {
      const logoutLog: SecurityAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString(),
        userId: prevId,
        userRole: "patient",
        action: "PATIENT_SIGN_OUT_SUCCESS",
        targetResource: "PATIENT_SESSION",
        ipAddress: "127.0.0.1 [Client Browser]",
        status: "SUCCESS",
      };
      setAuditLogs((prev) => [logoutLog, ...prev]);
    }

    setCurrentPage("home");
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
    const prevStaff = currentStaff;
    setCurrentStaffId(null);
    localStorage.removeItem("pharmacare_current_staff_id");
    localStorage.setItem("pharmacare_current_staff_id", "guest");
    localStorage.removeItem("staff_user");
    localStorage.removeItem("staff_token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing session storage:", e);
    }

    if (prevStaff) {
      const logoutLog: SecurityAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString(),
        userId: prevStaff.id,
        userRole: prevStaff.role,
        action: "STAFF_LOGOUT_SUCCESS",
        targetResource: `${prevStaff.role.toUpperCase()}_WORKSPACE`,
        ipAddress: "192.168.1.100 [Staff Workstation]",
        status: "SUCCESS",
      };
      setAuditLogs((prev) => [logoutLog, ...prev]);
    }

    setActiveRole("patient");
    setCurrentPage("home");
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

    // Persist to Cloud Firestore if current patient or auth user is active
    if (auth.currentUser || newApt.patientId) {
      saveAppointmentToFirestore(newApt).catch((err) => {
        console.warn("Could not asynchronously write appointment to Firestore:", err);
      });
    }

    // Persist to Supabase 'appointments' table
    saveAppointmentToSupabase(newApt).catch((err) => {
      console.warn("Could not write appointment to Supabase table:", err);
    });

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

  const checkInAppointment = (
    appointmentId: string,
    method: "qr_scan" | "reception_manual" = "qr_scan"
  ): Appointment | null => {
    let targetApt: Appointment | null = null;

    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId || a.tokenNumber === appointmentId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const updated: Appointment = {
            ...a,
            status: "checked-in",
            checkedInAt: nowStr,
            checkInMethod: method,
            queuePosition: Math.floor(1 + Math.random() * 3),
          };
          targetApt = updated;
          return updated;
        }
        return a;
      })
    );

    if (targetApt) {
      const apt = targetApt as Appointment;
      // Log audit entry
      const auditLog: SecurityAuditLog = {
        id: `LOG-CHK-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString(),
        userId: "RECEPTION_DESK_KIOSK",
        userRole: "admin",
        action: "RECEPTION_ARRIVAL_CHECKIN_VERIFIED",
        targetResource: `APT:${apt.id} | Patient: ${apt.patientName} | Token: ${apt.tokenNumber} | Method: ${method.toUpperCase()}`,
        ipAddress: "192.168.1.10 [Reception Desk Scanner Station 1]",
        status: "SUCCESS",
      };
      setAuditLogs((prev) => [auditLog, ...prev]);

      // Hospital Notification
      const newNotif: NotificationItem = {
        id: `notif-checkin-${Date.now()}`,
        title: "Patient Arrival Verified at Reception",
        message: `${apt.patientName} has checked in via ${method === "qr_scan" ? "QR Pass Scan" : "Reception Desk"} for ${apt.doctorName} (${apt.roomNumber}). Token #${apt.tokenNumber}.`,
        type: "appointment",
        timestamp: "Just now",
        isRead: false,
        targetRole: "doctor",
      };
      setNotifications((prev) => [newNotif, ...prev]);

      showToast(`🎯 Arrival Verified! ${apt.patientName} checked in for ${apt.doctorName} (Token #${apt.tokenNumber})`);
      return targetApt;
    } else {
      showToast("No appointment matched the scanned QR code or Token ID.");
      return null;
    }
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
        navigateTo,
        navigationHistory,
        goBack,
        canGoBack,
        resetToHome,
        isAuthInitializing,
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
        firebaseUser,
        isFirebaseAuthLoading,
        supabaseUser,
        isSupabaseConfigured: isSupabaseConfigured(),
        setCurrentPatientId,
        registerPatient,
        loginPatient,
        registerPatientWithFirebase,
        loginPatientWithFirebase,
        loginPatientWithGoogle,
        signUpWithSupabase,
        signInWithSupabase,
        signOutWithSupabase,
        syncPatientProfileToFirestore,
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
        checkInAppointment,
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
        // Google Drive Cloud Vault
        driveUser,
        driveAccessToken,
        isDriveConnected,
        setDriveAuth,
        driveExportModalOpen,
        setDriveExportModalOpen,
        driveExportData,
        openDriveExportModal,
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
