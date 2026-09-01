import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  listDriveFiles,
  getDriveStorageQuota,
  getOrCreateMedicalVaultFolder,
  createDriveFolder,
  uploadFileToDrive,
  uploadMedicalRecordToDrive,
  deleteDriveFile,
  toggleStarDriveFile,
  DriveFile,
  DriveStorageQuota,
  DriveFolder,
} from "../../services/googleDriveService";
import { DriveDestructiveConfirmModal } from "./DriveDestructiveConfirmModal";
import { BackButton } from "../common/BackButton";
import {
  HardDrive,
  FolderPlus,
  Folder,
  FileText,
  FileCode,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Trash2,
  Star,
  RefreshCw,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock,
  User,
  Activity,
  HeartPulse,
  Pill,
  TestTube2,
  Database,
  ArrowRight,
  Eye,
  X,
  Plus,
} from "lucide-react";

export const GoogleDriveVault: React.FC = () => {
  const {
    patients,
    currentPatient,
    currentPatientId,
    prescriptions,
    labTests,
    driveUser,
    driveAccessToken,
    setDriveAuth,
    showToast,
    openPatientAuth,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [storageQuota, setStorageQuota] = useState<DriveStorageQuota | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "ehr" | "rx" | "lab" | "folder" | "pdf">("all");
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);
  const [vaultFolder, setVaultFolder] = useState<DriveFolder | null>(null);

  // Sync state
  const [isSyncingPatient, setIsSyncingPatient] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // New folder modal
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Upload file state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Destructive delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview modal
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  const activePatient = currentPatient || patients[0];

  // Load files and quota when authenticated
  const fetchDriveData = async () => {
    if (!driveAccessToken) return;

    try {
      setIsLoading(true);
      // Get or create vault folder
      const vault = await getOrCreateMedicalVaultFolder("PharmaCare 360 Medical Vault");
      setVaultFolder(vault);

      const targetFolderId = currentFolder?.id || vault.id;

      // Fetch files
      const result = await listDriveFiles(searchQuery, targetFolderId);
      setFiles(result.files || []);

      // Fetch quota
      const quota = await getDriveStorageQuota();
      setStorageQuota(quota);
    } catch (err: any) {
      console.error("Error fetching Google Drive files:", err);
      showToast(`Drive fetch error: ${err.message || "Failed to load files"}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (driveAccessToken) {
      fetchDriveData();
    }
  }, [driveAccessToken, currentFolder?.id, searchQuery]);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      const res = await signInWithGoogleDrive();
      if (res) {
        setDriveAuth(res.user, res.accessToken);
        showToast(`Connected to Google Drive as ${res.user.email}`);
      }
    } catch (err: any) {
      console.error("Google Drive connection error:", err);
      showToast(`Connection failed: ${err.message || "Google Sign-In was cancelled."}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogleDrive();
      setDriveAuth(null, null);
      setFiles([]);
      setStorageQuota(null);
      setVaultFolder(null);
      setCurrentFolder(null);
      showToast("Signed out of Google Drive.");
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !driveAccessToken) return;

    try {
      setIsCreatingFolder(true);
      const parentId = currentFolder?.id || vaultFolder?.id;
      const created = await createDriveFolder(newFolderName.trim(), parentId);
      showToast(`Created folder "${created.name}" in Google Drive`);
      setNewFolderName("");
      setFolderModalOpen(false);
      fetchDriveData();
    } catch (err: any) {
      console.error("Failed to create folder:", err);
      showToast(`Folder creation failed: ${err.message}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !driveAccessToken) return;

    try {
      setIsUploading(true);
      const parentId = currentFolder?.id || vaultFolder?.id;
      const uploaded = await uploadFileToDrive(
        file,
        file.name,
        file.type,
        parentId,
        `Uploaded medical file for ${activePatient ? activePatient.name : "Patient"}`
      );
      showToast(`Uploaded "${uploaded.name}" to Google Drive`);
      fetchDriveData();
    } catch (err: any) {
      console.error("Upload failed:", err);
      showToast(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSyncPatientToDrive = async () => {
    if (!activePatient || !driveAccessToken) return;

    try {
      setIsSyncingPatient(true);
      setSyncSuccessMessage(null);

      const targetFolderId = vaultFolder?.id;

      // 1. Export Complete EHR Summary
      const ehrSummary = {
        patient: activePatient,
        exportedAt: new Date().toISOString(),
        vitals: activePatient.recentVitals,
        allergies: activePatient.allergies,
        chronicConditions: activePatient.chronicConditions,
      };

      await uploadMedicalRecordToDrive(
        `EHR_Summary_${activePatient.name.replace(/\s+/g, "_")}`,
        ehrSummary,
        "EHR_SUMMARY",
        targetFolderId
      );

      // 2. Export Active Prescriptions
      const patientPrescriptions = prescriptions.filter((p) => p.patientId === activePatient.id);
      if (patientPrescriptions.length > 0) {
        await uploadMedicalRecordToDrive(
          `Rx_History_${activePatient.name.replace(/\s+/g, "_")}`,
          { prescriptions: patientPrescriptions, count: patientPrescriptions.length },
          "PRESCRIPTION",
          targetFolderId
        );
      }

      // 3. Export Lab Diagnostic Reports
      const patientLabs = labTests.filter((l) => l.patientId === activePatient.id);
      if (patientLabs.length > 0) {
        await uploadMedicalRecordToDrive(
          `Lab_Diagnostics_${activePatient.name.replace(/\s+/g, "_")}`,
          { labTests: patientLabs, count: patientLabs.length },
          "LAB_RESULT",
          targetFolderId
        );
      }

      setSyncSuccessMessage(
        `Successfully synced ${activePatient.name}'s EHR Summary, ${patientPrescriptions.length} Prescriptions, and ${patientLabs.length} Lab Reports to Google Drive!`
      );
      showToast(`Synced ${activePatient.name}'s Medical Vault to Google Drive`);
      fetchDriveData();
    } catch (err: any) {
      console.error("Sync error:", err);
      showToast(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingPatient(false);
    }
  };

  const handleDeleteFile = (file: DriveFile) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      setIsDeleting(true);
      await deleteDriveFile(fileToDelete.id);
      showToast(`Deleted "${fileToDelete.name}" from Google Drive`);
      setDeleteModalOpen(false);
      setFileToDelete(null);
      fetchDriveData();
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStar = async (file: DriveFile) => {
    try {
      const updated = await toggleStarDriveFile(file.id, !file.starred);
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, starred: updated.starred } : f))
      );
    } catch (err: any) {
      console.error("Star toggle error:", err);
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    if (activeFilter === "folder") {
      return f.mimeType === "application/vnd.google-apps.folder";
    }
    if (activeFilter === "ehr") {
      return f.name.toLowerCase().includes("ehr") || f.description?.includes("EHR");
    }
    if (activeFilter === "rx") {
      return f.name.toLowerCase().includes("rx") || f.description?.includes("PRESCRIPTION");
    }
    if (activeFilter === "lab") {
      return f.name.toLowerCase().includes("lab") || f.description?.includes("LAB_RESULT");
    }
    if (activeFilter === "pdf") {
      return f.mimeType === "application/pdf" || f.name.endsWith(".pdf");
    }
    return true;
  });

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return "0 KB";
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return bytesStr;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatQuotaGB = (bytesStr?: string) => {
    if (!bytesStr) return "0 GB";
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return "0 GB";
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const quotaPercent = () => {
    if (!storageQuota?.limit || !storageQuota?.usage) return 0;
    const limit = parseInt(storageQuota.limit, 10);
    const usage = parseInt(storageQuota.usage, 10);
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((usage / limit) * 100));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-300">
              <HardDrive className="w-3.5 h-3.5" />
              Google Drive Health Cloud Vault
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Medical Cloud Storage & EHR Backup
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Seamlessly store, organize, and access electronic medical records, digital prescriptions, lab test reports, and imaging scans directly in your personal Google Drive account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {driveAccessToken && driveUser ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  {driveUser.photoURL ? (
                    <img
                      src={driveUser.photoURL}
                      alt="Google avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    driveUser.email?.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-none">
                    {driveUser.displayName || "Google Account"}
                  </div>
                  <div className="text-[10px] text-blue-200 truncate max-w-[140px]">
                    {driveUser.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-2 text-[10px] bg-red-500/30 hover:bg-red-500/50 text-red-200 font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              /* Official GSI Google Sign In Button */
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button shadow-lg transition hover:scale-102 cursor-pointer"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      style={{ display: "block" }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold text-slate-800 text-xs">
                    {isAuthenticating ? "Connecting..." : "Sign in with Google"}
                  </span>
                  <span style={{ display: "none" }}>Sign in with Google</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {!driveAccessToken ? (
        /* Not Connected Landing State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-inner">
            <HardDrive className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Connect Google Drive to Unlock Cloud Health Records
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              With your permission, this app securely interacts with your Google Drive to store medical documents, sync digital prescriptions, and create portable FHIR/JSON health snapshots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900 text-xs">Prescription Cloud Sync</div>
              <p className="text-[11px] text-slate-500">
                Auto-export doctor prescriptions and medication instructions straight to your Drive folder.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                <TestTube2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900 text-xs">Lab Diagnostic Vault</div>
              <p className="text-[11px] text-slate-500">
                Store blood tests, biochemistry reports, and pathology results securely in one searchable place.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900 text-xs">HIPAA & Privacy Safe</div>
              <p className="text-[11px] text-slate-500">
                You retain complete ownership of your personal data on your own authenticated Google account.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/25 flex items-center gap-2.5 transition hover:scale-102 cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>{isAuthenticating ? "Connecting..." : "Connect Google Drive Now"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Connected Dashboard */
        <div className="space-y-6">
          {/* Quick Actions & Quota Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1-Click Sync Active Patient */}
            <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-teal-800/60 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-500/20 text-teal-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <HeartPulse className="w-3 h-3" />
                  1-Click Medical Sync
                </div>
                <h3 className="text-base font-bold text-white">
                  Sync Patient: {activePatient?.name}
                </h3>
                <p className="text-xs text-teal-200/80 leading-relaxed">
                  Export complete EHR record, active prescriptions, and recent lab diagnostic results directly into your Drive vault.
                </p>
              </div>

              {syncSuccessMessage && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-[11px] text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{syncSuccessMessage}</span>
                </div>
              )}

              <div className="pt-1">
                <button
                  onClick={handleSyncPatientToDrive}
                  disabled={isSyncingPatient}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <UploadCloud className="w-4 h-4 text-slate-950" />
                  <span>{isSyncingPatient ? "Syncing to Drive..." : "Sync Current Patient Records"}</span>
                </button>
              </div>
            </div>

            {/* Storage Quota Widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Google Drive Storage</h3>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {quotaPercent()}% Used
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${quotaPercent()}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Used: {formatQuotaGB(storageQuota?.usage)}</span>
                  <span>Total: {formatQuotaGB(storageQuota?.limit)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Folder: <span className="font-bold text-slate-800">PharmaCare 360 Medical Vault</span></span>
                <button
                  onClick={fetchDriveData}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Direct Upload & Folder Creator */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Cloud Document Upload</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload diagnostic scans, lab PDFs, or external doctor referrals directly to your Google Drive.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.json,.txt,.dcm"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                </button>

                <button
                  onClick={() => setFolderModalOpen(true)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
              </div>
            </div>
          </div>

          {/* Files Browser & Filter Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Filter Bar & Search */}
            <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medical files, prescriptions, lab results in Drive..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <button
                    onClick={() => setCurrentFolder(null)}
                    className={`font-semibold hover:text-blue-600 transition flex items-center gap-1 ${
                      !currentFolder ? "text-blue-600 font-bold" : "text-slate-500"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Vault Root</span>
                  </button>
                  {currentFolder && (
                    <>
                      <span>/</span>
                      <span className="font-bold text-slate-900">{currentFolder.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { id: "all", label: "All Items" },
                  { id: "ehr", label: "EHR Summaries" },
                  { id: "rx", label: "Prescriptions" },
                  { id: "lab", label: "Lab Diagnostic Reports" },
                  { id: "pdf", label: "PDF Documents" },
                  { id: "folder", label: "Folders" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveFilter(chip.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeFilter === chip.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File List Table */}
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div className="text-xs font-semibold text-slate-600">
                  Loading files from Google Drive...
                </div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">No medical files found</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `No files matching "${searchQuery}" in this folder.`
                      : "Sync active patient records or upload files to populate your Google Drive vault."}
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={handleSyncPatientToDrive}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700 transition cursor-pointer"
                  >
                    Sync Current Patient Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredFiles.map((file) => {
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                  const isJson = file.mimeType === "application/json" || file.name.endsWith(".json");
                  const isPdf = file.mimeType === "application/pdf" || file.name.endsWith(".pdf");
                  const isImg = file.mimeType.startsWith("image/");

                  return (
                    <div
                      key={file.id}
                      className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          onClick={() => {
                            if (isFolder) {
                              setCurrentFolder({ id: file.id, name: file.name });
                            }
                          }}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer ${
                            isFolder
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : isPdf
                              ? "bg-red-100 text-red-700"
                              : isJson
                              ? "bg-blue-100 text-blue-700"
                              : isImg
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isFolder ? (
                            <Folder className="w-5 h-5" />
                          ) : isPdf ? (
                            <FileText className="w-5 h-5" />
                          ) : isJson ? (
                            <FileCode className="w-5 h-5" />
                          ) : isImg ? (
                            <ImageIcon className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => {
                                if (isFolder) {
                                  setCurrentFolder({ id: file.id, name: file.name });
                                }
                              }}
                              className={`text-xs sm:text-sm font-bold text-slate-900 truncate ${
                                isFolder ? "cursor-pointer hover:text-blue-600" : ""
                              }`}
                            >
                              {file.name}
                            </span>
                            {file.starred && (
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            {!isFolder && <span>{formatFileSize(file.size)}</span>}
                            {file.modifiedTime && (
                              <span>
                                Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                              </span>
                            )}
                            {file.description && (
                              <span className="truncate max-w-[200px] text-slate-500">
                                {file.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleStar(file)}
                          title={file.starred ? "Unstar" : "Star"}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              file.starred ? "fill-amber-400 text-amber-400" : ""
                            }`}
                          />
                        </button>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Google Drive"
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {file.webContentLink && (
                          <a
                            href={file.webContentLink}
                            download
                            title="Download file"
                            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* Mandatory explicit user confirmation before deletion */}
                        <button
                          onClick={() => handleDeleteFile(file)}
                          title="Delete from Drive (Requires confirmation)"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                <span>Create New Drive Folder</span>
              </div>
              <button
                onClick={() => setFolderModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Cardiology Reports 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isCreatingFolder ? "Creating..." : "Create Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      <DriveDestructiveConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete File from Google Drive?"
        description={`Are you sure you want to delete "${fileToDelete?.name}" from your Google Drive account?`}
        items={fileToDelete ? [fileToDelete.name] : []}
        isProcessing={isDeleting}
      />
    </div>
  );
};
