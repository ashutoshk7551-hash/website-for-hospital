import { createClient, User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";
import { Patient, Appointment } from "../types";

// User-specified Supabase credentials with environment variable fallbacks
export const SUPABASE_URL: string =
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || "YOUR_SUPABASE_PROJECT_URL";
export const SUPABASE_ANON_KEY: string =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || "YOUR_SUPABASE_ANON_KEY";

// Validate whether a custom Supabase URL has been provided
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" &&
    Boolean(SUPABASE_ANON_KEY) &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
  );
};

// Initialize the Supabase client
export const supabase = createClient(
  SUPABASE_URL && SUPABASE_URL.startsWith("http")
    ? SUPABASE_URL
    : "https://placeholder-project.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Database interfaces matching Supabase tables
export interface SupabasePatientRow {
  id: string; // auth.uid()
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  blood_group: string;
  medical_history?: string[] | null;
  allergies?: string[] | null;
  chronic_conditions?: string[] | null;
  recent_vitals?: {
    bloodPressure: string;
    heartRate: number;
    bloodSugar: number;
    temperature: number;
    weight: number;
    lastUpdated: string;
  } | null;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  created_at?: string;
}

export interface SupabaseAppointmentRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  department: string;
  date: string;
  time: string;
  token_number: string;
  room_number: string;
  symptoms: string;
  status: "scheduled" | "completed" | "canceled" | "confirmed";
  created_at?: string;
}

/**
 * Convert Supabase patient row to frontend Patient domain model
 */
export function mapSupabasePatientToModel(row: SupabasePatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "+1 (555) 000-0000",
    age: row.age || 30,
    gender: row.gender || "Female",
    bloodGroup: row.blood_group || "O+",
    medicalHistory: row.medical_history || [],
    allergies: row.allergies || ["None reported"],
    chronicConditions: row.chronic_conditions || ["None reported"],
    createdAt: row.created_at || new Date().toISOString(),
    emergencyContact: row.emergency_contact || {
      name: "Primary Contact",
      relationship: "Family",
      phone: "+1 (555) 999-9999",
    },
    recentVitals: row.recent_vitals || {
      bloodPressure: "120/80 mmHg",
      heartRate: 72,
      bloodSugar: 96,
      temperature: 98.6,
      weight: 65,
      lastUpdated: "Just synced",
    },
  };
}

/**
 * Convert Patient domain model to Supabase insert/upsert row
 */
export function mapModelToSupabasePatient(patient: Patient): SupabasePatientRow {
  return {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    age: patient.age,
    gender: patient.gender,
    blood_group: patient.bloodGroup,
    medical_history: patient.medicalHistory || [],
    allergies: patient.allergies || [],
    chronic_conditions: patient.chronicConditions || [],
    recent_vitals: patient.recentVitals,
    emergency_contact: patient.emergencyContact,
    created_at: patient.createdAt || new Date().toISOString(),
  };
}

/**
 * Convert Supabase appointment row to frontend Appointment domain model
 */
export function mapSupabaseAppointmentToModel(row: SupabaseAppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: "",
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    department: row.department,
    date: row.date,
    time: row.time,
    type: "in-person",
    tokenNumber: row.token_number,
    roomNumber: row.room_number,
    symptoms: row.symptoms,
    status: (row.status as any) || "scheduled",
  };
}

/**
 * Convert Appointment model to Supabase appointment row
 */
export function mapModelToSupabaseAppointment(apt: Appointment): SupabaseAppointmentRow {
  return {
    id: apt.id,
    patient_id: apt.patientId,
    doctor_id: apt.doctorId,
    doctor_name: apt.doctorName,
    department: apt.department,
    date: apt.date,
    time: apt.time,
    token_number: apt.tokenNumber,
    room_number: apt.roomNumber,
    symptoms: apt.symptoms,
    status: (apt.status === "cancelled" ? "canceled" : apt.status) as any,
    created_at: new Date().toISOString(),
  };
}

/**
 * Supabase User Sign Up & Initial Patient Record Insertion
 */
export async function signUpPatientSupabase(
  email: string,
  password: string,
  patientData: Omit<Patient, "id">
): Promise<{ user: SupabaseUser | null; patient: Patient | null; error?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: patientData.name,
        },
      },
    });

    if (authError) {
      return { user: null, patient: null, error: authError.message };
    }

    const userId = authData.user?.id || `PAT-${Date.now().toString().slice(-4)}`;
    const fullPatient: Patient = {
      ...patientData,
      id: userId,
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };

    // Insert record into Supabase 'patients' table
    try {
      const { error: dbError } = await supabase
        .from("patients")
        .upsert(mapModelToSupabasePatient(fullPatient));
      if (dbError) {
        console.warn("Supabase patients upsert warning:", dbError.message);
      }
    } catch (dbErr) {
      console.warn("Supabase patients table write error:", dbErr);
    }

    return { user: authData.user, patient: fullPatient };
  } catch (err: any) {
    return { user: null, patient: null, error: err.message || "Failed to sign up with Supabase" };
  }
}

/**
 * Supabase User Sign In with Password and fetch Patient profile
 */
export async function signInPatientSupabase(
  email: string,
  password: string
): Promise<{ user: SupabaseUser | null; patient: Patient | null; error?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      return { user: null, patient: null, error: authError.message };
    }

    const user = authData.user;
    if (!user) {
      return { user: null, patient: null, error: "No user found." };
    }

    // Query 'patients' table where id = auth.uid()
    let patientRecord: Patient | null = null;
    try {
      const { data: patientRow, error: pError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!pError && patientRow) {
        patientRecord = mapSupabasePatientToModel(patientRow);
      }
    } catch (fetchErr) {
      console.warn("Could not fetch patient record from Supabase table:", fetchErr);
    }

    // Fallback if record does not exist yet in table
    if (!patientRecord) {
      patientRecord = {
        id: user.id,
        name: user.user_metadata?.full_name || email.split("@")[0],
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

      // Persist the profile row
      try {
        await supabase.from("patients").upsert(mapModelToSupabasePatient(patientRecord));
      } catch (e) {
        console.warn("Could not upsert fallback patient profile in Supabase:", e);
      }
    }

    return { user, patient: patientRecord };
  } catch (err: any) {
    return { user: null, patient: null, error: err.message || "Failed to sign in with Supabase" };
  }
}

/**
 * Supabase Sign Out
 */
export async function signOutPatientSupabase(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return {};
  } catch (err: any) {
    return { error: err.message || "Failed to sign out" };
  }
}

/**
 * Save appointment to Supabase 'appointments' table
 */
export async function saveAppointmentToSupabase(apt: Appointment): Promise<boolean> {
  try {
    const row = mapModelToSupabaseAppointment(apt);
    const { error } = await supabase.from("appointments").upsert(row);
    if (error) {
      console.warn("Supabase appointments upsert error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase appointments table write error:", err);
    return false;
  }
}

/**
 * Fetch patient appointments from Supabase 'appointments' table
 */
export async function fetchPatientAppointmentsFromSupabase(patientId: string): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch appointments error:", error.message);
      return [];
    }

    if (!data) return [];
    return data.map(mapSupabaseAppointmentToModel);
  } catch (err) {
    console.warn("Supabase fetch appointments table error:", err);
    return [];
  }
}
