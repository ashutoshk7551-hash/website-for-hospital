import React, { useState, useEffect } from "react";
import {
  StickyNote,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  AlertCircle,
  Tag,
  Palette,
} from "lucide-react";
import {
  getLocalKeepNotes,
  saveLocalKeepNotes,
  ClinicalKeepNote,
} from "../../services/googleWorkspaceService";

export const GoogleKeepHub: React.FC = () => {
  const [notes, setNotes] = useState<ClinicalKeepNote[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState("amber");
  const [isPinned, setIsPinned] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const loaded = getLocalKeepNotes();
    setNotes(loaded);
  }, []);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim()) return;

    const newNote: ClinicalKeepNote = {
      id: `note-${Date.now()}`,
      title: title.trim() || "Untitled Bedside Note",
      body: body.trim(),
      color,
      pinned: isPinned,
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveLocalKeepNotes(updated);
    setTitle("");
    setBody("");
    setIsPinned(false);
    setStatusMessage({ text: "Note saved to Clinical Keep Scratchpad!", type: "success" });
  };

  const handleDeleteNote = (noteId: string) => {
    const confirmed = window.confirm("Delete this clinical note?");
    if (!confirmed) return;

    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    saveLocalKeepNotes(updated);
  };

  const handleTogglePin = (noteId: string) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n));
    setNotes(updated);
    saveLocalKeepNotes(updated);
  };

  const getColorClass = (c: string) => {
    switch (c) {
      case "amber":
        return "bg-amber-50/80 border-amber-200 text-amber-950";
      case "emerald":
        return "bg-emerald-50/80 border-emerald-200 text-emerald-950";
      case "sky":
        return "bg-sky-50/80 border-sky-200 text-sky-950";
      case "rose":
        return "bg-rose-50/80 border-rose-200 text-rose-950";
      case "purple":
        return "bg-purple-50/80 border-purple-200 text-purple-950";
      default:
        return "bg-slate-50 border-slate-200 text-slate-900";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md font-bold">
              <StickyNote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Google Keep Clinical Bedside Scratchpad</h1>
              <p className="text-sm text-slate-500">
                Capture rapid doctor memos, clinical handovers, and ICU shift reminders with quick-color tags.
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
            {notes.length} Active Memo(s)
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 border bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Note Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              New Bedside Memo
            </h2>
            <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bed 6 Titration Alert"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Memo Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Clinical observation, pharmacy instructions, or handover note..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(["amber", "emerald", "sky", "rose", "purple"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        c === "amber"
                          ? "bg-amber-300"
                          : c === "emerald"
                          ? "bg-emerald-300"
                          : c === "sky"
                          ? "bg-sky-300"
                          : c === "rose"
                          ? "bg-rose-300"
                          : "bg-purple-300"
                      } ${color === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                    />
                  ))}
                </div>

                <label className="flex items-center gap-1.5 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  Pin note
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-lg shadow-sm transition"
              >
                Save Memo
              </button>
            </form>
          </div>

          {/* Notes Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between space-y-3 ${getColorClass(
                    note.color
                  )}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold">{note.title}</h3>
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className={`p-1 rounded-md transition ${
                          note.pinned ? "text-amber-800 bg-amber-200/60" : "text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs whitespace-pre-line leading-relaxed">{note.body}</p>
                  </div>

                  <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] opacity-70">
                    <span>{note.createdAt}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="hover:text-rose-700 transition"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
