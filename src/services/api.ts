/**
 * Unified Healthcare API Service Layer
 * Bridges frontend form submissions and administrative management views to the secure backend database.
 */

import {
  PatientSubmission,
  DatabaseQueryFilters,
  DatabaseStats,
  createPatientSubmissionInDb,
  updateSubmissionInDb,
  querySubmissionsFromDb,
  getDatabaseHealthStats,
  getAllSubmissionsFromDb,
} from "../lib/database";
import { sanitizeTextInput, sanitizePhoneNumber, sanitizeEmail, validateDateOfBirth } from "../lib/sanitizer";
import { AlertUrgency } from "./notificationService";

export interface AppointmentBookingPayload {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  department: string;
  doctorId?: string;
  doctorName?: string;
  preferredDate: string;
  preferredTime: string;
  consultType: "in_person" | "teleconsultation";
  symptoms: string;
  urgency: AlertUrgency;
  consentGiven: boolean;
  hipaaAgreed: boolean;
}

export interface PatientIntakePayload {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  department: string;
  primaryConcern: string;
  urgency: AlertUrgency;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  triageVitals?: {
    bloodPressure?: string;
    heartRate?: number;
    bloodSugar?: number;
    temperature?: number;
  };
  consentGiven: boolean;
  hipaaAgreed: boolean;
}

export interface GeneralInquiryPayload {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  department: string;
  urgency: AlertUrgency;
  subject?: string;
  message: string;
  consentGiven: boolean;
  hipaaAgreed: boolean;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class HealthcareApiService {
  /**
   * Validates common patient data submission fields.
   */
  static validateSubmissionForm(fields: {
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    medicalConcern: string;
    department: string;
    consentGiven: boolean;
    hipaaAgreed: boolean;
  }): FormValidationResult {
    const errors: Record<string, string> = {};

    if (!fields.fullName || fields.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    const phoneRes = sanitizePhoneNumber(fields.phone);
    if (!phoneRes.isValid) {
      errors.phone = phoneRes.error || "Valid contact phone number is required.";
    }

    const emailRes = sanitizeEmail(fields.email);
    if (!emailRes.isValid) {
      errors.email = emailRes.error || "Valid email address is required for confidential confirmation.";
    }

    const dobRes = validateDateOfBirth(fields.dateOfBirth);
    if (!dobRes.isValid) {
      errors.dateOfBirth = dobRes.error || "Valid Date of Birth is required (YYYY-MM-DD).";
    }

    if (!fields.medicalConcern || fields.medicalConcern.trim().length < 5) {
      errors.medicalConcern = "Please provide details of your medical concern or symptom (at least 5 characters).";
    }

    if (!fields.department || fields.department.trim() === "") {
      errors.department = "Please select the relevant medical department.";
    }

    if (!fields.consentGiven) {
      errors.consentGiven = "You must consent to clinical triage evaluation.";
    }

    if (!fields.hipaaAgreed) {
      errors.hipaaAgreed = "You must agree to the HIPAA Data Privacy & Notice of Privacy Practices.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Submits an Appointment Booking Form to the backend database.
   */
  static async submitAppointment(payload: AppointmentBookingPayload): Promise<PatientSubmission> {
    const sanitizedName = sanitizeTextInput(payload.fullName);
    const sanitizedConcern = sanitizeTextInput(payload.symptoms);

    return await createPatientSubmissionInDb({
      submissionType: "appointment_request",
      fullName: sanitizedName,
      phone: payload.phone.trim(),
      email: payload.email.trim().toLowerCase(),
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender || "Unspecified",
      department: payload.department,
      urgency: payload.urgency || "routine",
      medicalConcern: sanitizedConcern,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      consultType: payload.consultType,
      assignedDoctorName: payload.doctorName,
      consentGiven: payload.consentGiven,
      hipaaAgreed: payload.hipaaAgreed,
    });
  }

  /**
   * Submits a Patient Intake & Medical Registration Form to the backend database.
   */
  static async submitIntake(payload: PatientIntakePayload): Promise<PatientSubmission> {
    const sanitizedName = sanitizeTextInput(payload.fullName);
    const sanitizedConcern = sanitizeTextInput(payload.primaryConcern);

    return await createPatientSubmissionInDb({
      submissionType: "patient_intake",
      fullName: sanitizedName,
      phone: payload.phone.trim(),
      email: payload.email.trim().toLowerCase(),
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender || "Unspecified",
      department: payload.department || "General Medicine",
      urgency: payload.urgency || "routine",
      medicalConcern: sanitizedConcern,
      allergies: payload.allergies || [],
      chronicConditions: payload.chronicConditions || [],
      triageVitals: payload.triageVitals,
      consentGiven: payload.consentGiven,
      hipaaAgreed: payload.hipaaAgreed,
    });
  }

  /**
   * Submits a General Patient Inquiry / Triage Contact to the backend database.
   */
  static async submitGeneralInquiry(payload: GeneralInquiryPayload): Promise<PatientSubmission> {
    const sanitizedName = sanitizeTextInput(payload.fullName);
    const sanitizedMsg = sanitizeTextInput(payload.message);

    return await createPatientSubmissionInDb({
      submissionType: payload.urgency === "emergency" ? "emergency_triage" : "general_inquiry",
      fullName: sanitizedName,
      phone: payload.phone.trim(),
      email: payload.email.trim().toLowerCase(),
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender || "Unspecified",
      department: payload.department,
      urgency: payload.urgency,
      medicalConcern: sanitizedMsg,
      consentGiven: payload.consentGiven,
      hipaaAgreed: payload.hipaaAgreed,
    });
  }

  /**
   * Fetches submissions with multi-parameter filtering for Staff Admin dashboard.
   */
  static async getSubmissions(filters: DatabaseQueryFilters = {}): Promise<PatientSubmission[]> {
    return await querySubmissionsFromDb(filters);
  }

  /**
   * Updates review status, notes, or assigned staff.
   */
  static async updateSubmission(
    id: string,
    updates: Parameters<typeof updateSubmissionInDb>[1]
  ): Promise<PatientSubmission | null> {
    return await updateSubmissionInDb(id, updates);
  }

  /**
   * Returns live system health and database statistics.
   */
  static getHealthStats(): DatabaseStats {
    return getDatabaseHealthStats();
  }

  /**
   * Exports submissions to CSV format for clinical audits.
   */
  static exportToCsv(submissions: PatientSubmission[]): string {
    const headers = [
      "Reference ID",
      "Created At",
      "Submission Type",
      "Full Name",
      "DOB",
      "Phone",
      "Email",
      "Department",
      "Urgency",
      "Status",
      "Assigned Staff",
      "Medical Concern",
      "Review Notes",
    ];

    const rows = submissions.map((s) => [
      `"${s.referenceId}"`,
      `"${s.createdAt}"`,
      `"${s.submissionType}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.dateOfBirth}"`,
      `"${s.phone}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      `"${s.urgency.toUpperCase()}"`,
      `"${s.status.toUpperCase()}"`,
      `"${(s.assignedStaffName || "Unassigned").replace(/"/g, '""')}"`,
      `"${s.medicalConcern.replace(/"/g, '""')}"`,
      `"${(s.internalReviewNotes || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}
