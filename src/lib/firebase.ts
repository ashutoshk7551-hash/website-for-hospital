import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocFromServer,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
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
import firebaseConfig from "../../firebase-applet-config.json";
import { Patient } from "../types";

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const FIRESTORE_DATABASE_ID =
  (firebaseConfig as any).firestoreDatabaseId ||
  "ai-studio-peopleshospital-e222f675-f9dd-4931-832e-467de2c2470f";

// Initialize Firestore with explicit Database ID
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});

// Re-export common Firestore utilities
export {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocFromServer,
};

/**
 * Validate connection to Firestore on initial boot
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client is currently offline or connecting...");
    }
  }
}
testFirestoreConnection();

/**
 * Add a new patient document to the global 'patients' collection in Firestore.
 * Ensures every record contains name, age, gender, phone, email, medicalHistory, and createdAt: serverTimestamp()
 */
export async function addPatientToFirestore(patientData: {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicalHistory: string[];
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship?: string;
    phone: string;
  };
  recentVitals?: {
    bloodPressure?: string;
    heartRate?: number;
    bloodSugar?: number;
    temperature?: number;
    weight?: number;
    lastUpdated?: string;
  };
}): Promise<string> {
  const payload = {
    name: patientData.name.trim(),
    age: Number(patientData.age) || 0,
    gender: patientData.gender || "Other",
    phone: patientData.phone.trim(),
    email: patientData.email.toLowerCase().trim(),
    medicalHistory: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory : [],
    bloodGroup: patientData.bloodGroup || "O+",
    allergies: patientData.allergies || ["None reported"],
    chronicConditions: patientData.chronicConditions || ["None reported"],
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
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "patients"), payload);
  return docRef.id;
}

/**
 * Real-time listener for the global 'patients' collection in Firestore.
 * Calls onUpdate with mapped Patient objects whenever data is added or modified on ANY connected device.
 */
export function subscribeToPatients(
  onUpdate: (patients: Patient[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const patientsRef = collection(db, "patients");

  return onSnapshot(
    patientsRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const items: Patient[] = snapshot.docs.map((docSnap) => {
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
          gender: data.gender || "Unknown",
          phone: data.phone || "",
          email: data.email || "",
          medicalHistory: Array.isArray(data.medicalHistory) ? data.medicalHistory : [],
          bloodGroup: data.bloodGroup || "O+",
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
        } as Patient;
      });

      // Sort by creation date descending (newest first)
      items.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(items);
    },
    (error) => {
      console.error("Firestore onSnapshot error on 'patients' collection:", error);
      if (onError) onError(error);
    }
  );
}
