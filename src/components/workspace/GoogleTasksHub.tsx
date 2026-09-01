import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  listGoogleTasks,
  createGoogleTask,
  toggleGoogleTaskStatus,
  deleteGoogleTask,
  GoogleTask,
} from "../../services/googleWorkspaceService";

export const GoogleTasksHub: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New task form
  const [title, setTitle] = useState("Review bedside vitals for Bed 12 - ICU");
  const [notes, setNotes] = useState("Verify arterial line calibration and IV antibiotic titration.");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    initWorkspaceAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
        loadTasks();
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
        await loadTasks();
        setStatusMessage({ text: "Connected to Google Tasks successfully!", type: "success" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to connect Google Tasks", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const items = await listGoogleTasks();
      setTasks(items);
    } catch (err: any) {
      console.warn("Google Tasks fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const confirmed = window.confirm(`Create Google Task: "${title}"?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await createGoogleTask(title, notes, dueDate);
      setStatusMessage({ text: "Created Google Task!", type: "success" });
      setTitle("");
      setNotes("");
      await loadTasks();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to create task", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (task: GoogleTask) => {
    setIsLoading(true);
    try {
      await toggleGoogleTaskStatus(task.id, task.status);
      await loadTasks();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to toggle task", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (task: GoogleTask) => {
    const confirmed = window.confirm(`Delete Google Task "${task.title}"?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteGoogleTask(task.id);
      setStatusMessage({ text: `Deleted "${task.title}"`, type: "success" });
      await loadTasks();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to delete task", type: "error" });
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
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Google Tasks Clinical Action Tracker</h1>
              <p className="text-sm text-slate-500">
                Track clinical to-dos, doctor orders, medication reviews, and discharge tasks across care teams.
              </p>
            </div>
          </div>

          {!token ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              {isLoading ? "Connecting..." : "Authorize Google Tasks"}
            </button>
          ) : (
            <button
              onClick={loadTasks}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Tasks
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
            {/* Create Task Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add Clinical Task
              </h2>
              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Clinical Details / Instructions</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Create Task (Explicit Confirm)
                </button>
              </form>
            </div>

            {/* Task List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Your Google Tasks (@default list)</h2>
                <span className="text-xs text-slate-500">{tasks.length} task(s)</span>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {tasks.map((task) => {
                    const isDone = task.status === "completed";
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                          isDone
                            ? "bg-slate-50 border-slate-200 opacity-60"
                            : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <p className={`text-sm font-semibold ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                              {task.title}
                            </p>
                            {task.notes && (
                              <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{task.notes}</p>
                            )}
                            {task.due && (
                              <div className="flex items-center gap-1 text-[11px] text-indigo-600 mt-1.5">
                                <Clock className="w-3 h-3" /> Due: {new Date(task.due).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <CheckSquare className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No tasks found</p>
                  <p className="text-xs text-slate-500">Create clinical orders or patient follow-ups above.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
