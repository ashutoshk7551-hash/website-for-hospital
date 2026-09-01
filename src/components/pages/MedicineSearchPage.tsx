import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Pill,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
} from "lucide-react";
import { MedicineItem } from "../../types";
import { BackButton } from "../common/BackButton";

export const MedicineSearchPage: React.FC = () => {
  const { medicines, setAiModalOpen, setAiModalInitialType, setCurrentPage } = useApp();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMed, setSelectedMed] = useState<MedicineItem | null>(null);

  // Sync route param with selected medicine modal
  useEffect(() => {
    if (id) {
      const match = medicines.find(
        (m) => m.id.toLowerCase() === id.toLowerCase() || m.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
      );
      if (match) {
        setSelectedMed(match);
      }
    } else {
      setSelectedMed(null);
    }
  }, [id, medicines]);

  const handleOpenDetail = (med: MedicineItem) => {
    setSelectedMed(med);
    navigate(`/medicines/${med.id}`);
  };

  const handleCloseDetail = () => {
    setSelectedMed(null);
    navigate("/medicines");
  };

  const categories = ["all", ...Array.from(new Set(medicines.map((m) => m.category)))];

  const filtered = medicines.filter((m) => {
    const matchesQuery =
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.genericName.toLowerCase().includes(query.toLowerCase()) ||
      m.indications.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <Search className="w-3.5 h-3.5" />
            Hospital Formulary Directory
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Medicine & Drug Information Catalog
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-0.5">
            Search clinical formulations, indications, contraindications, and availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setAiModalInitialType("medicine_info");
              setAiModalOpen(true);
            }}
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Pharmacology Explorer
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by drug, generic name, or indication (e.g. Hypertension)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Drug Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((med) => (
          <div
            key={med.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{med.name}</h3>
                  <p className="text-xs text-teal-700 font-medium">Generic: {med.genericName}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    med.prescriptionRequired
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {med.prescriptionRequired ? "Rx Required" : "OTC Available"}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Formulation:</span> {med.dosageForm} ({med.strength})
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Therapeutic Class:</span> {med.category}
                </div>
              </div>

              {/* Indications Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {((Array.isArray(med.indications)
                  ? med.indications
                  : typeof med.indications === "string"
                  ? med.indications.split(", ")
                  : []) as string[]
                ).slice(0, 3).map((ind, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenDetail(med)}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" /> Clinical Details
              </button>

              <button
                onClick={() => setCurrentPage("doctor-pharmacist-connect")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                Consult Pharmacist
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Drug Information Modal */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedMed.name}</h3>
                  <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                    {selectedMed.dosageForm}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Generic Name: {selectedMed.genericName} • Strength: {selectedMed.strength}</p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">Approved Clinical Indications:</span>
                <p className="text-slate-600">{Array.isArray(selectedMed.indications) ? selectedMed.indications.join(", ") : selectedMed.indications}</p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-1">
                <span className="font-bold text-red-900 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Clinical Contraindications:
                </span>
                <p className="text-red-800">{Array.isArray(selectedMed.contraindications) ? selectedMed.contraindications.join(", ") : selectedMed.contraindications || "None documented for standard adult population."}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900">Documented Common Side Effects:</span>
                <p className="text-amber-800">{Array.isArray(selectedMed.sideEffects) ? selectedMed.sideEffects.join(", ") : selectedMed.sideEffects}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Active Batch</span>
                  <span className="font-mono font-bold text-slate-800">{selectedMed.batchNumber}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Stock Available</span>
                  <span className="font-bold text-emerald-700">{selectedMed.stockQuantity} Units</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  handleCloseDetail();
                  setAiModalInitialType("interaction");
                  setAiModalOpen(true);
                }}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Screen Drug Interactions
              </button>

              <button
                onClick={handleCloseDetail}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
