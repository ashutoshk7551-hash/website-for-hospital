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

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// All Google Workspace Scopes configured for the application
export const WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/presentations.readonly",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/tasks.readonly",
  "https://www.googleapis.com/auth/chat.messages",
  "https://www.googleapis.com/auth/chat.spaces",
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/forms.responses.readonly",
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: "select_account",
});

// Cache the access token in memory ONLY (never localStorage/sessionStorage as mandated)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleWorkspaceSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to obtain OAuth access token from Google sign in");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Workspace Sign-in Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getWorkspaceAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const workspaceLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ==========================================
// 1. GOOGLE SHEETS API
// ==========================================
export interface GoogleSpreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
    timeZone?: string;
  };
  sheets?: Array<{
    properties: {
      sheetId: number;
      title: string;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
  spreadsheetUrl: string;
}

export async function createHospitalSpreadsheet(
  title: string,
  initialHeaders: string[][] = [["Timestamp", "Patient ID", "Patient Name", "Department", "Doctor", "Vitals / Notes"]]
): Promise<GoogleSpreadsheet> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title: `People's Hospital - ${title}` },
      sheets: [
        {
          properties: { title: "Clinical Registry" },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: initialHeaders.map((row) => ({
                values: row.map((val) => ({ userEnteredValue: { stringValue: val } })),
              })),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to create Google Sheet");
  }
  return response.json();
}

export async function appendSpreadsheetRow(
  spreadsheetId: string,
  range: string = "Clinical Registry!A:F",
  values: (string | number)[][]
): Promise<any> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to append spreadsheet data");
  }
  return response.json();
}

export async function getSpreadsheetValues(
  spreadsheetId: string,
  range: string = "Clinical Registry!A1:Z100"
): Promise<string[][]> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to read Google Sheet values");
  }
  const data = await response.json();
  return data.values || [];
}

// ==========================================
// 2. GOOGLE CALENDAR API
// ==========================================
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
}

export async function listCalendarEvents(maxResults: number = 20): Promise<GoogleCalendarEvent[]> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to fetch Google Calendar events");
  }
  const data = await response.json();
  return data.items || [];
}

export async function createCalendarEvent(event: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail?: string;
}): Promise<GoogleCalendarEvent> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const payload: any = {
    summary: event.summary,
    description: event.description,
    location: event.location || "People's Hospital & Research Center",
    start: { dateTime: new Date(event.startDateTime).toISOString() },
    end: { dateTime: new Date(event.endDateTime).toISOString() },
  };

  if (event.attendeeEmail) {
    payload.attendees = [{ email: event.attendeeEmail }];
  }

  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to create Google Calendar event");
  }
  return response.json();
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to delete Calendar event");
  }
}

// ==========================================
// 3. GOOGLE SLIDES API
// ==========================================
export interface GooglePresentation {
  presentationId: string;
  title: string;
  slides?: Array<{ objectId: string }>;
  webViewLink?: string;
}

export async function createPresentation(title: string): Promise<GooglePresentation> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch("https://slides.googleapis.com/v1/presentations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: `People's Hospital Clinical Case - ${title}` }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to create Google Slides presentation");
  }
  return response.json();
}

export async function addSlideToPresentation(presentationId: string, slideTitle: string, bulletPoints: string[]): Promise<any> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const slideId = `slide_${Date.now()}`;
  const titleBoxId = `title_${Date.now()}`;
  const bodyBoxId = `body_${Date.now()}`;

  const requests = [
    {
      createSlide: {
        objectId: slideId,
        insertionIndex: 1,
        slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
      },
    },
    {
      createShape: {
        objectId: titleBoxId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 600, unit: "PT" }, height: { magnitude: 60, unit: "PT" } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: "PT" },
        },
      },
    },
    {
      insertText: {
        objectId: titleBoxId,
        text: slideTitle,
      },
    },
    {
      createShape: {
        objectId: bodyBoxId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 600, unit: "PT" }, height: { magnitude: 300, unit: "PT" } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 100, unit: "PT" },
        },
      },
    },
    {
      insertText: {
        objectId: bodyBoxId,
        text: bulletPoints.map((pt) => `• ${pt}`).join("\n"),
      },
    },
  ];

  const response = await fetch(`https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to update Google Slides");
  }
  return response.json();
}

// ==========================================
// 4. GOOGLE TASKS API
// ==========================================
export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string;
  updated?: string;
}

export async function listGoogleTasks(): Promise<GoogleTask[]> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch("https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&showHidden=true", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to list Google Tasks");
  }
  const data = await response.json();
  return data.items || [];
}

export async function createGoogleTask(title: string, notes?: string, dueDate?: string): Promise<GoogleTask> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const body: any = { title, notes };
  if (dueDate) {
    body.due = new Date(dueDate).toISOString();
  }

  const response = await fetch("https://tasks.googleapis.com/tasks/v1/lists/@default/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to create Google Task");
  }
  return response.json();
}

export async function toggleGoogleTaskStatus(taskId: string, currentStatus: "needsAction" | "completed"): Promise<GoogleTask> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const newStatus = currentStatus === "completed" ? "needsAction" : "completed";
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to update Google Task");
  }
  return response.json();
}

export async function deleteGoogleTask(taskId: string): Promise<void> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${encodeURIComponent(taskId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to delete Google Task");
  }
}

// ==========================================
// 5. GOOGLE CHAT API
// ==========================================
export interface GoogleChatSpace {
  name: string;
  displayName: string;
  type: string;
}

export interface GoogleChatMessage {
  name: string;
  text: string;
  createTime?: string;
  sender?: { displayName?: string; email?: string };
}

export async function listChatSpaces(): Promise<GoogleChatSpace[]> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch("https://chat.googleapis.com/v1/spaces", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.warn("Chat spaces list info:", err);
    return [];
  }
  const data = await response.json();
  return data.spaces || [];
}

export async function sendChatMessage(spaceName: string, text: string): Promise<GoogleChatMessage> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to send Google Chat message");
  }
  return response.json();
}

// ==========================================
// 6. GOOGLE FORMS API
// ==========================================
export interface GoogleFormItem {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri?: string;
}

export async function createGoogleForm(title: string, description: string): Promise<GoogleFormItem> {
  const token = await getWorkspaceAccessToken();
  if (!token) throw new Error("Google Workspace authentication required.");

  const response = await fetch("https://forms.googleapis.com/v1/forms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: {
        title: `People's Hospital - ${title}`,
        documentTitle: `Patient Survey: ${title}`,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to create Google Form");
  }
  return response.json();
}

// ==========================================
// 7. CLINICAL KEEP NOTES / SCRATCHPAD
// ==========================================
export interface ClinicalKeepNote {
  id: string;
  title: string;
  body: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

const LOCAL_KEEP_KEY = "hospital_clinical_keep_notes";

export function getLocalKeepNotes(): ClinicalKeepNote[] {
  try {
    const saved = localStorage.getItem(LOCAL_KEEP_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: "note-1",
      title: "ICU Morning Handover",
      body: "Check Bed 4 potassium levels post-dialysis at 11:30 AM. Dr. Sharma attending.",
      color: "amber",
      pinned: true,
      createdAt: new Date().toLocaleDateString(),
    },
    {
      id: "note-2",
      title: "Pharmacy Insulin Protocol",
      body: "Ensure cold chain verification logged for NovoRapid batch #NR-2026 before dispatch to ward 3.",
      color: "emerald",
      pinned: false,
      createdAt: new Date().toLocaleDateString(),
    },
    {
      id: "note-3",
      title: "Discharge Checklist - PAT-1024",
      body: "Finalize prescription counseling with pharmacist. Verify blood pressure < 130/85.",
      color: "sky",
      pinned: false,
      createdAt: new Date().toLocaleDateString(),
    },
  ];
}

export function saveLocalKeepNotes(notes: ClinicalKeepNote[]): void {
  localStorage.setItem(LOCAL_KEEP_KEY, JSON.stringify(notes));
}
