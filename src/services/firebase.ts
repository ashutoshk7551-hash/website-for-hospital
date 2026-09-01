import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  getDocFromServer,
  onSnapshot,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Patient, Appointment } from "../types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with explicit database ID as mandated by Firebase skill
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});

// Operation Types for structured error logging
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Structured Firestore error handler as required by Firebase skill
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on initial boot
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}

// Initial connection check
testFirestoreConnection();

/**
 * Save or update a patient profile document in Firestore collection 'patients' keyed by uid
 */
export async function savePatientProfileToFirestore(
  uid: string,
  patientData: Omit<Patient, "id"> | Patient
): Promise<Patient> {
  const path = `patients/${uid}`;
  const record: Patient = {
    ...patientData,
    id: uid,
  };

  try {
    await setDoc(doc(db, "patients", uid), record, { merge: true });
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve patient profile from Firestore collection 'patients' by UID
 */
export async function getPatientProfileFromFirestore(
  uid: string
): Promise<Patient | null> {
  const path = `patients/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, "patients", uid));
    if (docSnap.exists()) {
      return docSnap.data() as Patient;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Realtime subscription to patient profile document
 */
export function subscribeToPatientProfile(
  uid: string,
  onUpdate: (patient: Patient | null) => void,
  onError?: (err: any) => void
) {
  const path = `patients/${uid}`;
  return onSnapshot(
    doc(db, "patients", uid),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Patient);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Save appointment record to Firestore
 */
export async function saveAppointmentToFirestore(
  appointment: Appointment
): Promise<void> {
  const path = `appointments/${appointment.id}`;
  try {
    await setDoc(doc(db, "appointments", appointment.id), appointment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch patient appointments from Firestore
 */
export async function getPatientAppointmentsFromFirestore(
  patientId: string
): Promise<Appointment[]> {
  const path = "appointments";
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Subscribe to patient appointments in realtime
 */
export function subscribeToPatientAppointments(
  patientId: string,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (err: any) => void
) {
  const path = "appointments";
  const q = query(
    collection(db, "appointments"),
    where("patientId", "==", patientId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => docSnap.data() as Appointment);
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Delete an appointment from Firestore
 */
export async function deleteAppointmentFromFirestore(
  appointmentId: string
): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    await deleteDoc(doc(db, "appointments", appointmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
