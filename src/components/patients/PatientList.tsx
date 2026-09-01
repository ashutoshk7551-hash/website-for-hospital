import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Activity,
  HeartPulse,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  HardDrive,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AddNewPatientModal } from "./AddNewPatientModal";
import { BackButton } from "../common/BackButton";
import { Patient } from "../../types";

export const PatientList: React.FC = () => {
  const {
    patients,
    currentPatientId,
    setCurrentPatientId,
    setCurrentPage,
    showToast,
    openPatientAuth,
  } = useApp();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter patients based on query
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      patient.name.toLowerCase().includes(query) ||
      patient.id.toLowerCase().includes(query) ||
      patient.phone.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      (patient.medicalHistory || []).some((h) => h.toLowerCase().includes(query)) ||
      (patient.chronicConditions || []).some((c) => c.toLowerCase().includes(query)) ||
      (patient.allergies || []).some((a) => a.toLowerCase().includes(query));

    const matchGender =
      selectedGender === "all" ||
      patient.gender.toLowerCase() === selectedGender.toLowerCase();

    const matchBlood =
      selectedBloodGroup === "all" ||
      patient.bloodGroup.toLowerCase() === selectedBloodGroup.toLowerCase();

    return matchQuery && matchGender && matchBlood;
  });

  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatientId(patient.id);
    navigate(`/records/${patient.id}`);
  };

  const handleOpenPatientPortal = (patient: Patient) => {
    setCurrentPatientId(patient.id);
    navigate(`/patient/${patient.id}`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast("🟢 Real-time Firestore onSnapshot listener active! Synced with cloud.");
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in text-slate-900">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Cloud Firestore Real-Time Sync Active
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Patient Registry & Longitudinal Directory
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5 max-w-2xl">
            Live multi-device synchronized database. Any patient added on one phone or computer updates instantly across all healthcare team screens without manual refresh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-teal-300" : ""}`} />
            <span>Sync Status</span>
          </button>

          <button
            id="add-patient-firestore-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Patient (Cloud)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, ID, phone, email, medical history, chronic condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Gender & Blood Group Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-Binary">Non-Binary</option>
            </select>

            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Blood Groups</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === "cards" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === "table" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Live Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredPatients.length}</strong> of{" "}
            <strong className="text-slate-800">{patients.length}</strong> patients in Cloud Firestore
          </div>
          <div className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Real-time listener on collection "patients"
          </div>
        </div>
      </div>

      {/* Patient List Content */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Patient Records Match Criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a new patient to the cloud database or clear filters to view all patients.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            + Add New Patient
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => {
            const isCurrent = patient.id === currentPatientId;
            return (
              <div
                key={patient.id}
                className={`bg-white rounded-2xl p-5 border transition duration-200 hover:shadow-md flex flex-col justify-between space-y-4 ${
                  isCurrent ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {patient.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                          {patient.name}
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono">
                          ID: {patient.id.length > 14 ? `${patient.id.substring(0, 10)}...` : patient.id}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                          <span>{patient.age} Yrs</span>
                          <span>•</span>
                          <span>{patient.gender}</span>
                          <span>•</span>
                          <span className="font-bold text-teal-700">{patient.bloodGroup}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{patient.phone || "No phone listed"}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{patient.email || "No email listed"}</span>
                    </div>
                  </div>

                  {/* Medical History Tags */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-700">Medical History:</div>
                    <div className="flex flex-wrap gap-1">
                      {(patient.medicalHistory && patient.medicalHistory.length > 0
                        ? patient.medicalHistory
                        : ["No major conditions recorded"]
                      ).slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          {item}
                        </span>
                      ))}
                      {(patient.medicalHistory || []).length > 3 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                          +{(patient.medicalHistory || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Allergies / Vitals Pill */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      <span>
                        {(patient.allergies && patient.allergies[0]) || "No allergies documented"}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-700">
                      BP: {patient.recentVitals?.bloodPressure || "120/80"}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPatient(patient)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>View EHR</span>
                  </button>
                  <button
                    onClick={() => handleOpenPatientPortal(patient)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Patient Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Age/Gender</th>
                  <th className="p-3.5">Blood</th>
                  <th className="p-3.5">Medical History</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{patient.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{patient.id}</div>
                    </td>
                    <td className="p-3.5 space-y-0.5">
                      <div className="font-medium">{patient.phone}</div>
                      <div className="text-slate-400 text-[11px]">{patient.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold">{patient.age} yrs</span> • {patient.gender}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-800 font-bold rounded border border-teal-200">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="truncate text-slate-600">
                        {(patient.medicalHistory || []).join(", ") || "None recorded"}
                      </div>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectPatient(patient)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition cursor-pointer"
                      >
                        EHR Record
                      </button>
                      <button
                        onClick={() => handleOpenPatientPortal(patient)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition cursor-pointer"
                      >
                        Portal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Patient Modal */}
      <AddNewPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(id) => {
          showToast("Patient record successfully created in Firestore!");
        }}
      />
    </div>
  );
};
