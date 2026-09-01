import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  uploadMedicalRecordToDrive,
  signInWithGoogleDrive,
  getOrCreateMedicalVaultFolder,
} from "../../services/googleDriveService";
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  CloudUpload,
} from "lucide-react";

export const DriveExportModal: React.FC = () => {
  const {
    driveExportModalOpen,
    setDriveExportModalOpen,
    driveExportData,
    driveUser,
    driveAccessToken,
    setDriveAuth,
    showToast,
    setCurrentPage,
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!driveExportModalOpen || !driveExportData) return null;

  const handleClose = () => {
    setDriveExportModalOpen(false);
    setExportSuccess(null);
    setErrorMessage(null);
  };

  const handleConnectAndExport = async () => {
    try {
      setIsExporting(true);
      setErrorMessage(null);

      let token = driveAccessToken;
      let user = driveUser;

      if (!token || !user) {
        const authRes = await signInWithGoogleDrive();
        if (!authRes) {
          throw new Error("Google Drive authentication was cancelled.");
        }
        token = authRes.accessToken;
        user = authRes.user;
        setDriveAuth(user, token);
      }

      // Ensure Vault folder
      const vaultFolder = await getOrCreateMedicalVaultFolder("PharmaCare 360 Medical Vault");

      // Upload the document
      const result = await uploadMedicalRecordToDrive(
        driveExportData.title,
        driveExportData.data,
        driveExportData.recordType,
        vaultFolder.id
      );

      setExportSuccess(result);
      showToast(`Exported "${driveExportData.title}" to Google Drive successfully!`);
    } catch (err: any) {
      console.error("Export to Drive failed:", err);
      setErrorMessage(err.message || "Failed to export document to Google Drive");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Google Drive Cloud Sync
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Export to Google Drive
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!exportSuccess ? (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Document Type:</span>
                <span className="bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded text-[11px]">
                  {driveExportData.recordType}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{driveExportData.title}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Target Folder: <span className="font-semibold text-slate-700">PharmaCare 360 Medical Vault</span> in Google Drive
              </div>
            </div>

            {/* Google Drive Auth Status */}
            <div className="p-3.5 rounded-2xl border bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                  {driveUser?.photoURL ? (
                    <img
                      src={driveUser.photoURL}
                      alt="Google User"
                      className="w-full h-full rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Lock className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {driveUser ? driveUser.displayName || driveUser.email : "Google Drive Access"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {driveUser ? `Connected as ${driveUser.email}` : "Permission requested on export"}
                  </div>
                </div>
              </div>

              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                driveUser ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {driveUser ? "Ready" : "Login Required"}
              </span>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectAndExport}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isExporting ? "Uploading to Drive..." : "Export to Google Drive"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                Exported Successfully to Google Drive!
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                File <span className="font-semibold text-slate-800">"{exportSuccess.name}"</span> has been securely stored in your Google Drive Medical Vault.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {exportSuccess.webViewLink && (
                <a
                  href={exportSuccess.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Open in Google Drive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => {
                  handleClose();
                  setCurrentPage("google-drive-vault");
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Go to Drive Cloud Vault
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
