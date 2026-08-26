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
} from "../data/mockData";

export type PageId =
  | "home"
  | "about"
  | "patient-portal"
  | "doctor-portal"
  | "pharmacist-portal"
  | "hospital-dashboard"
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

interface AppContextType {
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
  aiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
  aiModalInitialType?: "interaction" | "medicine_info" | "prescription_audit" | "stock_forecast";
  setAiModalInitialType: (type?: "interaction" | "medicine_info" | "prescription_audit" | "stock_forecast") => void;
  triggerEmergencyAlert: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>("patient");
  const [currentPage, setCurrentPage] = useState<PageId>("home");
  
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("pharmacare_patients");
    return saved ? JSON.parse(saved) : initialPatients;
  });

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

  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiModalInitialType, setAiModalInitialType] = useState<"interaction" | "medicine_info" | "prescription_audit" | "stock_forecast" | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
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
    };

    setAppointments((prev) => [newApt, ...prev]);

    setHospitalStats((prev) => ({
      ...prev,
      opdPatientsToday: prev.opdPatientsToday + 1,
    }));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Appointment Confirmed",
      message: `Appointment with ${newApt.doctorName} booked for ${newApt.date} at ${newApt.time} (Token: ${token}).`,
      type: "appointment",
      timestamp: "Just now",
      isRead: false,
      targetRole: "patient",
    };
    setNotifications((prev) => [newNotif, ...prev]);

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
        aiModalOpen,
        setAiModalOpen,
        aiModalInitialType,
        setAiModalInitialType,
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
