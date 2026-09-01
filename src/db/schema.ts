import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Define the 'users' table (using Firebase Auth UID)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'appointments' table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  doctorName: text("doctor_name"),
  department: text("department"),
  appointmentDate: text("appointment_date"),
  appointmentTime: text("appointment_time"),
  reason: text("reason"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'patient_intakes' table
export const patientIntakes = pgTable("patient_intakes", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  emergencyContact: text("emergency_contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'contact_inquiries' table
export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  department: text("department"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));
