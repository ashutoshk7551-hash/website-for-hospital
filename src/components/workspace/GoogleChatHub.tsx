import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  listChatSpaces,
  sendChatMessage,
  GoogleChatSpace,
} from "../../services/googleWorkspaceService";

export const GoogleChatHub: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [messageText, setMessageText] = useState("🚨 Emergency Triage Alert: Code Blue in ICU Bay 4. Duty Physician required.");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    initWorkspaceAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
        loadSpaces();
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await googleWorkspaceSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadSpaces();
        setStatusMessage({ text: "Connected to Google Chat API!", type: "success" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to connect Google Chat", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const items = await listChatSpaces();
      setSpaces(items);
      if (items.length > 0) {
        setSelectedSpace(items[0].name);
      }
    } catch (err: any) {
      console.warn("Chat spaces load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!selectedSpace) {
      setStatusMessage({ text: "Please select or input a Google Chat space name.", type: "error" });
      return;
    }

    const confirmed = window.confirm(
      `Send broadcast message to Google Chat Space "${selectedSpace}"?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await sendChatMessage(selectedSpace, messageText);
      setStatusMessage({ text: "Clinical broadcast sent to Google Chat space!", type: "success" });
      setMessageText("");
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to send chat message", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Google Chat Care Team Channel</h1>
              <p className="text-sm text-slate-500">
                Broadcast critical clinical alerts, pharmacy updates, and emergency team communications to Google Chat.
              </p>
            </div>
          </div>

          {!token ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              {isLoading ? "Connecting..." : "Authorize Google Chat"}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Broadcast Active
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {token && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Broadcast Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-600" />
                Dispatch Alert to Google Chat Space
              </h2>
              <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Space Name / ID</label>
                  {spaces.length > 0 ? (
                    <select
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      {spaces.map((sp) => (
                        <option key={sp.name} value={sp.name}>
                          {sp.displayName || sp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="spaces/XXXXXXXXXX"
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Message Content / Emergency Broadcast</label>
                  <textarea
                    rows={4}
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setMessageText(
                        "🏥 [STAT] Blood Bank Notice: Type O- Negative reserves requested for OT-2 emergency surgery."
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-[11px]"
                  >
                    Quick Preset: Blood Bank
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMessageText(
                        "💊 Pharmacy Alert: Urgent restock of Epinephrine and Heparin 5000IU delivered to Central Supply."
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-[11px]"
                  >
                    Quick Preset: Pharmacy
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !selectedSpace}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Send to Google Chat (Explicit Confirm)
                </button>
              </form>
            </div>

            {/* Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  Hospital Rapid Notification Protocol
                </h2>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-1">
                    <p className="font-semibold text-teal-900">Real-time Care Team Synchronization</p>
                    <p className="text-slate-600">
                      Messages posted via this integration appear instantaneously on Google Chat desktop and mobile devices for all subscribed hospital personnel.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-800">Security & Audit Compliance</p>
                    <p className="text-slate-600">
                      Every broadcast is authenticated using your organization's Google Workspace OAuth credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Google Chat API v1</span>
                <span>Active Spaces: {spaces.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
