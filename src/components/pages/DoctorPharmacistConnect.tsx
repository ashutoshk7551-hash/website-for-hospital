import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  MessageSquare,
  Send,
  Stethoscope,
  Pill,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const DoctorPharmacistConnect: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    prescriptions,
    activeRole,
    setActiveRole,
    setAiModalOpen,
    setAiModalInitialType,
  } = useApp();

  const [messageText, setMessageText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("Prescription Clarification");
  const [urgency, setUrgency] = useState<"routine" | "important" | "urgent">("important");
  const [selectedRxRef, setSelectedRxRef] = useState<string>(prescriptions[0]?.id || "");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const isDoctor = activeRole === "doctor";

    sendChatMessage({
      senderRole: isDoctor ? "doctor" : "pharmacist",
      senderName: isDoctor ? "Dr. Sarah Chen, MD" : "Pharm. Robert Miller, RPh",
      recipientName: isDoctor ? "Pharm. Robert Miller, RPh" : "Dr. Sarah Chen, MD",
      topic: selectedTopic,
      relatedPrescriptionId: selectedRxRef,
      urgency,
      content: messageText,
    });

    setMessageText("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Inter-Professional Collaboration
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Doctor ↔ Pharmacist Connect & Clinical Dialogue
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-0.5">
            Resolve prescription clarifications, drug-drug interaction warnings, and dosage adjustments in seconds.
          </p>
        </div>

        {/* Demo Role Switcher Toggle */}
        <div className="bg-white/10 p-2 rounded-2xl flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium px-2">Sending As:</span>
          <button
            onClick={() => setActiveRole("doctor")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeRole === "doctor" ? "bg-teal-500 text-slate-950" : "text-white hover:bg-white/10"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor
          </button>
          <button
            onClick={() => setActiveRole("pharmacist")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeRole === "pharmacist" ? "bg-teal-500 text-slate-950" : "text-white hover:bg-white/10"
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> Pharmacist
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (4 cols): Quick Topic Presets & Rx Reference */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Collaboration Presets
            </h3>

            <div className="space-y-2">
              {[
                { title: "Prescription Clarification", desc: "Clarify frequency or dosage ambiguity" },
                { title: "Drug Interaction Alert", desc: "Flag CYP450 or synergistic contraindications" },
                { title: "Dosage Adjustment", desc: "Renal/hepatic dose recalculation" },
                { title: "Alternative Medicine Suggestion", desc: "Suggest formulary in-stock substitute" },
              ].map((topic) => (
                <button
                  key={topic.title}
                  onClick={() => setSelectedTopic(topic.title)}
                  className={`w-full text-left p-3 rounded-2xl border transition text-xs ${
                    selectedTopic === topic.title
                      ? "bg-teal-50 border-teal-300 ring-2 ring-teal-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-bold text-slate-900">{topic.title}</div>
                  <div className="text-[11px] text-slate-500">{topic.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700">Urgency Level</label>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                {(["routine", "important", "urgent"] as const).map((urg) => (
                  <button
                    key={urg}
                    onClick={() => setUrgency(urg)}
                    className={`py-1.5 rounded-xl font-bold capitalize transition ${
                      urgency === urg
                        ? urg === "urgent"
                          ? "bg-red-600 text-white"
                          : urg === "important"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (8 cols): Interactive Live Conversation Stream */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  Rx
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Clinical Inquiry Channel: Dr. Sarah Chen ↔ Pharm. Robert Miller
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Topic: <strong className="text-teal-700">{selectedTopic}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setAiModalInitialType("interaction");
                  setAiModalOpen(true);
                }}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Safety Opinion
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => {
                const isCurrentRole = msg.senderRole === activeRole;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCurrentRole ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px]">
                      <span className="font-bold text-slate-800">{msg.senderName}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          msg.senderRole === "doctor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {msg.senderRole}
                      </span>
                      <span className="text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-2xs ${
                        isCurrentRole
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-1 text-[10px] opacity-90">
                        <span>Topic: {msg.topic}</span>
                        {msg.urgency === "urgent" && (
                          <span className="bg-red-500 text-white font-bold px-1.5 py-0.2 rounded">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Send Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Type clinical response as ${activeRole === "doctor" ? "Doctor" : "Pharmacist"}...`}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
