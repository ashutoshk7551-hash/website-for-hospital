import { auth, getDriveAccessToken, setDriveAccessToken, signInWithGoogleDrive } from "./googleDriveService";
import { User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export const GMAIL_SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.addons.current.action.compose",
  "https://www.googleapis.com/auth/gmail.addons.current.message.action",
  "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
  "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.insert",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/gmail.settings.sharing",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.appdata",
];

const gmailProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => gmailProvider.addScope(scope));
gmailProvider.setCustomParameters({
  prompt: "select_account",
});

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: string;
  messageListVisibility?: string;
  labelListVisibility?: string;
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers?: GmailMessageHeader[];
  body?: {
    size: number;
    data?: string;
    attachmentId?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId?: string;
  internalDate: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  isUnread?: boolean;
  isStarred?: boolean;
  isImportant?: boolean;
  bodyHtml?: string;
  bodyText?: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

/**
 * Sign in with Google with complete Gmail and Workspace scopes
 */
export const signInWithGmail = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    const result = await signInWithPopup(auth, gmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to obtain Gmail OAuth access token from credential result.");
    }
    setDriveAccessToken(credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error("Gmail OAuth Sign-In Error:", error);
    throw error;
  }
};

export const signOutGmail = async (): Promise<void> => {
  await signOut(auth);
  setDriveAccessToken(null);
};

/**
 * Helper to call Gmail REST API v1
 */
async function callGmailApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Gmail. Please sign in with your Google account.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
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
    throw new Error(`Gmail API Error (${response.status}): ${parsedErr}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Get the user's Gmail profile
 */
export const getGmailProfile = async (): Promise<GmailProfile> => {
  return callGmailApi<GmailProfile>("profile");
};

/**
 * List all Gmail labels
 */
export const listGmailLabels = async (): Promise<GmailLabel[]> => {
  const res = await callGmailApi<{ labels: GmailLabel[] }>("labels");
  return res.labels || [];
};

/**
 * Decode Base64URL string
 */
function decodeBase64Url(data: string): string {
  try {
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    try {
      return atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    } catch {
      return data;
    }
  }
}

/**
 * Extract body text and html recursively from payload parts
 */
function extractMessageBody(payload: any): { html?: string; text?: string } {
  let html = "";
  let text = "";

  if (!payload) return { html, text };

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === "text/html") {
      html += decoded;
    } else if (payload.mimeType === "text/plain") {
      text += decoded;
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        html += decodeBase64Url(part.body.data);
      } else if (part.mimeType === "text/plain" && part.body?.data) {
        text += decodeBase64Url(part.body.data);
      } else if (part.parts) {
        const sub = extractMessageBody(part);
        if (sub.html) html += sub.html;
        if (sub.text) text += sub.text;
      }
    }
  }

  return { html, text };
}

/**
 * Parse a raw Gmail API message item into a typed summary
 */
export function parseGmailMessage(raw: any): GmailMessageSummary {
  const headers: GmailMessageHeader[] = raw.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

  const subject = getHeader("Subject") || "(No Subject)";
  const from = getHeader("From") || "Unknown Sender";
  const to = getHeader("To") || "";
  const date = getHeader("Date") || new Date(parseInt(raw.internalDate || "0", 10)).toLocaleString();

  const labels: string[] = raw.labelIds || [];
  const isUnread = labels.includes("UNREAD");
  const isStarred = labels.includes("STARRED");
  const isImportant = labels.includes("IMPORTANT");

  const { html, text } = extractMessageBody(raw.payload);

  return {
    id: raw.id,
    threadId: raw.threadId,
    labelIds: labels,
    snippet: raw.snippet || "",
    historyId: raw.historyId,
    internalDate: raw.internalDate || "0",
    subject,
    from,
    to,
    date,
    isUnread,
    isStarred,
    isImportant,
    bodyHtml: html || undefined,
    bodyText: text || raw.snippet || "",
  };
}

/**
 * List messages with optional search query (e.g. 'is:unread', 'from:hospital', 'label:INBOX')
 */
export const listGmailMessages = async (
  query = "",
  labelIds: string[] = ["INBOX"],
  maxResults = 25,
  pageToken?: string
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate?: number }> => {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (labelIds && labelIds.length > 0) {
    labelIds.forEach((lbl) => params.append("labelIds", lbl));
  }
  params.set("maxResults", maxResults.toString());
  if (pageToken) params.set("pageToken", pageToken);

  const endpoint = `messages?${params.toString()}`;
  const rawList = await callGmailApi<{
    messages?: { id: string; threadId: string }[];
    nextPageToken?: string;
    resultSizeEstimate?: number;
  }>(endpoint);

  if (!rawList.messages || rawList.messages.length === 0) {
    return { messages: [], nextPageToken: rawList.nextPageToken, resultSizeEstimate: 0 };
  }

  // Fetch full details for the retrieved messages in parallel (up to maxResults)
  const detailPromises = rawList.messages.map(async (msg) => {
    try {
      const full = await callGmailApi<any>(`messages/${msg.id}?format=full`);
      return parseGmailMessage(full);
    } catch (e) {
      console.warn(`Failed to fetch message ${msg.id}:`, e);
      return null;
    }
  });

  const resolved = await Promise.all(detailPromises);
  const validMessages = resolved.filter((m): m is GmailMessageSummary => m !== null);

  return {
    messages: validMessages,
    nextPageToken: rawList.nextPageToken,
    resultSizeEstimate: rawList.resultSizeEstimate,
  };
};

/**
 * Get a single Gmail message by ID
 */
export const getGmailMessage = async (messageId: string): Promise<GmailMessageSummary> => {
  const raw = await callGmailApi<any>(`messages/${messageId}?format=full`);
  return parseGmailMessage(raw);
};

/**
 * Encode an email payload to RFC 2822 base64url format
 */
function createRawEmail(payload: SendEmailPayload): string {
  const boundary = "boundary_" + Math.random().toString(36).substring(2);
  const lines: string[] = [
    `To: ${payload.to}`,
    payload.cc ? `Cc: ${payload.cc}` : "",
    payload.bcc ? `Bcc: ${payload.bcc}` : "",
    payload.replyTo ? `Reply-To: ${payload.replyTo}` : "",
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    payload.bodyText || payload.bodyHtml.replace(/<[^>]*>?/gm, ""),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    payload.bodyHtml,
    "",
    `--${boundary}--`,
  ].filter((line) => line !== "");

  const emailRaw = lines.join("\r\n");
  // Convert string to base64url
  const encoded = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encoded;
}

/**
 * Send an email via Gmail API
 * (Caller MUST show confirmation dialog before calling this mutating operation)
 */
export const sendGmailEmail = async (
  payload: SendEmailPayload
): Promise<{ id: string; threadId: string; labelIds: string[] }> => {
  const raw = createRawEmail(payload);
  return callGmailApi<{ id: string; threadId: string; labelIds: string[] }>("messages/send", {
    method: "POST",
    body: JSON.stringify({ raw }),
  });
};

/**
 * Create a draft email in Gmail
 */
export const createGmailDraft = async (
  payload: SendEmailPayload
): Promise<{ id: string; message: GmailMessageSummary }> => {
  const raw = createRawEmail(payload);
  const res = await callGmailApi<{ id: string; message: any }>("drafts", {
    method: "POST",
    body: JSON.stringify({ message: { raw } }),
  });
  return {
    id: res.id,
    message: parseGmailMessage(res.message),
  };
};

/**
 * Modify message labels (e.g. mark read, unread, star, unstar, archive)
 */
export const modifyGmailMessageLabels = async (
  messageId: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = []
): Promise<GmailMessageSummary> => {
  const updated = await callGmailApi<any>(`messages/${messageId}/modify`, {
    method: "POST",
    body: JSON.stringify({
      addLabelIds,
      removeLabelIds,
    }),
  });
  return parseGmailMessage(updated);
};

/**
 * Permanently delete an email message
 * (Caller MUST show confirmation dialog first)
 */
export const deleteGmailMessage = async (messageId: string): Promise<void> => {
  await callGmailApi<void>(`messages/${messageId}`, {
    method: "DELETE",
  });
};

/**
 * Move message to Trash
 */
export const trashGmailMessage = async (messageId: string): Promise<GmailMessageSummary> => {
  const updated = await callGmailApi<any>(`messages/${messageId}/trash`, {
    method: "POST",
  });
  return parseGmailMessage(updated);
};

/**
 * Untrash message
 */
export const untrashGmailMessage = async (messageId: string): Promise<GmailMessageSummary> => {
  const updated = await callGmailApi<any>(`messages/${messageId}/untrash`, {
    method: "POST",
  });
  return parseGmailMessage(updated);
};
