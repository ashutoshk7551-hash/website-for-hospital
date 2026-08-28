import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Smartphone,
  X,
  CheckCheck,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Send,
  Sparkles,
  PhoneCall,
  Info,
} from "lucide-react";

export const SmsDeviceModal: React.FC = () => {
  const { activeSmsPreview, setActiveSmsPreview, confirmAppointmentViaSms } = useApp();
  const [replyInput, setReplyInput] = useState<string>("");
  const [repliedMessages, setRepliedMessages] = useState<string[]>([]);

  if (!activeSmsPreview) return null;

  const handleSendReply = (text?: string) => {
    const reply = (text || replyInput).trim();
    if (!reply) return;
    setRepliedMessages((prev) => [...prev, reply]);
    setReplyInput("");
    if (reply === "1" || reply.toLowerCase().includes("confirm") || reply.toLowerCase().includes("yes")) {
      confirmAppointmentViaSms(activeSmsPreview.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 rounded-[40px] p-4 sm:p-5 border-4 border-slate-700 shadow-2xl space-y-4 text-white">
        {/* Phone Notch & Speaker bar */}
        <div className="flex items-center justify-between px-4 pt-1 pb-2">
          <div className="text-[11px] font-semibold text-slate-400">9:41 AM</div>
          <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <div className="w-8 h-1.5 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* SMS Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-100">PEOPLES-HOSP</span>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-teal-500/30 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                To: {activeSmsPreview.patientPhone} ({activeSmsPreview.patientName})
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveSmsPreview(null)}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SMS Message Container */}
        <div className="bg-slate-950 rounded-3xl p-4 border border-slate-800 space-y-4 max-h-[380px] overflow-y-auto">
          {/* Timestamp Header */}
          <div className="text-center">
            <span className="text-[10px] bg-slate-900 text-slate-400 px-3 py-1 rounded-full border border-slate-800">
              Automated 1-Day Appointment Reminder • {activeSmsPreview.sentAt}
            </span>
          </div>

          {/* Incoming Hospital SMS Bubble */}
          <div className="flex flex-col items-start space-y-1.5 max-w-[92%]">
            <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-sm border border-slate-700 text-xs leading-relaxed shadow-md space-y-2">
              <div className="font-semibold text-teal-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> People's Hospital OPD Notification
              </div>
              <p>{activeSmsPreview.smsMessage}</p>
              
              <div className="pt-2 border-t border-slate-700/70 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>{activeSmsPreview.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{activeSmsPreview.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{activeSmsPreview.roomNumber} (Token: {activeSmsPreview.tokenNumber})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 pl-1">
              <span>Delivered via SMS Gateway</span>
              <CheckCheck className="w-3 h-3 text-teal-400" />
            </div>
          </div>

          {/* Outgoing Replies (Simulated Patient Responses) */}
          {activeSmsPreview.patientConfirmed && (
            <div className="flex flex-col items-end space-y-1 max-w-[85%] ml-auto">
              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm text-xs shadow-md">
                1 (Confirmed) - I will be there on time. Thank you!
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 pr-1">
                <span>Delivered</span>
                <CheckCheck className="w-3 h-3 text-blue-400" />
              </div>
            </div>
          )}

          {repliedMessages.map((msg, i) => (
            <div key={i} className="flex flex-col items-end space-y-1 max-w-[85%] ml-auto">
              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm text-xs shadow-md">
                {msg}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 pr-1">
                <span>Delivered</span>
                <CheckCheck className="w-3 h-3 text-blue-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Patient Response Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Simulate Patient SMS Response:</span>
            {activeSmsPreview.patientConfirmed && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Confirmed
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSendReply("1 (Confirm Appointment)")}
              className="px-2.5 py-1 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-200 text-xs rounded-lg transition font-medium flex items-center gap-1"
            >
              Reply "1" (Confirm)
            </button>
            <button
              onClick={() => handleSendReply("Need to reschedule to afternoon slot")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition font-medium"
            >
              Reply "Reschedule"
            </button>
            <button
              onClick={() => handleSendReply("Please send directions to OPD Room")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition font-medium"
            >
              Reply "Directions"
            </button>
          </div>
        </div>

        {/* Reply Input Bar */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <input
            type="text"
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
            placeholder="Type text message..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSendReply()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
            disabled={!replyInput.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Technical Footer Metadata */}
        <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal-400" /> HIPAA TLS 1.3 Encryption
          </span>
          <span>Carrier: Twilio Healthcare SMS</span>
        </div>
      </div>
    </div>
  );
};
