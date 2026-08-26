import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Pill,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  FileCheck2,
} from "lucide-react";
import { MedicineItem } from "../../types";

export const PharmacyManagement: React.FC = () => {
  const {
    medicines,
    restockMedicine,
    setAiModalOpen,
    setAiModalInitialType,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [restockAmount, setRestockAmount] = useState<{ [id: string]: number }>({});

  const availableCount = medicines.filter((m) => m.status === "in_stock").length;
  const lowStockCount = medicines.filter((m) => m.status === "low_stock").length;
  const expiringCount = medicines.filter((m) => m.status === "expiring_soon").length;
  const outOfStockCount = medicines.filter((m) => m.status === "out_of_stock").length;

  const categories = Array.from(new Set(medicines.map((m) => m.category)));

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedFilter === "all" ||
      (selectedFilter === "available" && med.status === "in_stock") ||
      (selectedFilter === "low_stock" && med.status === "low_stock") ||
      (selectedFilter === "expiring_soon" && med.status === "expiring_soon") ||
      (selectedFilter === "out_of_stock" && med.status === "out_of_stock");

    const matchesCategory =
      selectedCategory === "all" || med.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleRestock = (id: string) => {
    const qty = restockAmount[id] || 50;
    restockMedicine(id, qty);
    setRestockAmount((prev) => ({ ...prev, [id]: 50 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 backdrop-blur-md border border-teal-400/40 flex items-center justify-center text-white text-2xl font-bold">
            <Pill className="w-8 h-8 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Smart Pharmacy Management & Formulary
              </h1>
              <span className="text-xs bg-teal-400/20 text-teal-300 border border-teal-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                Central Inventory
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-0.5">
              Live Stock Monitoring, Automated Batch Tracking & Expiry Prevention
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setAiModalInitialType("stock_forecast");
              setAiModalOpen(true);
            }}
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Demand & Stock Forecast
          </button>
        </div>
      </div>

      {/* VISUAL INVENTORY DASHBOARD (Requested: Available | Low Stock | Expiring Soon | Out of Stock) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === "available" ? "all" : "available")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            selectedFilter === "available"
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500"
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="text-emerald-700">Available Medicines</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {availableCount} <span className="text-xs font-normal text-slate-500">SKUs</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Healthy Buffer Stock
          </div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === "low_stock" ? "all" : "low_stock")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            selectedFilter === "low_stock"
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-500"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="text-amber-700">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-900 mt-2">
            {lowStockCount} <span className="text-xs font-normal text-slate-500">SKUs</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Below Safety Threshold
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === "expiring_soon" ? "all" : "expiring_soon")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            selectedFilter === "expiring_soon"
              ? "bg-purple-50 border-purple-400 ring-2 ring-purple-500"
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="text-purple-700">Expiring Soon (≤ 90d)</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-900 mt-2">
            {expiringCount} <span className="text-xs font-normal text-slate-500">Batches</span>
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            FIFO Priority Dispensing
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === "out_of_stock" ? "all" : "out_of_stock")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            selectedFilter === "out_of_stock"
              ? "bg-red-50 border-red-400 ring-2 ring-red-500"
              : "bg-white border-slate-200 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="text-red-700">Out of Stock</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-red-900 mt-2">
            {outOfStockCount} <span className="text-xs font-normal text-slate-500">SKUs</span>
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            PO Required Immediately
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by drug name, generic name, or batch #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Therapeutic Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("all");
              setSelectedCategory("all");
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-xl transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Medicine Name & Formulation</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Batch / Expiry</th>
                <th className="px-4 py-3.5">Stock Level</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Generic: {med.genericName} • {med.dosageForm} ({med.strength})
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">
                    {med.category}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-mono text-slate-800 font-semibold">{med.batchNumber}</div>
                    <div className="text-[11px] text-slate-500">Exp: {med.expiryDate}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">
                      {med.stockQuantity} <span className="text-slate-400 font-normal">units</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Min Threshold: {med.minThreshold}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        med.status === "in_stock"
                          ? "bg-emerald-100 text-emerald-800"
                          : med.status === "low_stock"
                          ? "bg-amber-100 text-amber-800"
                          : med.status === "expiring_soon"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {med.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <input
                        type="number"
                        min={10}
                        step={10}
                        defaultValue={50}
                        onChange={(e) =>
                          setRestockAmount((prev) => ({
                            ...prev,
                            [med.id]: parseInt(e.target.value) || 50,
                          }))
                        }
                        className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center"
                      />
                      <button
                        onClick={() => handleRestock(med.id)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        + Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
