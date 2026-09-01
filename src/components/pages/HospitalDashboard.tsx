import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Building2,
  Users,
  BedDouble,
  HeartPulse,
  Pill,
  Activity,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  GitBranch,
} from "lucide-react";
import { BackButton } from "../common/BackButton";

export const HospitalDashboard: React.FC = () => {
  const {
    hospitalStats,
    doctors,
    patients,
    prescriptions,
    labTests,
    setCurrentPage,
    currentStaff,
    openStaffAuth,
    showToast,
  } = useApp();

  const [beds, setBeds] = useState([
    { ward: "ICU Ward A", total: 12, occupied: 9, critical: 3, floor: "3rd Floor" },
    { ward: "Cardiology IPD", total: 40, occupied: 32, critical: 1, floor: "2nd Floor" },
    { ward: "General Surgery Ward", total: 60, occupied: 48, critical: 0, floor: "1st Floor" },
    { ward: "Pediatrics & Maternity", total: 35, occupied: 24, critical: 0, floor: "4th Floor" },
    { ward: "Emergency Observation", total: 20, occupied: 15, critical: 4, floor: "Ground Floor" },
  ]);

  const totalRevenueMock = "$184,520";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/40 flex items-center justify-center text-white text-2xl font-bold">
            <Building2 className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Hospital Command & Administration Dashboard
              </h1>
              <span className="text-xs bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                {currentStaff?.role === "admin" ? currentStaff.name : "Central Operations"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-0.5">
              Real-Time Department Coordination, Bed Occupancy & Resource Tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-switch-login-btn"
            onClick={() => openStaffAuth("admin")}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-indigo-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentStaff?.role === "admin" ? "Switch Admin" : "Admin Sign In"}</span>
          </button>

          <button
            onClick={() => setCurrentPage("department-flow")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Inter-Department Flow
          </button>
          <button
            onClick={() => setCurrentPage("analytics")}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Hospital Analytics
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Bed Occupancy Rate</span>
            <BedDouble className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {Math.round((hospitalStats.occupiedBeds / hospitalStats.totalBeds) * 100)}%
          </div>
          <div className="text-xs text-slate-600">
            {hospitalStats.occupiedBeds} occupied / {hospitalStats.totalBeds} total beds
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>OPD Traffic Today</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {hospitalStats.opdPatientsToday} Patients
          </div>
          <div className="text-xs text-emerald-600 font-medium">
            Avg Consultation: 14 mins
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Emergency Admitted</span>
            <HeartPulse className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {hospitalStats.emergencyCasesToday} Cases
          </div>
          <div className="text-xs text-red-600 font-medium">
            ICU Buffer: {hospitalStats.icuBedsAvailable} Available
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Today's Billing Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalRevenueMock}
          </div>
          <div className="text-xs text-teal-600 font-medium">
            Pharmacy + Diagnostics + OPD
          </div>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Ward & Bed Occupancy Management */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-indigo-600" />
                Departmental Bed & Ward Occupancy Tracker
              </h3>
              <button
                onClick={() => showToast("Ward capacity refresh synchronized with IoT telemetry.")}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Refresh Telemetry
              </button>
            </div>

            <div className="space-y-3">
              {beds.map((ward, idx) => {
                const percentage = Math.round((ward.occupied / ward.total) * 100);
                return (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{ward.ward}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({ward.floor})</span>
                      </div>
                      <div className="font-semibold text-slate-700">
                        {ward.occupied} / {ward.total} Beds ({percentage}%)
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage > 85
                            ? "bg-red-500"
                            : percentage > 60
                            ? "bg-amber-500"
                            : "bg-indigo-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Available: {ward.total - ward.occupied} beds</span>
                      {ward.critical > 0 && (
                        <span className="text-red-600 font-semibold">
                          ⚠️ {ward.critical} Critical Patients Monitored
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Doctor Roster & Staff on Duty */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Medical Staff & Doctors on Duty ({doctors.length})
              </h3>
            </div>

            <div className="space-y-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{doc.name}</div>
                      <div className="text-[11px] text-slate-500">{doc.department}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      doc.status === "available"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    ● {doc.status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Inter-Department Links */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 space-y-3 text-xs">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Administrative Governance
            </div>
            <p className="text-slate-600 text-[11px]">
              All activities, e-Prescriptions, dispensing records and lab requests are encrypted and audited per HIPAA & FHIR compliance guidelines.
            </p>
            <button
              onClick={() => setCurrentPage("security-privacy")}
              className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl transition shadow-xs"
            >
              View System Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
