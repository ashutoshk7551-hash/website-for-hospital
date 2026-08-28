export type UserRole = "patient" | "doctor" | "pharmacist" | "admin" | "lab_tech";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicConditions: string[];
  recentVitals: {
    bloodPressure: string;
    heartRate: number;
    bloodSugar: number;
    temperature: number;
    weight: number;
    oxygenSaturation?: number;
    lastUpdated: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  experienceYears: number;
  availableDays: string[];
  consultationFee: number;
  rating: number;
  avatar: string;
  status: "available" | "in-consultation" | "off-duty";
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: "in-person" | "teleconsultation" | "emergency-followup";
  status: "confirmed" | "completed" | "cancelled" | "in-progress" | "scheduled";
  symptoms: string;
  tokenNumber: string;
  roomNumber: string;
  patientPhone?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  reminderChannels?: ("sms" | "in-app")[];
  reminderSmsStatus?: "Delivered" | "Sent" | "Scheduled" | "Pending";
  reminderMessage?: string;
}

export interface AppointmentReminderLog {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  roomNumber: string;
  tokenNumber: string;
  triggerType: "automated_1_day" | "manual_dispatch" | "instant_preview";
  channels: ("sms" | "in-app")[];
  smsStatus: "Delivered" | "Sent" | "Pending";
  smsMessage: string;
  inAppNotificationId?: string;
  timestamp: string;
  sentAt: string;
  daysUntilAppointment: number;
  patientConfirmed?: boolean;
}

export interface ReminderPreferences {
  automatedSmsEnabled: boolean;
  automatedInAppEnabled: boolean;
  reminderWindowDays: number;
  simulateSmsPopups: boolean;
  smsSenderId: string;
  smsTemplate: string;
}

export interface PrescribedMedicine {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1 (Twice daily after food)"
  duration: string; // e.g. "5 days"
  instructions: string;
  timing: "before-food" | "after-food" | "with-food" | "bedtime";
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  diagnosis: string;
  medicines: PrescribedMedicine[];
  clinicalNotes: string;
  date: string;
  status: "pending_pharmacy" | "verified_by_pharmacist" | "dispensed" | "needs_clarification";
  pharmacistNotes?: string;
  dispensedDate?: string;
  safetyAlerts?: string[];
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Ointment" | "Inhaler";
  strength: string;
  manufacturer: string;
  batchNumber: string;
  stockQuantity: number;
  minThreshold: number;
  expiryDate: string;
  unitPrice: number;
  prescriptionRequired: boolean;
  status: "in_stock" | "low_stock" | "expiring_soon" | "out_of_stock";
  indications: string;
  contraindications: string;
  sideEffects: string;
  storageConditions: string;
}

export interface LabTest {
  id: string;
  testCode: string;
  testName: string;
  patientId: string;
  patientName: string;
  prescribedByDoctor: string;
  doctorName?: string;
  orderedDate: string;
  completedDate?: string;
  status: "ordered" | "sample_collected" | "processing" | "completed" | "critical_alert";
  department: "Hematology" | "Biochemistry" | "Microbiology" | "Radiology" | "Pathology";
  results: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
  }[];
  labTechnician: string;
  doctorNotes?: string;
  criticalFlag?: boolean;
}

export interface ChatMessage {
  id: string;
  senderRole: "doctor" | "pharmacist";
  senderName: string;
  recipientName: string;
  timestamp: string;
  content: string;
  topic?: "Prescription Clarification" | "Drug Interaction Concern" | "Stock Availability" | "Alternative Drug Suggestion" | "Dosage Adjustment";
  relatedPrescriptionId?: string;
  urgency: "normal" | "urgent" | "critical";
  status: "sent" | "delivered" | "read";
}

export interface MedicationReminder {
  id: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  takenToday: boolean;
  instructions: string;
}

export interface HospitalStats {
  totalBeds: number;
  occupiedBeds: number;
  icuBedsAvailable: number;
  emergencyCasesToday: number;
  opdPatientsToday: number;
  prescriptionsDispensedToday: number;
  pendingLabTests: number;
  activeDoctorsOnDuty: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  targetResource: string;
  ipAddress: string;
  status: "SUCCESS" | "FLAGGED" | "BLOCKED";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "prescription" | "appointment" | "reminder" | "lab" | "emergency" | "inventory";
  timestamp: string;
  isRead: boolean;
  targetRole?: UserRole;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "doctor" | "pharmacist" | "admin" | "lab_tech";
  department: string;
  licenseNumber?: string;
  designation: string;
  email: string;
  phone: string;
  avatar?: string;
  accessTier?: "Clinical Specialist" | "Lead Pharmacist" | "System Administrator" | "Diagnostic Specialist";
}
