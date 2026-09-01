import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Share2,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  createGoogleForm,
  GoogleFormItem,
} from "../../services/googleWorkspaceService";

export const GoogleFormsHub: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [forms, setForms] = useState<GoogleFormItem[]>([]);
  const [title, setTitle] = useState("Patient Post-Discharge Recovery & Satisfaction Survey");
  const [description, setDescription] = useState("Hospital survey evaluating patient recovery, medication adherence, and doctor communication.");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
    setIsLoading(true);
    try {
      const res = await googleWorkspaceSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ text: "Connected to Google Forms API!", type: "success" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to connect Google Forms", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const confirmed = window.confirm(`Create Google Form "${title}"?`);
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const created = await createGoogleForm(title, description);
      setForms((prev) => [created, ...prev]);
      setStatusMessage({ text: `Created Google Form! Form ID: ${created.formId}`, type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to create Google Form", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Google Forms Patient Intake & Surveys</h1>
              <p className="text-sm text-slate-500">
                Create digital intake questionnaires, clinical feedback surveys, and patient experience forms.
              </p>
            </div>
          </div>

          {!token ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              {isLoading ? "Connecting..." : "Authorize Google Forms"}
            </button>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
              Forms API Active
            </span>
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
            {/* Create Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                Build Digital Form
              </h2>
              <form onSubmit={handleCreateForm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Form Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Survey Description</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("OPD Patient Experience & Wait Time Survey");
                      setDescription("Evaluate outpatient registration speed, physician attentiveness, and pharmacy dispensary speed.");
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-[11px]"
                  >
                    Preset: OPD Wait Time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("Medication Adverse Drug Reaction (ADR) Report");
                      setDescription("Clinical questionnaire for patients reporting unexpected symptoms after starting new prescription regimens.");
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-[11px]"
                  >
                    Preset: ADR Form
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Create Google Form (Explicit Confirm)
                </button>
              </form>
            </div>

            {/* Created Forms List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                Created Clinical Forms
              </h2>

              {forms.length > 0 ? (
                <div className="space-y-3">
                  {forms.map((f) => (
                    <div
                      key={f.formId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{f.info?.title || "Clinical Survey"}</h3>
                        <a
                          href={`https://docs.google.com/forms/d/${f.formId}/edit`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                        >
                          Open in Google Forms <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-600">{f.info?.description}</p>
                      <div className="text-[11px] font-mono text-slate-400">ID: {f.formId}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <ClipboardList className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No forms generated yet</p>
                  <p className="text-xs text-slate-500">Create a clinical survey using the form on the left.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
