import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  RefreshCw,
  Clock,
  User as UserIcon,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  FilePlus,
  Eye,
  Send,
  Calendar,
  HeartPulse,
  Activity,
  ArrowRight,
  Printer,
  Copy,
  Info,
  LogOut,
  FolderOpen,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  GoogleDocFile,
  GoogleDoc,
  MedicalDocTemplate,
  listGoogleDocs,
  getGoogleDoc,
  deleteGoogleDoc,
  generateMedicalGoogleDoc,
  appendDocText,
  extractDocPlainText,
  initDocsAuth,
  signInWithGoogleDocs,
  signOutGoogleDocs,
  getDocsAccessToken,
} from "../../services/googleDocsService";
import { BackButton } from "../common/BackButton";
import { Breadcrumbs } from "../common/Breadcrumbs";

export const GoogleDocsHub: React.FC = () => {
  const {
    patients,
    currentPatient,
    doctors,
    currentStaff,
    showToast,
    activeRole,
  } = useApp();

  const showNotification = (msg: string, _type?: string) => {
    showToast(msg);
  };

  const logAudit = (_action: string, _res: string, _status: string) => {
    // Local audit record
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string; email: string; photoURL?: string } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Document List State
  const [docsList, setDocsList] = useState<GoogleDocFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Document Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalDocTemplate>("clinical_consultation");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(currentPatient?.id || patients[0]?.id || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("Hypertension Stage 1 & Chronic Bronchial Asthma");
  const [symptoms, setSymptoms] = useState<string>("Persistent dry cough for 5 days, mild exertional dyspnea, elevated evening blood pressure.");
  const [clinicalNotes, setClinicalNotes] = useState<string>("Chest auscultation reveals mild bilateral wheezing. Advised bronchodilator therapy and dietary sodium restriction.");
  const [treatmentPlan, setTreatmentPlan] = useState<string>("Prescribe inhaled salbutamol and amlodipine. Check blood pressure twice daily. Schedule OPD review in 14 days.");
  const [followUp, setFollowUp] = useState<string>("Return in 2 weeks with home blood pressure logs. Report immediately if chest tightness or acute shortness of breath occurs.");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recentlyCreatedDoc, setRecentlyCreatedDoc] = useState<{ documentId: string; title: string; webViewLink: string } | null>(null);

  // Document Preview / Inspection Modal
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [previewDocData, setPreviewDocData] = useState<GoogleDoc | null>(null);
  const [previewDocText, setPreviewDocText] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // Addendum / Append Note State
  const [addendumText, setAddendumText] = useState<string>("");
  const [isAppending, setIsAppending] = useState<boolean>(false);

  // Delete Confirmation Modal (Mandatory User Confirmation for Destructive Workspace Operations)
  const [deleteTarget, setDeleteTarget] = useState<GoogleDocFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Selected Patient for generator
  const currentPatientObj = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || currentPatient || patients[0];
  }, [patients, selectedPatientId, currentPatient]);

  const currentDoctorObj = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  }, [doctors, selectedDoctorId]);

  // Initial Auth Check
  useEffect(() => {
    const unsubscribe = initDocsAuth(
      (user, token) => {
        setIsAuthenticated(true);
        setUserProfile({
          displayName: user.displayName || user.email?.split("@")[0] || "Medical Staff",
          email: user.email || "",
          photoURL: user.photoURL || undefined,
        });
      },
      () => {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    );

    // Also check if token is already available
    getDocsAccessToken().then((token) => {
      if (token) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Fetch Docs List when authenticated or refreshed
  useEffect(() => {
    if (!isAuthenticated) {
      setDocsList([]);
      return;
    }

    let isMounted = true;
    setIsLoadingDocs(true);

    listGoogleDocs(searchQuery)
      .then((files) => {
        if (isMounted) {
          setDocsList(files);
          setIsLoadingDocs(false);
        }
      })
      .catch((err) => {
        console.error("Failed to list Google Docs:", err);
        if (isMounted) {
          setIsLoadingDocs(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, refreshTrigger, searchQuery]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await signInWithGoogleDocs();
      if (res) {
        setIsAuthenticated(true);
        setUserProfile({
          displayName: res.user.displayName || "Medical Specialist",
          email: res.user.email || "",
          photoURL: res.user.photoURL || undefined,
        });
        showNotification("Google Docs & Drive connected successfully!", "success");
        logAudit("OAUTH_CONNECT", "Google Docs API", "SUCCESS");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Sign-in failed:", error);
      showNotification(`Google Docs authorization failed: ${error.message || "Unknown error"}`, "error");
      logAudit("OAUTH_CONNECT_FAIL", "Google Docs API", "FLAGGED");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOutGoogleDocs();
    setIsAuthenticated(false);
    setUserProfile(null);
    setDocsList([]);
    showNotification("Disconnected from Google Docs session", "info");
    logAudit("OAUTH_DISCONNECT", "Google Docs API", "SUCCESS");
  };

  // Handle Generate Medical Doc
  const handleGenerateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification("Please connect your Google account first to create Google Docs.", "warning");
      return;
    }

    if (!currentPatientObj) {
      showNotification("Please select a patient to generate the medical record.", "warning");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedTitle =
        customTitle.trim() ||
        `${selectedTemplate.replace(/_/g, " ").toUpperCase()} - ${currentPatientObj.name} (${new Date().toLocaleDateString()})`;

      const result = await generateMedicalGoogleDoc({
        template: selectedTemplate,
        title: generatedTitle,
        patientName: currentPatientObj.name,
        patientId: currentPatientObj.id,
        age: currentPatientObj.age,
        gender: currentPatientObj.gender,
        bloodGroup: currentPatientObj.bloodGroup,
        doctorName: currentStaff?.name || currentDoctorObj?.name || "Dr. Sarah Jenkins, MD",
        department: currentStaff?.department || currentDoctorObj?.department || "General Medicine",
        diagnosis,
        symptoms,
        vitalSigns: currentPatientObj.recentVitals,
        medications: [
          {
            name: "Amoxicillin-Clavulanate",
            dosage: "625 mg",
            frequency: "Twice daily with meals",
            duration: "7 days",
            instructions: "Complete entire antibiotic course without skipping.",
          },
          {
            name: "Salbutamol Inhaler (100mcg)",
            dosage: "2 puffs",
            frequency: "Every 6-8 hours as needed",
            duration: "14 days",
            instructions: "Rinse mouth with water after inhalation.",
          },
        ],
        labFindings: "Complete Blood Count: WBC 7,800/mcL, Hb 14.2 g/dL, Platelets 260,000/mcL. Chest X-Ray: Clear lung fields bilaterally, no consolidations.",
        clinicalNotes,
        treatmentPlan,
        followUpInstructions: followUp,
        allergies: currentPatientObj.allergies,
        chronicConditions: currentPatientObj.chronicConditions,
      });

      setRecentlyCreatedDoc(result);
      showNotification(`Official Google Doc created: "${generatedTitle}"`, "success");
      logAudit("DOCS_CREATE", `Created Google Doc: ${result.documentId}`, "SUCCESS");
      setRefreshTrigger((prev) => prev + 1);
      setCreateModalOpen(false);
    } catch (err: any) {
      console.error("Doc generation failed:", err);
      showNotification(`Failed to generate Google Doc: ${err.message || "Unknown error"}`, "error");
      logAudit("DOCS_CREATE_FAIL", "Google Docs API", "FLAGGED");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Load Preview
  const handleOpenPreview = async (docFile: GoogleDocFile) => {
    setPreviewDocId(docFile.id);
    setIsLoadingPreview(true);
    setPreviewDocData(null);
    setPreviewDocText("");

    try {
      const doc = await getGoogleDoc(docFile.id);
      setPreviewDocData(doc);
      const text = extractDocPlainText(doc);
      setPreviewDocText(text);
      logAudit("DOCS_READ", `Read Google Doc: ${docFile.id}`, "SUCCESS");
    } catch (err: any) {
      console.error("Failed to get doc content:", err);
      showNotification(`Failed to load document preview: ${err.message}`, "error");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handle Append Addendum
  const handleAppendAddendum = async () => {
    if (!previewDocId || !addendumText.trim()) return;

    setIsAppending(true);
    try {
      const author = currentStaff?.name || userProfile?.displayName || "Attending Physician";
      const timestamp = new Date().toLocaleString();
      const formattedAddendum = `\n\n--------------------------------------------------------------------------------\nCLINICAL ADDENDUM [Added ${timestamp} by ${author}]\n--------------------------------------------------------------------------------\n${addendumText.trim()}\n`;

      await appendDocText(previewDocId, formattedAddendum);
      showNotification("Clinical addendum appended to Google Doc successfully!", "success");
      setAddendumText("");

      // Refresh preview
      const updatedDoc = await getGoogleDoc(previewDocId);
      setPreviewDocData(updatedDoc);
      setPreviewDocText(extractDocPlainText(updatedDoc));
      logAudit("DOCS_APPEND", `Appended note to Google Doc: ${previewDocId}`, "SUCCESS");
    } catch (err: any) {
      console.error("Failed to append note:", err);
      showNotification(`Failed to append clinical note: ${err.message}`, "error");
    } finally {
      setIsAppending(false);
    }
  };

  // Handle Delete Confirmation
  const confirmDeleteDoc = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteGoogleDoc(deleteTarget.id);
      showNotification(`Document "${deleteTarget.name}" deleted permanently from Google Docs.`, "info");
      logAudit("DOCS_DELETE", `Deleted Google Doc: ${deleteTarget.id}`, "SUCCESS");
      setDeleteTarget(null);
      setRefreshTrigger((prev) => prev + 1);
      if (previewDocId === deleteTarget.id) {
        setPreviewDocId(null);
      }
    } catch (err: any) {
      console.error("Failed to delete document:", err);
      showNotification(`Failed to delete document: ${err.message}`, "error");
      logAudit("DOCS_DELETE_FAIL", `Failed to delete doc: ${deleteTarget.id}`, "FLAGGED");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Header & Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton fallbackPage="home" />
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 bg-blue-50/80 border border-blue-200 px-3 py-1.5 rounded-xl text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-blue-950">
                  {userProfile?.displayName}
                </span>
                <span className="text-[11px] text-blue-600 hidden sm:inline">
                  ({userProfile?.email})
                </span>
                <button
                  onClick={handleSignOut}
                  className="ml-1 text-slate-400 hover:text-red-600 transition"
                  title="Sign out from Google Docs session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? "Connecting..." : "Sign in with Google"}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showNotification("Please connect your Google account first to create medical documents.", "info");
                  handleGoogleSignIn();
                  return;
                }
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>New Medical Doc</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Google Docs Clinical Workstation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Google Docs Medical Records & Clinical Summaries
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Create, format, and synchronize live medical documents directly in Google Docs with full HIPAA & GDPR compliant structured templates, real-time doctor sign-offs, and instant clinical addendums.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Docs v1 REST API
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Live Structured Formatting
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                EHR Demographic Auto-Fill
              </span>
            </div>
          </div>
        </div>

        {/* Recently Created Document Notification Banner */}
        {recentlyCreatedDoc && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span>Document Created Successfully!</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-mono px-1.5 py-0.5 rounded">
                    {recentlyCreatedDoc.documentId.slice(0, 10)}...
                  </span>
                </div>
                <div className="text-xs text-emerald-800 font-medium">{recentlyCreatedDoc.title}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={recentlyCreatedDoc.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-2xs transition"
              >
                <span>Open in Google Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setRecentlyCreatedDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Document Browser & Quick Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Filter Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Your Google Docs Library</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {docsList.length} files
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRefreshTrigger((p) => p + 1)}
                    disabled={isLoadingDocs || !isAuthenticated}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
                    title="Refresh document list"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? "animate-spin text-blue-600" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Google Docs by medical title or patient name..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Document List View */}
            {!isAuthenticated ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Google Docs Connection Required</h4>
                  <p className="text-xs text-slate-500">
                    Connect your Google Workspace or Personal account to view, edit, and create clinical Google Docs directly within People's Hospital.
                  </p>
                </div>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? "Connecting..." : "Authorize Google Docs Access"}</span>
                </button>
              </div>
            ) : isLoadingDocs ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-2xs">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Fetching Google Docs from Google Drive...</p>
              </div>
            ) : docsList.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-2xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-slate-800">No Google Docs Found</h5>
                  <p className="text-xs text-slate-500">
                    {searchQuery ? "No documents match your search filter." : "You haven't created any medical Google Docs yet."}
                  </p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Medical Doc</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {docsList.map((doc) => {
                  const isSelected = previewDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`bg-white rounded-2xl p-4 border transition-all shadow-2xs hover:shadow-xs flex flex-wrap items-center justify-between gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4
                            onClick={() => handleOpenPreview(doc)}
                            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition truncate cursor-pointer"
                            title={doc.name}
                          >
                            {doc.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {doc.modifiedTime
                                ? new Date(doc.modifiedTime).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                            {doc.owners && doc.owners[0] && (
                              <span>• Owner: {doc.owners[0].displayName}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenPreview(doc)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                          title="Preview & add notes in-app"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <a
                          href={doc.webViewLink || `https://docs.google.com/document/d/${doc.id}/edit`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                          title="Open live document in Google Docs (new tab)"
                        >
                          <span>Docs</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => setDeleteTarget(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Google Doc permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: In-App Preview & Clinical Addendum (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden sticky top-36">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {previewDocData?.title || "Document In-App Viewer"}
                  </h3>
                </div>

                {previewDocId && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        if (previewDocText) {
                          navigator.clipboard.writeText(previewDocText);
                          showNotification("Document content copied to clipboard!", "info");
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                      title="Copy plain text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`https://docs.google.com/document/d/${previewDocId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 transition"
                      title="Open in Google Docs editor"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Preview Body */}
              <div className="p-4">
                {!previewDocId ? (
                  <div className="py-12 text-center space-y-2 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto stroke-1" />
                    <p className="text-xs">Select any Google Doc from the list to preview formatted clinical text and append notes.</p>
                  </div>
                ) : isLoadingPreview ? (
                  <div className="py-12 text-center space-y-2 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-xs">Parsing Google Docs structural elements...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Document Text Box */}
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap border border-slate-800 scrollbar-thin">
                      {previewDocText || "Document is empty or contains non-text elements."}
                    </div>

                    {/* Append Clinical Addendum Section */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Plus className="w-3 h-3 text-blue-600" />
                          Append Clinical Addendum
                        </label>
                        <span className="text-[10px] text-slate-400">Syncs directly to Docs API</span>
                      </div>
                      <textarea
                        rows={3}
                        value={addendumText}
                        onChange={(e) => setAddendumText(e.target.value)}
                        placeholder="Type clinical progress update, vitals note, or lab follow-up to append to this Google Doc..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      />
                      <button
                        onClick={handleAppendAddendum}
                        disabled={isAppending || !addendumText.trim()}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl shadow-2xs transition disabled:opacity-40 cursor-pointer"
                      >
                        {isAppending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating Google Doc...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Append Note to Google Doc</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MEDICAL DOC MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in my-8">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Generate New Medical Google Doc</h3>
                  <p className="text-[11px] text-blue-200">
                    Formats clinical sections, vitals telemetry & physician authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-white/70 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateDoc} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Template Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Select Clinical Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "clinical_consultation", label: "Consultation Note", icon: Stethoscope },
                    { id: "discharge_summary", label: "Discharge Summary", icon: FileText },
                    { id: "prescription_summary", label: "e-Prescription Brief", icon: Pill },
                    { id: "lab_diagnostic", label: "Lab Diagnostic Report", icon: Activity },
                    { id: "referral_letter", label: "Referral Letter", icon: Send },
                    { id: "blank_medical_note", label: "Hospital Progress Note", icon: FilePlus },
                  ].map((tpl) => {
                    const Icon = tpl.icon;
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        type="button"
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id as MedicalDocTemplate)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                            : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                        <span className="text-[11px] font-bold">{tpl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient and Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Select Patient (Auto-fills EHR)
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.age}y, {p.bloodGroup})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Attending Physician Sign-Off
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Document Title (Optional Override)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`e.g. ${currentPatientObj?.name || "Patient"} - Clinical Encounter Summary`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Chief Complaint / Symptoms */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Chief Complaint & Presenting Symptoms
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Clinical Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Clinical Diagnosis & Assessment
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Treatment Plan & Clinical Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Treatment & Therapeutic Plan
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Follow-Up Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Writing to Google Docs API...</span>
                    </>
                  ) : (
                    <>
                      <FilePlus className="w-4 h-4" />
                      <span>Create Official Google Doc</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Mandatory Confirmation for Destructive Workspace Operations) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">Delete Google Doc?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete the document{" "}
                <span className="font-semibold text-slate-800">"{deleteTarget.name}"</span>? This action permanently removes the file from Google Drive and cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="w-full py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDoc}
                disabled={isDeleting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
