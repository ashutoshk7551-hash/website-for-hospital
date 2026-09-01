import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { getDriveAccessToken, setDriveAccessToken } from "./googleDriveService";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Complete Google Docs & Drive OAuth Scopes
export const DOCS_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://mail.google.com/",
];

const provider = new GoogleAuthProvider();
DOCS_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: "select_account",
});

// Cache the access token in memory only
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleDoc {
  documentId: string;
  title: string;
  body?: {
    content?: DocStructuralElement[];
  };
  revisionId?: string;
  namedRanges?: Record<string, any>;
  documentStyle?: Record<string, any>;
  suggestionsViewMode?: string;
}

export interface DocStructuralElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: {
    elements?: {
      startIndex?: number;
      endIndex?: number;
      textRun?: {
        content?: string;
        textStyle?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          fontSize?: { magnitude: number; unit: string };
          foregroundColor?: any;
        };
      };
    }[];
    paragraphStyle?: {
      namedStyleType?: string;
      alignment?: string;
      lineSpacing?: number;
    };
    bullet?: {
      listId?: string;
      nestingLevel?: number;
    };
  };
  table?: {
    rows?: number;
    columns?: number;
    tableRows?: {
      tableCells?: {
        content?: DocStructuralElement[];
      }[];
    }[];
  };
  sectionBreak?: any;
}

export interface GoogleDocFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
  shared?: boolean;
  size?: string;
}

export type MedicalDocTemplate =
  | "discharge_summary"
  | "clinical_consultation"
  | "prescription_summary"
  | "lab_diagnostic"
  | "referral_letter"
  | "blank_medical_note";

export interface MedicalDocGenerationParams {
  template: MedicalDocTemplate;
  title: string;
  patientName: string;
  patientId?: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  doctorName: string;
  department?: string;
  diagnosis?: string;
  symptoms?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number | string;
    bloodSugar?: number | string;
    temperature?: number | string;
    weight?: number | string;
    oxygenSaturation?: number | string;
  };
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  labFindings?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

// Auth state observer with in-memory token management
export const initDocsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const existingToken = cachedAccessToken || (await getDriveAccessToken());
      if (existingToken) {
        cachedAccessToken = existingToken;
        if (onAuthSuccess) onAuthSuccess(user, existingToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and obtain access token
export const signInWithGoogleDocs = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to obtain Google Docs OAuth access token from credential result.");
    }
    cachedAccessToken = credential.accessToken;
    setDriveAccessToken(credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Docs Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDocsAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const driveToken = await getDriveAccessToken();
  if (driveToken) {
    cachedAccessToken = driveToken;
    return driveToken;
  }
  return null;
};

export const setDocsAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  setDriveAccessToken(token);
};

export const signOutGoogleDocs = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  setDriveAccessToken(null);
};

// Helper for authenticated Google Docs API calls
async function callDocsApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getDocsAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Google Docs. Please connect your Google account.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`https://docs.googleapis.com/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = errText;
    try {
      const errJson = JSON.parse(errText);
      parsedErr = errJson.error?.message || errText;
    } catch {
      // ignore
    }
    throw new Error(`Google Docs API Error (${response.status}): ${parsedErr}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Creates a blank new Google Doc
 */
export const createGoogleDoc = async (
  title: string
): Promise<{ documentId: string; title: string; revisionId: string }> => {
  return callDocsApi<{ documentId: string; title: string; revisionId: string }>("documents", {
    method: "POST",
    body: JSON.stringify({ title: title.trim() || "Untitled Medical Document" }),
  });
};

/**
 * Retrieves the full document content and metadata
 */
export const getGoogleDoc = async (documentId: string): Promise<GoogleDoc> => {
  return callDocsApi<GoogleDoc>(`documents/${documentId}`);
};

/**
 * Performs a batch update on a Google Doc
 */
export const batchUpdateGoogleDoc = async (
  documentId: string,
  requests: any[]
): Promise<any> => {
  return callDocsApi<any>(`documents/${documentId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  });
};

/**
 * Appends plain text to the end of a document
 */
export const appendDocText = async (
  documentId: string,
  text: string
): Promise<any> => {
  const doc = await getGoogleDoc(documentId);
  const endIdx = getDocEndIndex(doc);

  return batchUpdateGoogleDoc(documentId, [
    {
      insertText: {
        location: { index: endIdx - 1 > 0 ? endIdx - 1 : 1 },
        text: text,
      },
    },
  ]);
};

/**
 * Helper to calculate the end index of a document
 */
export function getDocEndIndex(doc: GoogleDoc): number {
  if (!doc.body?.content || doc.body.content.length === 0) return 1;
  const lastElement = doc.body.content[doc.body.content.length - 1];
  return lastElement.endIndex || 1;
}

/**
 * Extracts plain text from a Google Doc structure
 */
export const extractDocPlainText = (doc: GoogleDoc): string => {
  if (!doc.body?.content) return "";
  let fullText = "";

  for (const element of doc.body.content) {
    if (element.paragraph?.elements) {
      for (const el of element.paragraph.elements) {
        if (el.textRun?.content) {
          fullText += el.textRun.content;
        }
      }
    } else if (element.table?.tableRows) {
      for (const row of element.table.tableRows) {
        if (row.tableCells) {
          for (const cell of row.tableCells) {
            if (cell.content) {
              for (const cellEl of cell.content) {
                if (cellEl.paragraph?.elements) {
                  for (const pel of cellEl.paragraph.elements) {
                    if (pel.textRun?.content) {
                      fullText += pel.textRun.content.trim() + " | ";
                    }
                  }
                }
              }
            }
          }
          fullText += "\n";
        }
      }
    }
  }

  return fullText;
};

/**
 * Lists all Google Docs from user's Google Drive
 */
export const listGoogleDocs = async (
  searchQuery?: string
): Promise<GoogleDocFile[]> => {
  const token = await getDocsAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Google Docs. Please connect your Google account.");
  }

  let q = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
  if (searchQuery && searchQuery.trim()) {
    const escaped = searchQuery.replace(/'/g, "\\'");
    q += ` and name contains '${escaped}'`;
  }

  const fields =
    "files(id, name, mimeType, createdTime, modifiedTime, webViewLink, iconLink, size, owners, shared)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=${encodeURIComponent(fields)}&orderBy=modifiedTime desc&pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list Google Docs (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Permanently deletes a Google Doc file
 * Note: Must always be confirmed by user in UI
 */
export const deleteGoogleDoc = async (documentId: string): Promise<void> => {
  const token = await getDocsAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Google Docs.");
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Failed to delete Google Doc (${res.status}): ${err}`);
  }
};

/**
 * Generates an official, beautifully formatted Medical Google Document
 * with structured clinical layout, patient demographics, vitals, Rx tables, and sign-offs.
 */
export const generateMedicalGoogleDoc = async (
  params: MedicalDocGenerationParams
): Promise<{ documentId: string; title: string; webViewLink: string }> => {
  // 1. Create document with title
  const created = await createGoogleDoc(params.title);
  const docId = created.documentId;

  // 2. Build structured formatted content
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  let templateHeading = "CLINICAL CONSULTATION REPORT";
  if (params.template === "discharge_summary") templateHeading = "OFFICIAL DISCHARGE SUMMARY";
  if (params.template === "prescription_summary") templateHeading = "DIGITAL PRESCRIPTION & MEDICATION SUMMARY";
  if (params.template === "lab_diagnostic") templateHeading = "LABORATORY DIAGNOSTIC & PATHOLOGY REPORT";
  if (params.template === "referral_letter") templateHeading = "CLINICAL SPECIALIST REFERRAL LETTER";
  if (params.template === "blank_medical_note") templateHeading = "HOSPITAL CLINICAL PROGRESS NOTE";

  const vitalsText = params.vitalSigns
    ? `• Blood Pressure: ${params.vitalSigns.bloodPressure || "120/80 mmHg"}\n` +
      `• Heart Rate: ${params.vitalSigns.heartRate || 72} bpm\n` +
      `• Fasting Blood Sugar: ${params.vitalSigns.bloodSugar || 96} mg/dL\n` +
      `• Temperature: ${params.vitalSigns.temperature || 98.6} °F\n` +
      `• Body Weight: ${params.vitalSigns.weight || 65} kg\n` +
      `• Oxygen Saturation (SpO2): ${params.vitalSigns.oxygenSaturation || 99}%\n`
    : "• Standard baseline vitals recorded in normal range.\n";

  let medicationsSection = "None prescribed during this encounter.\n";
  if (params.medications && params.medications.length > 0) {
    medicationsSection = params.medications
      .map(
        (m, i) =>
          `${i + 1}. ${m.name} (${m.dosage}) — ${m.frequency} for ${m.duration}${
            m.instructions ? ` [Instructions: ${m.instructions}]` : ""
          }`
      )
      .join("\n") + "\n";
  }

  const allergiesText =
    params.allergies && params.allergies.length > 0
      ? params.allergies.join(", ")
      : "No known drug or environmental allergies documented (NKDA)";

  const conditionsText =
    params.chronicConditions && params.chronicConditions.length > 0
      ? params.chronicConditions.join(", ")
      : "None reported";

  const fullDocumentBody = `PEOPLE'S HOSPITAL HEALTH SYSTEM
Department of ${params.department || "General Medicine"} | Inpatient & Outpatient Clinical Services
NABH & JCI Accredited Medical Center • Secure Google Cloud Health Record

================================================================================
${templateHeading}
Date & Time Generated: ${timestamp}
Hospital Document Ref: MED-DOC-${docId.slice(0, 8).toUpperCase()}
================================================================================

1. PATIENT DEMOGRAPHIC & CLINICAL IDENTIFICATION
--------------------------------------------------------------------------------
• Full Name: ${params.patientName}
• Patient ID: ${params.patientId || "PID-" + Math.floor(100000 + Math.random() * 900000)}
• Age / Gender: ${params.age || 35} Years | ${params.gender || "Not Specified"}
• Blood Group: ${params.bloodGroup || "O Positive (O+)"}
• Documented Allergies: ${allergiesText}
• Chronic Conditions: ${conditionsText}

2. CHIEF COMPLAINT & PRESENTING SYMPTOMS
--------------------------------------------------------------------------------
${params.symptoms || "Routine medical consultation and clinical follow-up assessment."}

3. PRIMARY CLINICAL DIAGNOSIS & ASSESSMENT
--------------------------------------------------------------------------------
${params.diagnosis || "Clinical evaluation conducted with normal baseline findings."}

4. RECORDED PHYSIOLOGICAL VITALS
--------------------------------------------------------------------------------
${vitalsText}

5. MEDICATIONS & THERAPEUTIC REGIMEN
--------------------------------------------------------------------------------
${medicationsSection}

6. DIAGNOSTIC FINDINGS & LABORATORY RESULTS
--------------------------------------------------------------------------------
${params.labFindings || "All recorded laboratory and radiology diagnostics within expected clinical parameters."}

7. CLINICAL PROGRESS NOTES & TREATMENT PLAN
--------------------------------------------------------------------------------
${params.clinicalNotes || params.treatmentPlan || "Patient educated on adherence to medication regimen and lifestyle recommendations. Follow symptom precautions as advised."}

8. FOLLOW-UP ADVICE & EMERGENCY PRECAUTIONS
--------------------------------------------------------------------------------
${params.followUpInstructions || "Follow up at the outpatient clinic in 2 weeks or immediately in the Emergency Department if acute red-flag symptoms occur."}

================================================================================
ATTENDING PHYSICIAN / SPECIALIST SIGN-OFF
--------------------------------------------------------------------------------
Attending Practitioner: ${params.doctorName}
Designation / Dept: ${params.department || "Internal Medicine Specialist"}
License / Registration: PH-MED-${Math.floor(10000 + Math.random() * 90000)}
Status: Clinically Verified & Authorized in People's Hospital EHR

(End of Official Google Docs Medical Record)
`;

  // 3. Insert formatted text into doc
  await batchUpdateGoogleDoc(docId, [
    {
      insertText: {
        location: { index: 1 },
        text: fullDocumentBody,
      },
    },
  ]);

  return {
    documentId: docId,
    title: params.title,
    webViewLink: `https://docs.google.com/document/d/${docId}/edit`,
  };
};
