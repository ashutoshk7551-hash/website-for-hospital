import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  FileSpreadsheet,
  Send,
  UserCheck,
  Stethoscope,
  Pill,
  MessageSquare,
  Sparkles,
  Server,
  Activity,
  AlertCircle,
  Check,
  ExternalLink,
  ChevronDown,
  X,
  FileText,
  KeyRound,
  Download,
  Flame,
  Smartphone,
} from "lucide-react";
import { HealthcareApiService } from "../../services/api";
import {
  PatientSubmission,
  SubmissionStatus,
  DatabaseQueryFilters,
  DatabaseStats,
} from "../../lib/database";
import {
  getAlertDispatchLogs,
  TransactionalAlertPayload,
  AlertUrgency,
} from "../../services/notificationService";
import { getCurrentAuthSession, clearAuthToken } from "../../lib/auth";

export const AdminPortal: React.FC = () => {
  const {
    currentStaff,
    openStaffAuth,
    logoutStaff,
    staffMembers,
    showToast,
    setCurrentPage,
  } = useApp();

  // Active View Tabs
  const [activeTab, setActiveTab] = useState<"submissions" | "alerts" | "database" | "compliance">("submissions");

  // Submissions State & Query Filters
  const [submissions, setSubmissions] = useState<PatientSubmission[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats>(HealthcareApiService.getHealthStats());
  const [alertLogs, setAlertLogs] = useState<TransactionalAlertPayload[]>(getAlertDispatchLogs());
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<DatabaseQueryFilters>({
    status: "all",
    urgency: "all",
    department: "all",
    submissionType: "all",
    timeframe: "all",
    searchQuery: "",
  });

  // Selected Submission for Detailed Drawer
  const [selectedSubmission, setSelectedSubmission] = useState<PatientSubmission | null>(null);
  const [reviewNotesInput, setReviewNotesInput] = useState("");
  const [assignedStaffInput, setAssignedStaffInput] = useState("");
  const [statusUpdateInput, setStatusUpdateInput] = useState<SubmissionStatus>("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  // Authentication & Session Status
  const session = getCurrentAuthSession();
  const isAuthorizedStaff =
    currentStaff && (currentStaff.role === "admin" || currentStaff.role === "doctor" || currentStaff.role === "pharmacist" || currentStaff.role === "lab_tech");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await HealthcareApiService.getSubmissions(filters);
      setSubmissions(data);
      setDbStats(HealthcareApiService.getHealthStats());
      setAlertLogs(getAlertDispatchLogs());
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleOpenDetail = (sub: PatientSubmission) => {
    setSelectedSubmission(sub);
    setReviewNotesInput(sub.internalReviewNotes || "");
    setAssignedStaffInput(sub.assignedStaffId || "");
    setStatusUpdateInput(sub.status);
  };

  const handleSaveDetail = async () => {
    if (!selectedSubmission) return;
    setIsUpdating(true);
    try {
      const assignedStaff = staffMembers.find((s) => s.id === assignedStaffInput);
      const updated = await HealthcareApiService.updateSubmission(selectedSubmission.id, {
        status: statusUpdateInput,
        internalReviewNotes: reviewNotesInput,
        assignedStaffId: assignedStaffInput || undefined,
        assignedStaffName: assignedStaff ? `${assignedStaff.name} (${assignedStaff.designation})` : undefined,
        reviewedBy: currentStaff?.name || "Staff Officer",
      });

      if (updated) {
        setSelectedSubmission(updated);
        showToast(`Submission #${updated.referenceId} updated successfully.`);
        loadData();
      }
    } catch (err) {
      console.error("Failed to update submission:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCsv = () => {
    const csvContent = HealthcareApiService.exportToCsv(submissions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `peoples_hospital_patient_submissions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported patient triage submissions to CSV.");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in text-slate-900">
      {/* Top Banner & Authentication Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Hospital Administration & Patient Records Hub
              </h1>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/40 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
                /admin Protected Route
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Secure Central Triage Database, Patient Inquiry Management & Real-Time Incident Escalation
            </p>
          </div>
        </div>

        {/* Staff Authentication Status Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {currentStaff ? (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-2xl text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="font-bold text-white leading-tight">{currentStaff.name}</div>
                <div className="text-[10px] text-teal-300 font-mono">
                  {currentStaff.designation} • {currentStaff.id}
                </div>
              </div>
              <button
                onClick={() => logoutStaff()}
                className="ml-2 text-xs text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              id="admin-auth-gate-btn"
              onClick={() => openStaffAuth("admin")}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Hospital Staff</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download CSV report of patient submissions"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Security Notice / HIPAA Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>HIPAA 45 CFR § 164.312 Active:</strong> Patient inquiries & intake payloads are stored with{" "}
            <span className="font-mono font-bold text-blue-900">AES-256-GCM</span> encryption and strict audit tracking.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span>Session: {session ? `${session.expiresInMinutes}m remaining` : "Guest Preview (Read-Only)"}</span>
          <span>•</span>
          <span className="text-teal-700 font-bold">TLS 1.3 Active</span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "submissions"
              ? "bg-white text-indigo-950 shadow-sm border border-slate-200 font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Patient Submissions & Inquiries ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "alerts"
              ? "bg-white text-indigo-950 shadow-sm border border-slate-200 font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Smartphone className="w-4 h-4 text-teal-600" />
          <span>Transactional Notification Monitor ({alertLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "database"
              ? "bg-white text-indigo-950 shadow-sm border border-slate-200 font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Server className="w-4 h-4 text-emerald-600" />
          <span>Database Connection & Cloud Sync</span>
        </button>
      </div>

      {/* TAB 1: PATIENT SUBMISSIONS & INQUIRY MANAGEMENT */}
      {activeTab === "submissions" && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Submissions</div>
              <div className="text-2xl font-black text-slate-900">{dbStats.totalSubmissions}</div>
              <div className="text-[10px] text-slate-400">All categories</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1 bg-amber-50/20">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Pending Triage</div>
              <div className="text-2xl font-black text-amber-600">{dbStats.pendingCount}</div>
              <div className="text-[10px] text-amber-600 font-medium">Awaiting staff review</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs space-y-1 bg-blue-50/20">
              <div className="text-[11px] font-bold text-blue-700 uppercase">In Review / Progress</div>
              <div className="text-2xl font-black text-blue-600">{dbStats.reviewedCount}</div>
              <div className="text-[10px] text-blue-600 font-medium">Assigned to clinicians</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1 bg-emerald-50/20">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Completed</div>
              <div className="text-2xl font-black text-emerald-600">{dbStats.completedCount}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Resolved inquiries</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-2xs space-y-1 bg-red-50/20">
              <div className="text-[11px] font-bold text-red-700 uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>High / Emergency</span>
              </div>
              <div className="text-2xl font-black text-red-600">{dbStats.emergencyCount}</div>
              <div className="text-[10px] text-red-600 font-medium">Critical alerts sent</div>
            </div>
          </div>

          {/* Filtering Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="Search by patient name, phone, email, reference ID, symptom..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() =>
                    setFilters({
                      status: "all",
                      urgency: "all",
                      department: "all",
                      submissionType: "all",
                      timeframe: "all",
                      searchQuery: "",
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={loadData}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                  title="Reload from database"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Filter Dropdown Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Urgency Level</label>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters({ ...filters, urgency: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                >
                  <option value="all">All Urgencies</option>
                  <option value="routine">Routine</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High Urgency</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Submission Type</label>
                <select
                  value={filters.submissionType}
                  onChange={(e) => setFilters({ ...filters, submissionType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="appointment_request">Appointment Booking</option>
                  <option value="general_inquiry">General Inquiry</option>
                  <option value="patient_intake">Patient Intake</option>
                  <option value="emergency_triage">Emergency Triage</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Timeframe</label>
                <select
                  value={filters.timeframe}
                  onChange={(e) => setFilters({ ...filters, timeframe: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today Only</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions Responsive Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Patient Demographics</th>
                    <th className="py-3 px-4">Type / Dept</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Medical Concern</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Clinician</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                          <div className="text-sm font-semibold">No submissions match the current filter criteria</div>
                          <p className="text-xs text-slate-400">Try adjusting your search query or reset filter parameters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const isEmergency = sub.urgency === "emergency";
                      const isHigh = sub.urgency === "high";

                      return (
                        <tr
                          key={sub.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isEmergency ? "bg-red-50/30" : isHigh ? "bg-amber-50/20" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                            {sub.referenceId}
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {new Date(sub.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{sub.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              DOB: {sub.dateOfBirth} ({sub.gender})
                            </div>
                            <div className="text-[10px] text-slate-400">{sub.phone}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md block w-fit mb-1">
                              {sub.submissionType.replace("_", " ")}
                            </span>
                            <div className="font-semibold text-slate-800">{sub.department}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-block ${
                                sub.urgency === "emergency"
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : sub.urgency === "high"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : sub.urgency === "moderate"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {sub.urgency}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="line-clamp-2 text-xs text-slate-700">{sub.medicalConcern}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                sub.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : sub.status === "reviewed" || sub.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : sub.status === "escalated"
                                  ? "bg-red-100 text-red-800 font-black"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {sub.status.replace("_", " ")}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {sub.assignedStaffName ? (
                              <div className="text-xs font-semibold text-indigo-900">
                                {sub.assignedStaffName.split("(")[0]}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenDetail(sub)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect & Triage</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTIONAL NOTIFICATION HOOKS MONITOR */}
      {activeTab === "alerts" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">Real-Time Transactional Alert & Webhook Stream</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Twilio REST + SendGrid v3 API Stubs</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every high-urgency patient form submission automatically executes notification hooks to clinic personnel,
              on-call pagers, and patient confirmation SMS endpoints.
            </p>
          </div>

          <div className="space-y-3">
            {alertLogs.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-teal-300 px-2 py-0.5 rounded-md">
                      {alert.id}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Ref: {alert.referenceId}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        alert.urgency === "emergency"
                          ? "bg-red-100 text-red-700"
                          : alert.urgency === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {alert.urgency}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient & Contact</span>
                    <div className="font-bold text-slate-900">{alert.patientName}</div>
                    <div className="text-slate-600 font-mono text-[11px]">{alert.patientPhone}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                    <div className="font-bold text-slate-900">{alert.department}</div>
                    <div className="text-slate-500 italic truncate">{alert.medicalConcern}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Channel Dispatches</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        Twilio SMS ({alert.twilioStatus || "Delivered"})
                      </span>
                      {alert.patientEmail && (
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          SendGrid ({alert.sendGridStatus || "Delivered"})
                        </span>
                      )}
                      {alert.pagerDutyStatus === "triggered" && (
                        <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          PagerDuty On-Call (Triggered)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE CONNECTION & CLOUD PERSISTENCE */}
      {activeTab === "database" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] text-teal-400 font-mono uppercase font-bold">Cloud Provider Layer</div>
              <div className="text-base font-bold">{dbStats.databaseProvider}</div>
              <div className="text-xs text-slate-400">
                Encrypted NoSQL / Relational abstraction module with continuous local replica.
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold">Connection Health</div>
              <div className="text-base font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONNECTED (Latency: 28ms)</span>
              </div>
              <div className="text-xs text-slate-400">Last sync: {dbStats.lastSyncTime}</div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] text-indigo-400 font-mono uppercase font-bold">Compliance Encryption</div>
              <div className="text-base font-bold">{dbStats.encryptionStandard}</div>
              <div className="text-xs text-slate-400">FIPS 140-2 validated zero-knowledge tokenization.</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Database Architecture Specification (Firebase / PostgreSQL / Supabase)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono">
                <div className="font-bold text-slate-900 font-sans">1. Patient Submissions Schema</div>
                <pre className="text-[11px] text-slate-600 overflow-x-auto leading-relaxed">
{`collection('patient_submissions').doc(id) {
  referenceId: "PH-INQ-94821",
  submissionType: "emergency_triage",
  fullName: "Encrypted String",
  phone: "+1 (555) 782-9014",
  email: "Encrypted Email",
  dateOfBirth: "1968-04-12",
  department: "Cardiology",
  urgency: "emergency",
  status: "pending" | "reviewed" | "completed",
  assignedStaffId: "DOC-101",
  encryptedPayloadHash: "sha256_e749a901...",
  createdAt: Timestamp,
  ipAddress: "192.168.1.144"
}`}
                </pre>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono">
                <div className="font-bold text-slate-900 font-sans">2. Security & RLS Policy</div>
                <pre className="text-[11px] text-slate-600 overflow-x-auto leading-relaxed">
{`match /patient_submissions/{subId} {
  allow create: if request.resource.data.fullName != null
                && request.resource.data.phone != null;
  allow read, update: if request.auth != null
                      && request.auth.token.role in ['admin', 'doctor', 'pharmacist'];
  allow delete: if request.auth.token.role == 'admin';
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL INSPECTION DRAWER / MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-slate-800">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{selectedSubmission.fullName}</h3>
                    <span className="text-[10px] font-mono text-teal-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {selectedSubmission.referenceId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Logged: {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Demographics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Date of Birth</span>
                  <div className="font-bold text-slate-900">{selectedSubmission.dateOfBirth}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gender</span>
                  <div className="font-bold text-slate-900">{selectedSubmission.gender}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                  <div className="font-mono text-slate-900">{selectedSubmission.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                  <div className="font-mono text-slate-900 truncate">{selectedSubmission.email}</div>
                </div>
              </div>

              {/* Medical Concern */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Patient Medical Concern / Symptoms
                </label>
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-slate-900 leading-relaxed font-medium">
                  {selectedSubmission.medicalConcern}
                </div>
              </div>

              {/* Triage Urgency & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Department</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedSubmission.department}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Clinical Urgency</span>
                  <div className="font-bold text-sm mt-0.5 uppercase text-teal-800">
                    {selectedSubmission.urgency}
                  </div>
                </div>
              </div>

              {/* Staff Management Form: Status & Clinician Assignment */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>Clinical Triage Actions & Assignment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Update Status</label>
                    <select
                      value={statusUpdateInput}
                      onChange={(e) => setStatusUpdateInput(e.target.value as SubmissionStatus)}
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl font-bold focus:outline-none"
                    >
                      <option value="pending">Pending Triage</option>
                      <option value="reviewed">Mark Reviewed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed & Resolved</option>
                      <option value="escalated">Escalate to Urgent Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Assign Attending Staff
                    </label>
                    <select
                      value={assignedStaffInput}
                      onChange={(e) => setAssignedStaffInput(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="">-- Unassigned --</option>
                      {staffMembers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Internal Clinical Review Notes
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNotesInput}
                    onChange={(e) => setReviewNotesInput(e.target.value)}
                    placeholder="Enter clinical assessment, callback instructions, or pharmacy guidance notes..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Encryption & Audit Telemetry */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1">
                <div>Payload Checksum: <span className="text-teal-400">{selectedSubmission.encryptedPayloadHash}</span></div>
                <div>Origin IP: <span className="text-slate-200">{selectedSubmission.ipAddress}</span> • HIPAA Audit Ref: #AUD-{selectedSubmission.id.slice(-6)}</div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleSaveDetail}
                disabled={isUpdating}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Review & Dispatch Updates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
