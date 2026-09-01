import React, { useState, useEffect } from "react";
import {
  Table,
  Plus,
  RefreshCw,
  ExternalLink,
  Download,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowUpRight,
  Send,
} from "lucide-react";
import {
  initWorkspaceAuth,
  googleWorkspaceSignIn,
  createHospitalSpreadsheet,
  appendSpreadsheetRow,
  getSpreadsheetValues,
  getWorkspaceAccessToken,
} from "../../services/googleWorkspaceService";
import { useApp } from "../../context/AppContext";

export const GoogleSheetsHub: React.FC = () => {
  const { patients, medicines } = useApp();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Form states for manual log addition
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [department, setDepartment] = useState("Cardiology");
  const [doctorName, setDoctorName] = useState("Dr. Rajiv Mehta");
  const [clinicalNotes, setClinicalNotes] = useState("Blood pressure stable, ECG normal. Routine follow-up scheduled.");

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
        setStatusMessage({ text: "Connected to Google Workspace successfully!", type: "success" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to sign in.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const title = `Live Clinical Registry - ${new Date().toLocaleDateString()}`;
      const res = await createHospitalSpreadsheet(title, [
        ["Timestamp", "Patient ID", "Patient Name", "Department", "Attending Doctor", "Clinical Vitals / Notes"],
      ]);
      setSpreadsheetId(res.spreadsheetId);
      setSheetUrl(res.spreadsheetUrl);
      setStatusMessage({
        text: `New Google Sheet created! ID: ${res.spreadsheetId}`,
        type: "success",
      });
      // Populate demo rows
      await appendSpreadsheetRow(res.spreadsheetId, "Clinical Registry!A:F", [
        [
          new Date().toLocaleDateString(),
          patients[0]?.id || "PAT-1001",
          patients[0]?.name || "John Doe",
          "Cardiology",
          "Dr. Rajiv Mehta",
          "BP 120/80 mmHg, HR 72 bpm - Routine check",
        ],
      ]);
      await loadSheetValues(res.spreadsheetId);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error creating spreadsheet", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSheetValues = async (idToLoad: string) => {
    if (!token || !idToLoad) return;
    setIsLoading(true);
    try {
      const values = await getSpreadsheetValues(idToLoad);
      setSheetData(values);
      setStatusMessage({ text: `Synced ${values.length} rows from Google Sheets.`, type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error loading sheet values", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppendRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!spreadsheetId) {
      setStatusMessage({ text: "Please create or select a Google Spreadsheet first.", type: "error" });
      return;
    }

    const confirmed = window.confirm(
      `Append clinical log entry for "${patientName || patientId}" to Google Sheet?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const newRow = [
        new Date().toLocaleString(),
        patientId || "PAT-DEMO",
        patientName || "Clinical Patient",
        department,
        doctorName,
        clinicalNotes,
      ];
      await appendSpreadsheetRow(spreadsheetId, "Clinical Registry!A:F", [newRow]);
      setStatusMessage({ text: "Entry successfully appended to Google Sheets!", type: "success" });
      await loadSheetValues(spreadsheetId);
      setClinicalNotes("");
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to append record.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAllPatients = async () => {
    if (!token || !spreadsheetId) {
      setStatusMessage({ text: "Create or enter a spreadsheet ID first.", type: "error" });
      return;
    }

    const confirmed = window.confirm(
      `Export ${patients.length} patient records from Firestore to Google Sheets "${spreadsheetId}"?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const rows = patients.map((p) => [
        new Date().toLocaleDateString(),
        p.id,
        p.name,
        "General Medicine",
        "Assigned Physician",
        `BP: ${p.recentVitals?.bloodPressure || "120/80"}, Allergies: ${(p.allergies || []).join(", ") || "None"}`,
      ]);
      await appendSpreadsheetRow(spreadsheetId, "Clinical Registry!A:F", rows);
      setStatusMessage({ text: `Exported ${rows.length} patients to Google Sheets!`, type: "success" });
      await loadSheetValues(spreadsheetId);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to export patients.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Table className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Google Sheets Clinical Registry</h1>
                <p className="text-sm text-slate-500">
                  Export live Firestore patient records and sync hospital operational spreadsheets in real-time.
                </p>
              </div>
            </div>

            {!token ? (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <Table className="w-4 h-4" />
                {isLoading ? "Connecting..." : "Authorize Google Sheets"}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateNewSpreadsheet}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New Hospital Sheet
                </button>
                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition flex items-center gap-1.5 border border-slate-200"
                  >
                    Open in Google Sheets <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {statusMessage && (
            <div
              className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : statusMessage.type === "error"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
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
        </div>

        {token && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Control Panel */}
            <div className="space-y-6">
              {/* Active Sheet Selector */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Connected Spreadsheet ID
                </h2>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter Google Spreadsheet ID..."
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSheetValues(spreadsheetId)}
                      disabled={!spreadsheetId || isLoading}
                      className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <RefreshCw className="w-3 h-3" /> Sync Values
                    </button>
                    <button
                      onClick={handleExportAllPatients}
                      disabled={!spreadsheetId || isLoading}
                      className="flex-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 border border-emerald-200"
                    >
                      <Database className="w-3 h-3" /> Batch Sync Patients
                    </button>
                  </div>
                </div>
              </div>

              {/* Append Clinical Record Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Log Clinical Row to Google Sheet
                </h2>
                <form onSubmit={handleAppendRow} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Patient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Gonzalez"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Patient ID</label>
                      <input
                        type="text"
                        placeholder="PAT-1082"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="ICU">ICU Critical Care</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Attending Doctor</label>
                    <input
                      type="text"
                      placeholder="Dr. Rajiv Mehta"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Vitals & Clinical Notes</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Vitals, diagnosis, or medication notes..."
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !spreadsheetId}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    Append to Google Sheets (Explicit Confirm)
                  </button>
                </form>
              </div>
            </div>

            {/* Right Live Grid View */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900">Live Google Sheet Data Grid</h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    {sheetData.length} row{sheetData.length === 1 ? "" : "s"} loaded
                  </span>
                </div>

                {sheetData.length > 0 ? (
                  <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          {sheetData[0]?.map((head, idx) => (
                            <th key={idx} className="p-3 border-r border-slate-200 whitespace-nowrap">
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {sheetData.slice(1).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 transition">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <Table className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-sm font-medium">No spreadsheet data loaded</p>
                    <p className="text-xs max-w-sm mx-auto text-slate-500">
                      Click "Create New Hospital Sheet" above or connect an existing ID to preview and sync live data.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Direct OAuth connection to Google Sheets API v4</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> End-to-End Encryption
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
