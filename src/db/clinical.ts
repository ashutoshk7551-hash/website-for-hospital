import { db } from "./index.ts";
import { appointments, patientIntakes, contactInquiries } from "./schema.ts";
import { desc, eq } from "drizzle-orm";

export async function insertAppointment(data: {
  trackingId: string;
  fullName: string;
  email: string;
  phone: string;
  doctorName?: string;
  department?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
  status?: string;
}) {
  try {
    const result = await db.insert(appointments).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database error in insertAppointment:", error);
    throw new Error("Failed to save appointment record.", { cause: error });
  }
}

export async function getAppointments() {
  try {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.error("Database error in getAppointments:", error);
    throw new Error("Failed to retrieve appointments.", { cause: error });
  }
}

export async function insertPatientIntake(data: {
  trackingId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContact?: string;
}) {
  try {
    const result = await db.insert(patientIntakes).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database error in insertPatientIntake:", error);
    throw new Error("Failed to save intake record.", { cause: error });
  }
}

export async function getPatientIntakes() {
  try {
    return await db.select().from(patientIntakes).orderBy(desc(patientIntakes.createdAt));
  } catch (error) {
    console.error("Database error in getPatientIntakes:", error);
    throw new Error("Failed to retrieve intake records.", { cause: error });
  }
}

export async function insertContactInquiry(data: {
  trackingId: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  subject?: string;
  message: string;
}) {
  try {
    const result = await db.insert(contactInquiries).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database error in insertContactInquiry:", error);
    throw new Error("Failed to save contact inquiry.", { cause: error });
  }
}

export async function getContactInquiries() {
  try {
    return await db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
  } catch (error) {
    console.error("Database error in getContactInquiries:", error);
    throw new Error("Failed to retrieve contact inquiries.", { cause: error });
  }
}
