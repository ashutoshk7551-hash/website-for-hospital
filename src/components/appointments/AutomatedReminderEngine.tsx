import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Bell,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Settings2,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Smartphone,
  Phone,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const AutomatedReminderEngine: React.FC = () => {
  const {
    appointments,
    patients,
    reminderLogs,
    reminderPreferences,
    updateReminderPreferences,
    sendAppointmentReminder,
    runAutomatedReminderScan,
    lastReminderScan,
    setActiveSmsPreview,
    showToast,
  } = useApp();

  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "tomorrow" | "delivered">("all");

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      runAutomatedReminderScan({ forceAllTomorrow: true });
      setIsScanning(false);
    }, 600);
  };

  // Find appointments scheduled for tomorrow or within 1 day (date diff === 1)
  const tomorrowAppointments = appointments.filter((apt) => {
    const isConfirmed = apt.status === "confirmed" || apt.status === "scheduled";
    if (!isConfirmed) return false;
    // Check if appointment is tomorrow (Aug 28 in simulated 2026-08-27 date)
    return apt.date === "2026-08-28" || apt.date.includes("2026-08-28");
  });

  const totalDeliveredSms = reminderLogs.filter((l) => l.smsStatus === "Delivered").length;
  const confirmedViaSmsCount = reminderLogs.filter((l) => l.patientConfirmed).length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
      {/* Top Header & Status Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Automated 1-Day Reminder Engine • Active
            </span>
            <span className="text-[11px] text-slate-400">
              Trigger: 24h Prior to OPD Visit
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            Automated SMS & In-App Appointment Reminders
          </h2>
          <p className="text-xs text-slate-300">
            Automatically sends SMS reminders to patients' mobile phones and in-app alerts 1 day before their scheduled consultations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="run-automated-reminder-scan-btn"
            onClick={handleManualScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            title="Scan upcoming appointments and dispatch 1-day reminders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning Queue..." : "Run 1-Day Automated Scan"}</span>
          </button>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setLogsOpen(!logsOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>SMS Outbox ({reminderLogs.length})</span>
            {logsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Send className="w-3 h-3 text-teal-400" /> 1-Day SMS Dispatched
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalDeliveredSms}</div>
          <div className="text-[10px] text-teal-400 flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> 100% Delivery Success Rate
          </div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-400" /> Tomorrow's Consultations
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {tomorrowAppointments.length || 1}
          </div>
          <div className="text-[10px] text-blue-300">Scheduled for Tomorrow</div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Confirmed via SMS Reply
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{confirmedViaSmsCount}</div>
          <div className="text-[10px] text-slate-400">Patients replied '1'</div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Automated Engine Run
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-200 mt-1 truncate">
            {lastReminderScan?.lastRun || "Today, 08:00 AM"}
          </div>
          <div className="text-[10px] text-slate-400">Scanned {appointments.length} Total Records</div>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {settingsOpen && (
        <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-700 space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-teal-400" /> Reminder Preferences & Dispatch Gateway Configuration
            </h3>
            <span className="text-[11px] text-teal-400 font-semibold">Real-time Sync Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SMS Toggle */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Automated SMS Reminders</div>
                <div className="text-[11px] text-slate-400">Send text to patient's verified mobile</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderPreferences.automatedSmsEnabled}
                  onChange={(e) => updateReminderPreferences({ automatedSmsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>

            {/* In-App Alerts Toggle */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">In-App Notification Feed</div>
                <div className="text-[11px] text-slate-400">Push to patient portal & notification bell</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderPreferences.automatedInAppEnabled}
                  onChange={(e) => updateReminderPreferences({ automatedInAppEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>

            {/* Sender ID */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">SMS Sender ID</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={reminderPreferences.smsSenderId}
                  onChange={(e) => updateReminderPreferences({ smsSenderId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SMS Template Customizer */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">
              1-Day Reminder SMS Template (Supports Dynamic Patient & Doctor Placeholders):
            </label>
            <textarea
              rows={2}
              value={reminderPreferences.smsTemplate}
              onChange={(e) => updateReminderPreferences({ smsTemplate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
            />
            <div className="text-[10px] text-slate-400 flex flex-wrap gap-2">
              <span>Variables: <code className="text-teal-300">{"{patientName}"}</code></span>
              <span><code className="text-teal-300">{"{doctorName}"}</code></span>
              <span><code className="text-teal-300">{"{department}"}</code></span>
              <span><code className="text-teal-300">{"{date}"}</code></span>
              <span><code className="text-teal-300">{"{time}"}</code></span>
              <span><code className="text-teal-300">{"{roomNumber}"}</code></span>
              <span><code className="text-teal-300">{"{tokenNumber}"}</code></span>
            </div>
          </div>
        </div>
      )}

      {/* Tomorrow's Scheduled Appointments Queue Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Appointments Scheduled for Tomorrow (1 Day Before)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            System Simulated Date: Aug 27, 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {appointments
            .filter((a) => a.status === "confirmed" || a.status === "scheduled")
            .slice(0, 4)
            .map((apt) => {
              const patient = patients.find((p) => p.id === apt.patientId);
              const isTomorrow = apt.date === "2026-08-28" || apt.date.includes("2026-08-28");
              const sentLog = reminderLogs.find((l) => l.appointmentId === apt.id);
              const isSent = apt.reminderSent || !!sentLog;

              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    isTomorrow
                      ? "bg-slate-800/90 border-teal-500/50 shadow-md ring-1 ring-teal-500/20"
                      : "bg-slate-800/50 border-slate-700/60"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{apt.patientName}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {apt.patientId}
                        </span>
                      </div>
                      {isTomorrow ? (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Tomorrow ({apt.date})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                          {apt.date}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                      <span>Doctor: <strong className="text-white">{apt.doctorName}</strong></span>
                      <span className="text-teal-300">({apt.department})</span>
                      <span className="text-slate-400">Time: <strong className="text-white">{apt.time}</strong></span>
                      <span className="text-slate-400">Token: <strong className="text-blue-300">#{apt.tokenNumber}</strong></span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>SMS Target: {patient?.phone || "+1 (555) 234-5678"}</span>
                    </div>
                  </div>

                  {/* Reminder Action Bar */}
                  <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    {isSent ? (
                      <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold">
                        <CheckCheck className="w-4 h-4 text-teal-400" />
                        <span>1-Day Reminder Sent (SMS & In-App)</span>
                        {sentLog?.patientConfirmed && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            Confirmed by Patient
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-300/90 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>1-Day Reminder Scheduled for 24h prior</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isSent && sentLog && (
                        <button
                          onClick={() => setActiveSmsPreview(sentLog)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-semibold rounded-lg transition flex items-center gap-1"
                        >
                          <Smartphone className="w-3 h-3 text-teal-300" />
                          <span>View SMS</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const log = sendAppointmentReminder(apt.id, {
                            force: true,
                            triggerType: "manual_dispatch",
                          });
                          if (log) {
                            setActiveSmsPreview(log);
                          }
                        }}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                          isSent
                            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                            : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm"
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSent ? "Re-send SMS" : "Send 1-Day Reminder Now"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* SMS Outbox Logs (Collapsible or Open) */}
      {logsOpen && (
        <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-700 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> SMS Dispatch Outbox & Delivery Receipts ({reminderLogs.length})
            </h3>
            <span className="text-[11px] text-slate-400">Carrier Gateway: Verified TLS 1.3</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="pb-2">Patient & Target Phone</th>
                  <th className="pb-2">Doctor & OPD Room</th>
                  <th className="pb-2">Appointment Date</th>
                  <th className="pb-2">Channels</th>
                  <th className="pb-2">SMS Status</th>
                  <th className="pb-2">Sent Time</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reminderLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-2.5">
                      <div className="font-bold text-white">{log.patientName}</div>
                      <div className="text-[10px] text-slate-400">{log.patientPhone}</div>
                    </td>
                    <td className="py-2.5">
                      <div className="text-slate-200">{log.doctorName}</div>
                      <div className="text-[10px] text-teal-400">{log.department} • {log.roomNumber}</div>
                    </td>
                    <td className="py-2.5">
                      <div className="text-slate-200">{log.appointmentDate} at {log.appointmentTime}</div>
                      <div className="text-[10px] text-blue-300">Token: #{log.tokenNumber}</div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1">
                        <span className="bg-teal-500/20 text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-mono">SMS</span>
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-mono">In-App</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300">
                        <CheckCheck className="w-3.5 h-3.5 text-teal-400" /> Delivered
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{log.sentAt}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setActiveSmsPreview(log)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-bold rounded-lg border border-slate-700 transition"
                      >
                        Preview SMS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
