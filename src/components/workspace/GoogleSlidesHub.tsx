import React, { useState, useEffect } from "react";
import {
  Presentation,
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  createPresentation,
  addSlideToPresentation,
  GooglePresentation,
} from "../../services/googleWorkspaceService";
import { useApp } from "../../context/AppContext";

export const GoogleSlidesHub: React.FC = () => {
  const { patients } = useApp();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [presentations, setPresentations] = useState<GooglePresentation[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string>("");
  const [currentDeckUrl, setCurrentDeckUrl] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Slide creation form
  const [deckTitle, setDeckTitle] = useState("Hypertension & Diabetes Quality Review");
  const [slideHeading, setSlideHeading] = useState("Patient Cohort Vital Signs Breakdown");
  const [bullet1, setBullet1] = useState("Analyzed 250 outpatient visits across Cardiology and Internal Medicine.");
  const [bullet2, setBullet2] = useState("88% of patients maintained systolic BP below 130 mmHg with dual-therapy regimen.");
  const [bullet3, setBullet3] = useState("Adherence monitoring enhanced with digital prescription counseling.");

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
        setStatusMessage({ text: "Connected to Google Slides API successfully!", type: "success" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to connect Google Slides", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const confirmed = window.confirm(`Create new Google Slides presentation: "${deckTitle}"?`);
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const created = await createPresentation(deckTitle);
      setCurrentDeckId(created.presentationId);
      const url = `https://docs.google.com/presentation/d/${created.presentationId}/edit`;
      setCurrentDeckUrl(url);
      setPresentations((prev) => [{ ...created, webViewLink: url }, ...prev]);
      setStatusMessage({
        text: `Created presentation "${deckTitle}"! ID: ${created.presentationId}`,
        type: "success",
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to create presentation", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = async () => {
    if (!token || !currentDeckId) {
      setStatusMessage({ text: "Create or select a presentation first.", type: "error" });
      return;
    }

    const confirmed = window.confirm(`Add slide "${slideHeading}" to Google Slides deck?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await addSlideToPresentation(currentDeckId, slideHeading, [bullet1, bullet2, bullet3]);
      setStatusMessage({ text: `Slide added successfully to presentation!`, type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to add slide", type: "error" });
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
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Google Slides Clinical Case Studies</h1>
              <p className="text-sm text-slate-500">
                Generate clinical grand rounds, medical audits, and department review decks with Google Slides API.
              </p>
            </div>
          </div>

          {!token ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <Presentation className="w-4 h-4" />
              {isLoading ? "Connecting..." : "Authorize Google Slides"}
            </button>
          ) : currentDeckUrl ? (
            <a
              href={currentDeckUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-medium rounded-xl transition flex items-center gap-1.5 border border-amber-200"
            >
              Open in Google Slides <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
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
            {/* Create Presentation Deck */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                1. Create Clinical Deck
              </h2>
              <form onSubmit={handleCreateDeck} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Presentation Title</label>
                  <input
                    type="text"
                    required
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Create Google Slides Deck (Explicit Confirm)
                </button>
              </form>

              {currentDeckId && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-amber-900">Active Deck ID:</div>
                  <div className="font-mono text-slate-700 break-all">{currentDeckId}</div>
                </div>
              )}
            </div>

            {/* Append Slide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                2. Append Clinical Content Slide
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Slide Title</label>
                  <input
                    type="text"
                    value={slideHeading}
                    onChange={(e) => setSlideHeading(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Key Finding / Metric 1</label>
                  <input
                    type="text"
                    value={bullet1}
                    onChange={(e) => setBullet1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Key Finding / Metric 2</label>
                  <input
                    type="text"
                    value={bullet2}
                    onChange={(e) => setBullet2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Outcome / Recommendation</label>
                  <input
                    type="text"
                    value={bullet3}
                    onChange={(e) => setBullet3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddSlide}
                  disabled={isLoading || !currentDeckId}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Insert Slide into Presentation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
