import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CalendarCheck,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  GoogleCalendarEvent,
} from "../../services/googleWorkspaceService";
import { useApp } from "../../context/AppContext";

export const GoogleCalendarHub: React.FC = () => {
  const { doctors, patients } = useApp();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Event Form State
  const [summary, setSummary] = useState("Doctor Consultation: Follow-up Clinical Check");
  const [description, setDescription] = useState("Patient vitals review and prescription refill consultation.");
  const [location, setLocation] = useState("People's Hospital - OPD Room 204");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [attendeeEmail, setAttendeeEmail] = useState("patient@example.com");

  useEffect(() => {
    initWorkspaceAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
        loadEvents();
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
        await loadEvents();
        setStatusMessage({ text: "Connected to Google Calendar successfully!", type: "success" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to connect Google Calendar", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const items = await listCalendarEvents(25);
      setEvents(items);
    } catch (err: any) {
      console.warn("Calendar fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const startISO = `${startDate}T${startTime}:00`;
    const endISO = `${startDate}T${endTime}:00`;

    const confirmed = window.confirm(
      `Schedule Google Calendar event: "${summary}" on ${startDate} at ${startTime}?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const created = await createCalendarEvent({
        summary,
        description,
        location,
        startDateTime: startISO,
        endDateTime: endISO,
        attendeeEmail: attendeeEmail.trim() || undefined,
      });

      setStatusMessage({ text: `Event created on your primary Google Calendar!`, type: "success" });
      await loadEvents();
      setDescription("");
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to create calendar event", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (event: GoogleCalendarEvent) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the calendar event "${event.summary}"? This action mutates your Google Calendar.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteCalendarEvent(event.id);
      setStatusMessage({ text: `Deleted "${event.summary}" from Google Calendar`, type: "success" });
      await loadEvents();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to delete calendar event", type: "error" });
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
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Google Calendar Clinical Schedule</h1>
              <p className="text-sm text-slate-500">
                Sync hospital appointments, doctor rounds, and patient follow-ups directly to Google Calendar.
              </p>
            </div>
          </div>

          {!token ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <CalendarIcon className="w-4 h-4" />
              {isLoading ? "Connecting..." : "Authorize Google Calendar"}
            </button>
          ) : (
            <button
              onClick={loadEvents}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Events
            </button>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Event Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Schedule Clinical Event
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Event Summary / Title</label>
                  <input
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location / Room</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Attendee Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Create on Google Calendar (Explicit Confirm)
                </button>
              </form>
            </div>

            {/* Events List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Upcoming Google Calendar Events
                </h2>
                <span className="text-xs text-slate-500">{events.length} event(s)</span>
              </div>

              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((evt) => {
                    const startStr = evt.start?.dateTime
                      ? new Date(evt.start.dateTime).toLocaleString()
                      : evt.start?.date || "All Day";
                    return (
                      <div
                        key={evt.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{evt.summary}</h3>
                            {evt.htmlLink && (
                              <a
                                href={evt.htmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-blue-600 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-500" /> {startStr}
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {evt.location}
                              </span>
                            )}
                          </div>
                          {evt.description && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{evt.description}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(evt)}
                          className="self-end sm:self-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No upcoming events found</p>
                  <p className="text-xs text-slate-500">Create a clinical schedule slot using the form on the left.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
