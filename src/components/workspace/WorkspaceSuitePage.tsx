import React, { useState, useEffect } from "react";
import {
  FileText,
  Mail,
  HardDrive,
  Table,
  Calendar,
  Presentation,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  StickyNote,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  Database,
  Cloud,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  workspaceLogout,
  getWorkspaceAccessToken,
} from "../../services/googleWorkspaceService";
import { useApp } from "../../context/AppContext";
import { PageId } from "../../routes/routeConfig";

export const WorkspaceSuitePage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    initWorkspaceAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleWorkspaceSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google Workspace.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await workspaceLogout();
    setUser(null);
    setToken(null);
  };

  const workspaceTools: Array<{
    id: PageId;
    title: string;
    description: string;
    icon: any;
    color: string;
    tag: string;
    scopesInfo: string;
  }> = [
    {
      id: "google-drive-vault",
      title: "Google Drive Vault",
      description: "Securely store and organize patient medical scans, clinical reports, and HIPAA-compliant documentation.",
      icon: HardDrive,
      color: "from-blue-500 to-indigo-600",
      tag: "Storage & Files",
      scopesInfo: "drive, drive.file, drive.readonly",
    },
    {
      id: "gmail-hub",
      title: "Gmail Clinical Hub",
      description: "Send automated patient appointment confirmations, clinical consultation notes, and doctor advisories.",
      icon: Mail,
      color: "from-rose-500 to-red-600",
      tag: "Communication",
      scopesInfo: "gmail.readonly, gmail.send, gmail.compose",
    },
    {
      id: "google-docs",
      title: "Google Docs Summarizer",
      description: "Generate structured clinical discharge summaries, medical case notes, and diagnostic briefs.",
      icon: FileText,
      color: "from-sky-500 to-blue-600",
      tag: "Documentation",
      scopesInfo: "documents, documents.readonly",
    },
    {
      id: "google-sheets",
      title: "Google Sheets Analytics",
      description: "Export real-time patient registries, pharmacy medication stock ledgers, and department throughput.",
      icon: Table,
      color: "from-emerald-500 to-teal-600",
      tag: "Spreadsheets & Data",
      scopesInfo: "spreadsheets, spreadsheets.readonly",
    },
    {
      id: "google-calendar",
      title: "Google Calendar Sync",
      description: "Coordinate doctor consultation slots, surgery schedules, and patient follow-up reminders.",
      icon: Calendar,
      color: "from-blue-600 to-cyan-600",
      tag: "Scheduling",
      scopesInfo: "calendar, calendar.events",
    },
    {
      id: "google-slides",
      title: "Google Slides Deck Maker",
      description: "Create case presentation slide decks for clinical grand rounds, pharmacy audits, and board reviews.",
      icon: Presentation,
      color: "from-amber-500 to-orange-600",
      tag: "Presentations",
      scopesInfo: "presentations, presentations.readonly",
    },
    {
      id: "google-tasks",
      title: "Google Tasks Care Tracker",
      description: "Assign and track nursing tasks, prescription refills, ICU vitals checks, and discharge actions.",
      icon: CheckSquare,
      color: "from-indigo-500 to-blue-600",
      tag: "Task Management",
      scopesInfo: "tasks, tasks.readonly",
    },
    {
      id: "google-chat",
      title: "Google Chat Emergency Channel",
      description: "Broadcast Code Blue alerts, triage notifications, and inter-departmental pharmacy updates.",
      icon: MessageSquare,
      color: "from-teal-500 to-emerald-600",
      tag: "Team Messaging",
      scopesInfo: "chat.messages, chat.spaces",
    },
    {
      id: "google-forms",
      title: "Google Forms Intake Surveys",
      description: "Build digital patient satisfaction forms, intake screening question sets, and adverse reaction surveys.",
      icon: ClipboardList,
      color: "from-purple-500 to-indigo-600",
      tag: "Surveys & Forms",
      scopesInfo: "forms.body, forms.responses.readonly",
    },
    {
      id: "google-keep",
      title: "Google Keep Bedside Notes",
      description: "Rapidly pin clinical memos, shift handover reminders, and urgent prescription alerts.",
      icon: StickyNote,
      color: "from-amber-400 to-yellow-600",
      tag: "Quick Memos",
      scopesInfo: "clinical scratchpad & keep sync",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                Google Workspace & Firebase Ecosystem
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Enterprise Google Workspace & Cloud Data
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-3xl">
                Fully integrated with Cloud Firestore and Google Workspace APIs. Seamlessly manage patient health records, spreadsheets, calendar events, slides, care tasks, and communications with real-time cloud authorization.
              </p>
            </div>

            {/* Auth Action */}
            <div className="flex flex-col items-start md:items-end gap-2">
              {user ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"}
                      alt={user.displayName || "User"}
                      className="w-9 h-9 rounded-full border border-emerald-300"
                    />
                    <div>
                      <div className="text-xs font-semibold text-emerald-900">{user.displayName || "Authorized User"}</div>
                      <div className="text-xs text-emerald-700">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-medium px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isSigningIn ? "Connecting with Google..." : "Connect Google Workspace"}
                  </button>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Grants user permission to Workspace APIs
                  </div>
                </div>
              )}
            </div>
          </div>

          {authError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          {/* Connected Infrastructure Status Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Cloud Firestore DB</div>
                <div className="text-[11px] text-slate-500">Live multi-device database (asia-southeast1)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Firebase Authentication</div>
                <div className="text-[11px] text-slate-500">Role-based Access & Google Identity</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">10 Integrated Workspace APIs</div>
                <div className="text-[11px] text-slate-500">Drive, Docs, Sheets, Calendar, Slides, Chat & more</div>
              </div>
            </div>
          </div>
        </div>

        {/* 10 Workspace Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => setCurrentPage(tool.id)}
                className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {tool.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-blue-600">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {tool.scopesInfo}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Open Hub <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
