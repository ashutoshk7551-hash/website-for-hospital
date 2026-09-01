import React from "react";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  Activity,
  Pill,
  Users,
  Calendar,
  DollarSign,
  HeartPulse,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { BackButton } from "../common/BackButton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const AnalyticsPage: React.FC = () => {
  const { hospitalStats, medicines, prescriptions, setAiModalOpen, setAiModalInitialType } = useApp();

  // Weekly OPD traffic data
  const opdWeeklyData = [
    { day: "Mon", patients: 124, emergency: 18, rxDispensed: 142 },
    { day: "Tue", patients: 145, emergency: 22, rxDispensed: 168 },
    { day: "Wed", patients: 138, emergency: 15, rxDispensed: 155 },
    { day: "Thu", patients: 160, emergency: 24, rxDispensed: 189 },
    { day: "Fri", patients: 152, emergency: 21, rxDispensed: 174 },
    { day: "Sat", patients: 98, emergency: 29, rxDispensed: 110 },
    { day: "Sun", patients: 76, emergency: 31, rxDispensed: 88 },
  ];

  // Drug Category Distribution
  const drugCategoryData = [
    { name: "Cardiovascular", value: 38, color: "#0284c7" },
    { name: "Antibiotics", value: 24, color: "#0d9488" },
    { name: "Endocrine", value: 18, color: "#8b5cf6" },
    { name: "Gastrointestinal", value: 12, color: "#f59e0b" },
    { name: "Analgesics", value: 8, color: "#ef4444" },
  ];

  // Bed Allocation Data
  const bedAllocationData = [
    { name: "Occupied IPD", value: hospitalStats.occupiedBeds, color: "#3b82f6" },
    { name: "Available IPD", value: hospitalStats.totalBeds - hospitalStats.occupiedBeds, color: "#10b981" },
    { name: "ICU Available", value: hospitalStats.icuBedsAvailable, color: "#8b5cf6" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Healthcare Informatics Analytics
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hospital & Pharmacy Operational Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
            Real-time telemetry across patient flows, medication utilization, and diagnostic throughput.
          </p>
        </div>

        <button
          onClick={() => {
            setAiModalInitialType("stock_forecast");
            setAiModalOpen(true);
          }}
          className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AI Predictive Forecasting
        </button>
      </div>

      {/* High-Level Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Consultations (7d)</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">893</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">↑ 12% vs previous week</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">e-Rx Verification Rate</div>
          <div className="text-2xl font-extrabold text-teal-600 mt-2">99.4%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Avg 3.8 mins verification time</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Lab Report Turnaround</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-2">42 mins</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Faster by 68% vs paper flow</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Adverse Drug Alerts Prevented</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">14</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Flagged by AI interaction engine</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly OPD & Dispensing Volume (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Weekly OPD Attendance vs e-Prescriptions Dispensed
              </h3>
              <p className="text-xs text-slate-500">Correlation between clinical appointments and pharmacy throughput</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opdWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="patients" name="OPD Patients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rxDispensed" name="Rx Dispensed" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="emergency" name="Emergency Triage" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Therapeutic Category Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Dispensing by Therapeutic Class
          </h3>
          <p className="text-xs text-slate-500">Volume share of dispensed hospital formulary</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={drugCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {drugCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {drugCategoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
