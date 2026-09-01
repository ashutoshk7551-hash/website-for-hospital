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

// Configure Google Auth Provider with Google Drive and Gmail scopes
export const WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.appdata",
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
];

export const DRIVE_SCOPES = WORKSPACE_SCOPES;

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: "select_account",
});

// Cache the access token in memory only (NEVER in localStorage/sessionStorage as per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
  starred?: boolean;
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
  user?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
}

export interface DriveFolder {
  id: string;
  name: string;
}

// Auth state observer with in-memory token management
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try getting token or prompt
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and obtain access token
export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to obtain Google Drive OAuth access token from credential result.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Drive Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setDriveAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper for authenticated Google Drive API calls
async function callDriveApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Google Drive. Please connect your Google account.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/${endpoint}`, {
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
    throw new Error(`Google Drive API Error (${response.status}): ${parsedErr}`);
  }

  // If 204 No Content (e.g. DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * List files from Google Drive with optional search query, folder filter, and pagination
 */
export const listDriveFiles = async (
  queryText?: string,
  parentFolderId?: string,
  pageSize = 50
): Promise<{ files: DriveFile[]; nextPageToken?: string }> => {
  const queryParts: string[] = ["trashed = false"];

  if (parentFolderId) {
    queryParts.push(`'${parentFolderId}' in parents`);
  }

  if (queryText && queryText.trim()) {
    const escaped = queryText.replace(/'/g, "\\'");
    queryParts.push(
      `(name contains '${escaped}' or fullText contains '${escaped}' or description contains '${escaped}')`
    );
  }

  const q = encodeURIComponent(queryParts.join(" and "));
  const fields = encodeURIComponent(
    "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents, description, starred)"
  );
  const endpoint = `files?q=${q}&pageSize=${pageSize}&orderBy=modifiedTime desc&fields=${fields}`;

  return callDriveApi<{ files: DriveFile[]; nextPageToken?: string }>(endpoint);
};

/**
 * Fetch Storage Quota and User Info from Google Drive
 */
export const getDriveStorageQuota = async (): Promise<DriveStorageQuota> => {
  const endpoint = "about?fields=user,storageQuota";
  const result = await callDriveApi<{ user?: any; storageQuota?: any }>(endpoint);
  return {
    limit: result.storageQuota?.limit,
    usage: result.storageQuota?.usage,
    usageInDrive: result.storageQuota?.usageInDrive,
    usageInDriveTrash: result.storageQuota?.usageInDriveTrash,
    user: result.user
      ? {
          displayName: result.user.displayName,
          emailAddress: result.user.emailAddress,
          photoLink: result.user.photoLink,
        }
      : undefined,
  };
};

/**
 * Create or locate the dedicated 'PharmaCare 360 Medical Vault' folder in Google Drive
 */
export const getOrCreateMedicalVaultFolder = async (
  folderName = "PharmaCare 360 Medical Vault"
): Promise<DriveFolder> => {
  // Check if exists
  const search = await listDriveFiles(folderName);
  const existing = search.files?.find(
    (f) => f.name === folderName && f.mimeType === "application/vnd.google-apps.folder"
  );

  if (existing) {
    return { id: existing.id, name: existing.name };
  }

  // Create folder
  return createDriveFolder(folderName);
};

/**
 * Create a new folder in Google Drive
 */
export const createDriveFolder = async (
  folderName: string,
  parentFolderId?: string
): Promise<DriveFolder> => {
  const body: any = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentFolderId) {
    body.parents = [parentFolderId];
  }

  const created = await callDriveApi<DriveFile>("files?fields=id,name", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return { id: created.id, name: created.name };
};

/**
 * Upload a standard local File or Blob to Google Drive using multipart upload
 */
export const uploadFileToDrive = async (
  file: File | Blob,
  fileName: string,
  mimeType: string,
  parentFolderId?: string,
  description?: string
): Promise<DriveFile> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error("Authentication required to upload to Google Drive");
  }

  const metadata: any = {
    name: fileName,
    mimeType: mimeType || "application/octet-stream",
    description: description || "Uploaded from PharmaCare 360 Healthcare System",
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const reader = new FileReader();

  return new Promise<DriveFile>((resolve, reject) => {
    reader.onload = async () => {
      try {
        const fileContent = reader.result as ArrayBuffer;
        const metadataPart =
          delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata);

        const dataPart =
          delimiter +
          `Content-Type: ${mimeType}\r\n` +
          "Content-Transfer-Encoding: base64\r\n\r\n";

        // Convert arrayBuffer to base64
        let binary = "";
        const bytes = new Uint8Array(fileContent);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        const multipartRequestBody =
          metadataPart + dataPart + base64Data + closeDelim;

        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,createdTime",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body: multipartRequestBody,
          }
        );

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Failed to upload file to Google Drive: ${err}`);
        }

        const data: DriveFile = await response.json();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Upload structured JSON Medical Record / Prescription / Lab Test to Google Drive
 */
export const uploadMedicalRecordToDrive = async (
  title: string,
  recordData: any,
  recordType: "EHR_SUMMARY" | "PRESCRIPTION" | "LAB_RESULT" | "EMERGENCY_INTAKE" | "CLINICAL_NOTE",
  parentFolderId?: string
): Promise<DriveFile> => {
  const formattedContent = {
    system: "PharmaCare 360 Connected Health Network",
    exportedAt: new Date().toISOString(),
    recordType,
    title,
    data: recordData,
  };

  const jsonString = JSON.stringify(formattedContent, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const filename = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`;

  return uploadFileToDrive(
    blob,
    filename,
    "application/json",
    parentFolderId,
    `Medical Document: ${title} (${recordType})`
  );
};

/**
 * Delete a file or folder from Google Drive
 * (Caller MUST show confirmation dialog first)
 */
export const deleteDriveFile = async (fileId: string): Promise<void> => {
  await callDriveApi<void>(`files/${fileId}`, {
    method: "DELETE",
  });
};

/**
 * Star or unstar a file in Google Drive
 */
export const toggleStarDriveFile = async (fileId: string, starred: boolean): Promise<DriveFile> => {
  return callDriveApi<DriveFile>(`files/${fileId}?fields=id,name,starred`, {
    method: "PATCH",
    body: JSON.stringify({ starred }),
  });
};
