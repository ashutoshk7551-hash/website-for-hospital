import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import {
  signInWithGmail,
  signOutGmail,
  getGmailProfile,
  listGmailMessages,
  getGmailMessage,
  sendGmailEmail,
  createGmailDraft,
  modifyGmailMessageLabels,
  deleteGmailMessage,
  trashGmailMessage,
  GmailProfile,
  GmailMessageSummary,
  SendEmailPayload,
} from "../../services/gmailService";
import { getDriveAccessToken, uploadMedicalRecordToDrive } from "../../services/googleDriveService";
import {
  Mail,
  Send,
  Inbox,
  Star,
  Trash2,
  FileEdit,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Reply,
  Forward,
  Paperclip,
  HardDrive,
  User,
  Calendar,
  Pill,
  TestTube2,
  ShieldCheck,
  Sparkles,
  X,
  Clock,
  Tag,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { BackButton } from "../common/BackButton";

export const GmailHub: React.FC = () => {
  const {
    currentPatient,
    appointments,
    prescriptions,
    labTests,
    doctors,
    showToast,
    setCurrentPage,
  } = useApp();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<GmailProfile | null>(null);

  // Mailbox State
  const [activeFolder, setActiveFolder] = useState<string>("INBOX");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>("");
  const [composeCc, setComposeCc] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

  // Confirmation Modal State (MANDATORY for mutating/destructive operations)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

  // Check Auth on Mount
  const checkAuthStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const token = await getDriveAccessToken();
      if (token) {
        setIsAuthenticated(true);
        const profile = await getGmailProfile();
        setUserProfile(profile);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    } catch (err) {
      console.warn("Gmail auth check:", err);
      setIsAuthenticated(false);
      setUserProfile(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Load Messages when Auth/Folder/Filter changes
  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingMessages(true);
    try {
      let query = searchQuery.trim();
      if (filterUnreadOnly) {
        query = query ? `${query} is:unread` : "is:unread";
      }

      let labelIds: string[] = [];
      if (activeFolder === "INBOX") labelIds = ["INBOX"];
      else if (activeFolder === "SENT") labelIds = ["SENT"];
      else if (activeFolder === "DRAFT") labelIds = ["DRAFT"];
      else if (activeFolder === "STARRED") labelIds = ["STARRED"];
      else if (activeFolder === "TRASH") labelIds = ["TRASH"];
      else if (activeFolder === "IMPORTANT") labelIds = ["IMPORTANT"];

      const res = await listGmailMessages(query, labelIds, 25);
      setMessages(res.messages);
    } catch (err: any) {
      console.error("Failed to load Gmail messages:", err);
      showToast("Error loading emails. Please ensure permissions are granted.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isAuthenticated, activeFolder, searchQuery, filterUnreadOnly, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages();
    }
  }, [isAuthenticated, activeFolder, filterUnreadOnly, loadMessages]);

  // Sign In Handler
  const handleSignIn = async () => {
    try {
      setIsLoadingAuth(true);
      const res = await signInWithGmail();
      if (res?.accessToken) {
        setIsAuthenticated(true);
        const profile = await getGmailProfile();
        setUserProfile(profile);
        showToast("Connected to Gmail successfully!");
        loadMessages();
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      showToast(err.message || "Failed to sign in to Google. Please try again.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    setConfirmationModal({
      isOpen: true,
      title: "Disconnect Gmail Account",
      description: "Are you sure you want to disconnect your Google account and end your Gmail session?",
      confirmText: "Disconnect",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await signOutGmail();
          setIsAuthenticated(false);
          setUserProfile(null);
          setMessages([]);
          setSelectedMessage(null);
          showToast("Disconnected from Gmail.");
        } catch (err) {
          console.error("Sign out error:", err);
        }
      },
    });
  };

  // View Message Details
  const handleSelectMessage = async (msg: GmailMessageSummary) => {
    setSelectedMessage(msg);
    setIsLoadingDetail(true);
    try {
      const full = await getGmailMessage(msg.id);
      setSelectedMessage(full);
      // Mark read if it was unread
      if (full.isUnread) {
        await modifyGmailMessageLabels(full.id, [], ["UNREAD"]);
        setMessages((prev) =>
          prev.map((m) => (m.id === full.id ? { ...m, isUnread: false } : m))
        );
      }
    } catch (err) {
      console.error("Failed to fetch full message:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Star / Unstar Message
  const handleToggleStar = async (msg: GmailMessageSummary, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const newStarred = !msg.isStarred;
      if (newStarred) {
        await modifyGmailMessageLabels(msg.id, ["STARRED"], []);
      } else {
        await modifyGmailMessageLabels(msg.id, [], ["STARRED"]);
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isStarred: newStarred } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, isStarred: newStarred });
      }
      showToast(newStarred ? "Message starred." : "Message unstarred.");
    } catch (err) {
      console.error("Error toggling star:", err);
      showToast("Failed to update message.");
    }
  };

  // Trash Message with Confirmation
  const handleTrashMessage = (msg: GmailMessageSummary) => {
    setConfirmationModal({
      isOpen: true,
      title: "Move Email to Trash",
      description: `Are you sure you want to move the email "${msg.subject || "(No Subject)"}" to Trash?`,
      confirmText: "Move to Trash",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await trashGmailMessage(msg.id);
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          if (selectedMessage?.id === msg.id) {
            setSelectedMessage(null);
          }
          showToast("Email moved to Trash.");
        } catch (err) {
          console.error("Error trashing email:", err);
          showToast("Failed to move email to Trash.");
        }
      },
    });
  };

  // Permanently Delete Message with Confirmation
  const handleDeletePermanently = (msg: GmailMessageSummary) => {
    setConfirmationModal({
      isOpen: true,
      title: "Permanently Delete Email",
      description: `WARNING: This will permanently delete the email "${msg.subject || "(No Subject)"}" from your Gmail account. This action CANNOT be undone.`,
      confirmText: "Delete Permanently",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteGmailMessage(msg.id);
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          if (selectedMessage?.id === msg.id) {
            setSelectedMessage(null);
          }
          showToast("Email permanently deleted.");
        } catch (err) {
          console.error("Error deleting email:", err);
          showToast("Failed to delete email.");
        }
      },
    });
  };

  // Export Email to Google Drive Vault
  const handleExportToDrive = async (msg: GmailMessageSummary) => {
    try {
      showToast("Exporting email to Google Drive Vault...");
      const record = {
        emailId: msg.id,
        threadId: msg.threadId,
        from: msg.from,
        to: msg.to,
        date: msg.date,
        subject: msg.subject,
        snippet: msg.snippet,
        bodyText: msg.bodyText,
        labels: msg.labelIds,
      };
      await uploadMedicalRecordToDrive(
        `Gmail_Archive_${msg.subject?.slice(0, 20) || "Email"}`,
        record,
        "CLINICAL_NOTE"
      );
      showToast("Email archived to Google Drive Vault successfully!");
    } catch (err: any) {
      console.error("Drive export failed:", err);
      showToast("Failed to archive email to Google Drive. Ensure Drive is connected.");
    }
  };

  // Apply Clinical Email Templates
  const handleApplyTemplate = (type: string) => {
    setSelectedTemplate(type);
    const patientName = currentPatient?.name || "Valued Patient";
    const patientEmail = currentPatient?.email || "";

    if (type === "appointment") {
      const appt = appointments[0];
      setComposeTo(patientEmail || appt?.patientPhone || "");
      setComposeSubject(`Appointment Confirmation - People's Hospital (Token #${appt?.tokenNumber || "104"})`);
      setComposeBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <div style="background-color: #0f766e; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">People's Hospital - Outpatient Care</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Appointment Booking Confirmation</p>
          </div>
          <p>Dear <strong>${appt?.patientName || patientName}</strong>,</p>
          <p>Your clinical consultation has been officially scheduled. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px;">
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Token Number:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #0f766e; font-weight: bold;">#${appt?.tokenNumber || "104"}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Consulting Doctor:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${appt?.doctorName || "Dr. Sarah Jenkins"}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Department:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${appt?.department || "General OPD"} (Room ${appt?.roomNumber || "OPD-102"})</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Date & Time:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${appt?.date || "Today"} at ${appt?.time || "10:30 AM"}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Symptoms / Reason:</td><td style="padding: 8px 12px;">${appt?.symptoms || "Regular Follow-up"}</td></tr>
          </table>
          <p>Please arrive 10 minutes prior to your scheduled slot. You can check in directly using your digital QR Pass on the Patient Portal.</p>
          <p style="margin-top: 24px; font-size: 12px; color: #64748b;">People's Hospital Medical Center | 450 Health Sciences Pkwy | Emergency 24/7: +1 (555) 911-PEOPLE</p>
        </div>`
      );
    } else if (type === "prescription") {
      const rx = prescriptions[0];
      setComposeTo(patientEmail);
      setComposeSubject(`Digital e-Prescription (Rx #${rx?.id || "RX-8841"}) - Central Pharmacy`);
      setComposeBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <div style="background-color: #0284c7; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">People's Hospital Central Pharmacy</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Verified Digital Prescription Summary</p>
          </div>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your physician has issued an electronically signed prescription with automated drug safety screening.</p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #0369a1;">Prescription ID: ${rx?.id || "RX-8841"}</p>
            <p style="margin: 4px 0 0; font-size: 13px;">Prescribing Physician: ${rx?.doctorName || "Dr. Arthur Campbell, MD"}</p>
            <p style="margin: 2px 0 0; font-size: 13px;">Diagnosis: ${rx?.diagnosis || "Essential Hypertension"}</p>
          </div>
          <h4 style="margin: 16px 0 8px; color: #334155;">Prescribed Medications:</h4>
          <ul style="padding-left: 20px; margin: 0;">
            ${(rx?.medicines || [
              { name: "Amoxicillin 500mg", dosage: "1 tablet 3x daily", duration: "7 days", instructions: "After food" },
              { name: "Paracetamol 650mg", dosage: "1 tablet as needed", duration: "3 days", instructions: "For fever" }
            ])
              .map(
                (m) =>
                  `<li style="margin-bottom: 8px;"><strong>${m.name}</strong> - ${m.dosage} (${m.duration}). <em>Instructions: ${m.instructions}</em></li>`
              )
              .join("")}
          </ul>
          <p style="margin-top: 16px;">This medication is ready for pickup or home delivery via the People's Hospital Pharmacy Hub.</p>
        </div>`
      );
    } else if (type === "lab_report") {
      const test = labTests[0];
      setComposeTo(patientEmail);
      setComposeSubject(`Diagnostic Lab Report Ready - Test: ${test?.testName || "Complete Blood Count (CBC)"}`);
      setComposeBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <div style="background-color: #7c3aed; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">CAP-Accredited Diagnostic Laboratory</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Official Laboratory Test Notification</p>
          </div>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your diagnostic laboratory test results for <strong>${test?.testName || "Complete Blood Count (CBC)"}</strong> are now available and verified by our clinical pathologists.</p>
          <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #6b21a8;">Status: ${test?.status?.toUpperCase() || "COMPLETED"}</p>
            <p style="margin: 4px 0 0; font-size: 13px;">Test Code: ${test?.id || "LAB-501"}</p>
            <p style="margin: 2px 0 0; font-size: 13px;">Supervising Pathologist: ${test?.doctorName || "Dr. Evelyn Reed, MD, PhD"}</p>
          </div>
          <p>You can view the comprehensive biomarker breakdown and download the encrypted PDF from your Patient Health Vault.</p>
        </div>`
      );
    } else if (type === "discharge") {
      setComposeTo(patientEmail);
      setComposeSubject(`Clinical Care Summary & Follow-Up Guidelines - People's Hospital`);
      setComposeBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <div style="background-color: #059669; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">People's Hospital Care Continuum</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Post-Consultation & Discharge Instructions</p>
          </div>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Thank you for trusting People's Hospital with your healthcare. Please review your personalized home care instructions:</p>
          <ul style="padding-left: 20px;">
            <li>Maintain recommended hydration and balanced nutrition.</li>
            <li>Adhere strictly to your prescribed medication schedule.</li>
            <li>Monitor blood pressure and pulse twice daily using the Patient Portal vital logger.</li>
            <li>Schedule follow-up consultation in 14 days or as advised.</li>
          </ul>
          <p>If you experience fever above 101°F, sudden chest tightness, or severe shortness of breath, immediately contact our 24/7 Emergency SOS Line: <strong>+1 (555) 911-PEOPLE</strong>.</p>
        </div>`
      );
    } else {
      setComposeSubject("");
      setComposeBody("");
    }
  };

  // Send Email Handler with Explicit Confirmation (MANDATORY)
  const handleInitiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim()) {
      showToast("Please specify a recipient email address.");
      return;
    }
    if (!composeSubject.trim()) {
      showToast("Please enter a subject line.");
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Sending Email via Gmail",
      description: `Are you sure you want to send this email to "${composeTo}" with subject "${composeSubject}" using your authenticated Gmail account (${userProfile?.emailAddress || "Google Account"})?`,
      confirmText: "Send Email Now",
      isDestructive: false,
      onConfirm: async () => {
        setIsSending(true);
        try {
          const payload: SendEmailPayload = {
            to: composeTo.trim(),
            cc: composeCc.trim() || undefined,
            subject: composeSubject.trim(),
            bodyHtml: composeBody || `<p>${composeSubject}</p>`,
          };
          await sendGmailEmail(payload);
          showToast(`Email dispatched successfully to ${composeTo}!`);
          setIsComposeOpen(false);
          setComposeTo("");
          setComposeCc("");
          setComposeSubject("");
          setComposeBody("");
          loadMessages();
        } catch (err: any) {
          console.error("Failed to send email:", err);
          showToast(err.message || "Failed to send email via Gmail.");
        } finally {
          setIsSending(false);
        }
      },
    });
  };

  // Save as Draft Handler
  const handleSaveDraft = async () => {
    if (!composeSubject.trim() && !composeBody.trim()) {
      showToast("Cannot save empty draft.");
      return;
    }
    setIsSavingDraft(true);
    try {
      const payload: SendEmailPayload = {
        to: composeTo.trim() || "recipient@example.com",
        cc: composeCc.trim() || undefined,
        subject: composeSubject.trim() || "(Draft Subject)",
        bodyHtml: composeBody || "<p></p>",
      };
      await createGmailDraft(payload);
      showToast("Draft saved successfully to Gmail.");
      setIsComposeOpen(false);
      loadMessages();
    } catch (err: any) {
      console.error("Failed to save draft:", err);
      showToast("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Quick compose reply
  const handleQuickReply = () => {
    if (!selectedMessage) return;
    const replySubject = selectedMessage.subject?.startsWith("Re:")
      ? selectedMessage.subject
      : `Re: ${selectedMessage.subject || ""}`;
    setComposeTo(selectedMessage.from || "");
    setComposeSubject(replySubject);
    setComposeBody(
      `<br/><br/><blockquote>On ${selectedMessage.date}, ${selectedMessage.from} wrote:<br/>${selectedMessage.bodyHtml || selectedMessage.bodyText}</blockquote>`
    );
    setIsComposeOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30">
              <Mail className="w-4 h-4 text-red-400" />
              <span>Google Workspace Gmail Integration (OAuth 2.0)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Hospital <span className="text-red-400">Gmail Hub</span> & Communications
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Securely access your Google Gmail inbox, send real-time clinical notices, dispatch e-prescriptions, deliver laboratory diagnostics, and archive medical correspondence with Google Workspace integration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-2 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                  {userProfile?.emailAddress?.slice(0, 1).toUpperCase() || "G"}
                </div>
                <div className="text-xs pr-2">
                  <div className="font-bold text-white max-w-[180px] truncate">
                    {userProfile?.emailAddress || "Google User"}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Connected</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-red-600/80 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                className="gsi-material-button px-5 py-3 bg-white text-slate-900 font-bold text-xs rounded-2xl shadow-lg hover:bg-slate-50 transition flex items-center gap-3 cursor-pointer border border-slate-200"
              >
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span>{isLoadingAuth ? "Connecting..." : "Sign in with Google"}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* If Not Authenticated: Prompt Card */}
      {!isAuthenticated && !isLoadingAuth && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Connect Your Google Gmail Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              With your permission, connecting Google Workspace allows People's Hospital to view your emails, send patient appointment passes, dispatch verified electronic prescriptions, and coordinate emergency lab reports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Appointments</span>
              </div>
              <p className="text-[11px] text-slate-500">Send instant confirmation emails with token & QR pass.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>e-Prescriptions</span>
              </div>
              <p className="text-[11px] text-slate-500">Transmit dosage regimens & pharmacist notes.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <TestTube2 className="w-4 h-4 text-purple-600" />
                <span>Lab Diagnostics</span>
              </div>
              <p className="text-[11px] text-slate-500">Notify patients when pathology results are verified.</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSignIn}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Connect Google Account & Open Gmail</span>
            </button>
          </div>
        </div>
      )}

      {/* If Authenticated: Full Mailbox Client */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Folders & Quick Actions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Compose Button */}
            <button
              onClick={() => {
                setSelectedTemplate("custom");
                setComposeTo(currentPatient?.email || "");
                setComposeSubject("");
                setComposeBody("");
                setIsComposeOpen(true);
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileEdit className="w-4 h-4" />
              <span>Compose Clinical Email</span>
            </button>

            {/* Folder Navigation */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
              {[
                { id: "INBOX", label: "Inbox", icon: Inbox },
                { id: "STARRED", label: "Starred", icon: Star },
                { id: "SENT", label: "Sent", icon: Send },
                { id: "DRAFT", label: "Drafts", icon: FileEdit },
                { id: "IMPORTANT", label: "Important", icon: Tag },
                { id: "TRASH", label: "Trash", icon: Trash2 },
              ].map((f) => {
                const Icon = f.icon;
                const active = activeFolder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFolder(f.id);
                      setSelectedMessage(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      active
                        ? "bg-red-50 text-red-700 font-bold border border-red-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-red-600" : "text-slate-400"}`} />
                      <span>{f.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clinical Communication Quick Templates */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Clinical Presets</span>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    handleApplyTemplate("appointment");
                    setIsComposeOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Appointment Pass</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    handleApplyTemplate("prescription");
                    setIsComposeOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>e-Prescription Email</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    handleApplyTemplate("lab_report");
                    setIsComposeOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Lab Report Notice</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    handleApplyTemplate("discharge");
                    setIsComposeOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Discharge Summary</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Drive Integration Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <HardDrive className="w-4 h-4" />
                <span>Google Drive Link</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Seamlessly archive email threads directly into your HIPAA-compliant Google Drive Medical Vault.
              </p>
              <button
                onClick={() => setCurrentPage("google-drive-vault")}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] rounded-lg transition mt-1 cursor-pointer"
              >
                Open Drive Vault
              </button>
            </div>
          </div>

          {/* Right Main Area: Search, Message List & Reading Pane */}
          <div className="lg:col-span-9 space-y-4">
            {/* Search and Action Bar */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadMessages();
                  }}
                  placeholder="Search emails by sender, subject, clinical keyword..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    filterUnreadOnly
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Unread</span>
                </button>

                <button
                  onClick={loadMessages}
                  disabled={isLoadingMessages}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="Refresh Mailbox"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? "animate-spin text-red-600" : ""}`} />
                </button>
              </div>
            </div>

            {/* Split Screen or Selected Email View */}
            {selectedMessage ? (
              /* Email Reader View */
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
                {/* Back and Action Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Messages</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleStar(selectedMessage, e)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        selectedMessage.isStarred
                          ? "bg-amber-50 text-amber-500 border-amber-200"
                          : "bg-slate-50 text-slate-400 hover:text-amber-500 border-slate-200"
                      }`}
                      title={selectedMessage.isStarred ? "Unstar" : "Star"}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => handleExportToDrive(selectedMessage)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-bold transition cursor-pointer"
                      title="Archive to Google Drive"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Archive to Drive</span>
                    </button>

                    <button
                      onClick={handleQuickReply}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => handleTrashMessage(selectedMessage)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {activeFolder === "TRASH" && (
                      <button
                        onClick={() => handleDeletePermanently(selectedMessage)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Delete Permanently
                      </button>
                    )}
                  </div>
                </div>

                {/* Email Subject & Headers */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {selectedMessage.subject || "(No Subject)"}
                  </h2>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0">
                        {selectedMessage.from?.slice(0, 1).toUpperCase() || "M"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{selectedMessage.from}</div>
                        <div className="text-[11px] text-slate-500">To: {selectedMessage.to || "me"}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium sm:text-right">
                      {selectedMessage.date}
                    </div>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="pt-2">
                  {isLoadingDetail ? (
                    <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                      <span>Loading message content...</span>
                    </div>
                  ) : selectedMessage.bodyHtml ? (
                    <div
                      className="email-body-rendered prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                    />
                  ) : (
                    <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-sans">
                      {selectedMessage.bodyText || selectedMessage.snippet}
                    </div>
                  )}
                </div>

                {/* Quick Reply Bar */}
                <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                  <button
                    onClick={handleQuickReply}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                  <button
                    onClick={() => {
                      setComposeSubject(`Fwd: ${selectedMessage.subject}`);
                      setComposeBody(
                        `<br/><br/>---------- Forwarded message ---------<br/>From: ${selectedMessage.from}<br/>Date: ${selectedMessage.date}<br/>Subject: ${selectedMessage.subject}<br/>To: ${selectedMessage.to}<br/><br/>${selectedMessage.bodyHtml || selectedMessage.bodyText}`
                      );
                      setIsComposeOpen(true);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Forward className="w-4 h-4" />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Message List Table */
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-600" />
                    <span>
                      {activeFolder.toUpperCase()} ({messages.length})
                    </span>
                  </div>
                  {isLoadingMessages && (
                    <span className="text-[11px] text-red-600 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Syncing...
                    </span>
                  )}
                </div>

                {isLoadingMessages && messages.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                    <span>Retrieving messages from Gmail...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 text-xs space-y-2">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No emails found in this folder</p>
                    <p className="text-[11px] text-slate-400">
                      Try clearing search filters or compose a new clinical email.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 hover:bg-slate-50/80 transition flex items-start sm:items-center justify-between gap-4 cursor-pointer text-xs ${
                          msg.isUnread ? "bg-red-50/30 font-bold" : "text-slate-600"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <button
                            onClick={(e) => handleToggleStar(msg, e)}
                            className={`shrink-0 p-1 transition ${
                              msg.isStarred ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>

                          {msg.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1 sm:mt-0" />
                          )}

                          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                            <div className="font-bold text-slate-900 sm:w-48 truncate shrink-0">
                              {msg.from?.replace(/<.*>/, "").trim() || "Unknown"}
                            </div>
                            <div className="truncate flex-1">
                              <span className="font-bold text-slate-900">{msg.subject || "(No Subject)"}</span>
                              <span className="text-slate-500 font-normal"> - {msg.snippet}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                          {msg.date?.split(",")[0] || "Today"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileEdit className="w-4 h-4" />
                <span>Compose Email - People's Hospital Gmail</span>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Bar */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold text-[11px]">Insert Preset:</span>
              <button
                type="button"
                onClick={() => handleApplyTemplate("appointment")}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-lg border border-slate-200 transition text-[11px] cursor-pointer"
              >
                Appointment
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate("prescription")}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-slate-200 transition text-[11px] cursor-pointer"
              >
                e-Prescription
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate("lab_report")}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-lg border border-slate-200 transition text-[11px] cursor-pointer"
              >
                Lab Result
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate("discharge")}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-700 font-bold rounded-lg border border-slate-200 transition text-[11px] cursor-pointer"
              >
                Discharge
              </button>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleInitiateSendEmail} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">To Recipient *</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subject Line *</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject of clinical notification or medical update..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Body (HTML / Plain Text) *</label>
                <textarea
                  rows={8}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your email body or select a preset template above..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {isSavingDraft ? "Saving Draft..." : "Save Draft"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? "Dispatching..." : "Send via Gmail"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal (MANDATORY for Mutating / Destructive Operations) */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmationModal.isDestructive
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {confirmationModal.isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{confirmationModal.title}</h3>
                <div className="text-xs text-slate-500">Google Workspace Security Confirmation</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmationModal.description}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmationModal({ ...confirmationModal, isOpen: false });
                  confirmationModal.onConfirm();
                }}
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer ${
                  confirmationModal.isDestructive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                }`}
              >
                {confirmationModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
