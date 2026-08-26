import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  X,
  AlertTriangle,
  Pill,
  FileCheck2,
  TrendingUp,
  Send,
  Loader2,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

export const AiSupportModal: React.FC = () => {
  const {
    aiModalOpen,
    setAiModalOpen,
    aiModalInitialType,
    medicines,
    prescriptions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "interaction" | "medicine_info" | "prescription_audit" | "stock_forecast"
  >(aiModalInitialType || "interaction");

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick preset pills for easy interactive demo
  const interactionPresets = [
    "Telmisartan + Formoterol Inhaler",
    "Metformin + Atorvastatin",
    "Amoxicillin/Clavulanate + Warfarin",
    "Paracetamol + Alcohol + Tramadol",
  ];

  const medicinePresets = [
    "Telmisartan 40mg",
    "Amoxicillin + Clavulanic Acid",
    "Metformin HCl 500mg SR",
    "Pantoprazole 40mg",
  ];

  const stockPresets = [
    "Telmisartan 40mg (Current stock: 48 units, Reorder: 80)",
    "Montelukast + Levocetirizine (Stock: 0, Out of stock)",
    "Amoxicillin 625mg (Seasonal monsoon surge demand)",
  ];

  if (!aiModalOpen) return null;

  const handleRunAi = async (customQuery?: string) => {
    const inputQuery = customQuery !== undefined ? customQuery : query;
    if (!inputQuery.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/gemini/healthcare-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          query: inputQuery,
          context: {
            availableMedicinesCount: medicines.length,
            recentPrescriptionsCount: prescriptions.length,
          },
        }),
      });

      const data = await response.json();
      if (data.response) {
        setResult(data.response);
        setDisclaimer(data.disclaimer);
      } else {
        setResult("Unable to process clinical request. Please verify inputs.");
      }
    } catch (err) {
      console.error(err);
      setResult("Clinical decision engine offline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="ai-support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-lg">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                People's Hospital AI Clinical Decision Support
                <span className="text-xs bg-teal-400/20 text-teal-200 font-medium px-2 py-0.5 rounded-full border border-teal-400/30">
                  v3.7 Clinical Engine
                </span>
              </h2>
              <p className="text-xs text-blue-100/80">
                Evidence-based intelligence for Doctors, Pharmacists & Hospital Teams
              </p>
            </div>
          </div>
          <button
            id="close-ai-modal-btn"
            onClick={() => setAiModalOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            id="tab-ai-interaction"
            onClick={() => {
              setActiveTab("interaction");
              setResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap ${
              activeTab === "interaction"
                ? "border-blue-600 text-blue-700 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Drug Interaction Checker
          </button>
          <button
            id="tab-ai-medicine-info"
            onClick={() => {
              setActiveTab("medicine_info");
              setResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap ${
              activeTab === "medicine_info"
                ? "border-blue-600 text-blue-700 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Pill className="w-4 h-4 text-teal-600" />
            Medicine Informatics
          </button>
          <button
            id="tab-ai-rx-audit"
            onClick={() => {
              setActiveTab("prescription_audit");
              setResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap ${
              activeTab === "prescription_audit"
                ? "border-blue-600 text-blue-700 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            Prescription Safety Audit
          </button>
          <button
            id="tab-ai-stock-forecast"
            onClick={() => {
              setActiveTab("stock_forecast");
              setResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap ${
              activeTab === "stock_forecast"
                ? "border-blue-600 text-blue-700 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Stock & Demand Forecast
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Query Input Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {activeTab === "interaction" && "Enter Medications to Check for Interactions:"}
              {activeTab === "medicine_info" && "Enter Generic or Brand Medicine Name:"}
              {activeTab === "prescription_audit" && "Enter Prescription Regimen & Patient Details:"}
              {activeTab === "stock_forecast" && "Enter Medicine Item & Inventory Parameters:"}
            </label>

            <div className="flex gap-2">
              <input
                id="ai-query-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunAi()}
                placeholder={
                  activeTab === "interaction"
                    ? "e.g., Telmisartan 40mg + Formoterol Inhaler + Aspirin"
                    : activeTab === "medicine_info"
                    ? "e.g., Amoxicillin Clavulanate 625mg or Atorvastatin"
                    : activeTab === "prescription_audit"
                    ? "e.g., RX-9041: Telmisartan 40mg daily + Budesonide inhaler for 42yo female"
                    : "e.g., Telmisartan 40mg current 48 units, weekly burn rate 18 units"
                }
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <button
                id="run-ai-btn"
                onClick={() => handleRunAi()}
                disabled={loading || !query.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Analyze
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Quick Sample:</span>
              {(activeTab === "interaction"
                ? interactionPresets
                : activeTab === "medicine_info"
                ? medicinePresets
                : activeTab === "stock_forecast"
                ? stockPresets
                : [
                    "RX-9041 (Eleanor Vance - Hypertension + Asthma)",
                    "RX-9038 (James Rodriguez - T2D + Statin)",
                  ]
              ).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset);
                    handleRunAi(preset);
                  }}
                  className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Results Output */}
          {result && (
            <div className="mt-4 p-4.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Clinical Intelligence Output
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                {result}
              </div>
            </div>
          )}

          {/* Important Decision-Support Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 leading-normal">
              <span className="font-semibold">Clinical Decision-Support Notice:</span>{" "}
              {disclaimer ||
                "This AI tool provides evidence-based suggestions and alerts to assist clinical workflow. Final medical, prescription, and dispensing decisions remain with licensed healthcare professionals."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Integrated with Hospital EHR & Smart Pharmacy Knowledge Base
          </span>
          <button
            onClick={() => setAiModalOpen(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
