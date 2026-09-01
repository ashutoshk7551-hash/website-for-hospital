import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  TestTube2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Sparkles,
  ArrowRight,
  FlaskConical,
} from "lucide-react";
import { LabTest } from "../../types";
import { BackButton } from "../common/BackButton";

export const LaboratoryManagement: React.FC = () => {
  const { labTests, updateLabTestStatus, showToast } = useApp();

  const [selectedTestId, setSelectedTestId] = useState<string>(labTests[0]?.id || "");
  const selectedTest = labTests.find((t) => t.id === selectedTestId) || labTests[0];

  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [paramInput, setParamInput] = useState("");
  const [valInput, setValInput] = useState("");
  const [unitInput, setUnitInput] = useState("mg/dL");
  const [rangeInput, setRangeInput] = useState("70 - 99");
  const [isAbnormalInput, setIsAbnormalInput] = useState(false);

  const filteredTests = labTests.filter((test) => {
    const matchesDept = filterDepartment === "all" || test.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || test.status === filterStatus;
    return matchesDept && matchesStatus;
  });

  const handleAdvanceStatus = (test: LabTest) => {
    let nextStatus: "ordered" | "sample_collected" | "processing" | "completed" = "processing";
    if (test.status === "ordered") nextStatus = "sample_collected";
    else if (test.status === "sample_collected") nextStatus = "processing";
    else if (test.status === "processing") nextStatus = "completed";

    updateLabTestStatus(test.id, nextStatus);
  };

  const handleAddResultParameter = () => {
    if (!paramInput || !valInput || !selectedTest) return;

    const newResult = {
      parameter: paramInput,
      value: valInput,
      unit: unitInput,
      referenceRange: rangeInput,
      isAbnormal: isAbnormalInput,
    };

    const updatedResults = [...selectedTest.results, newResult];
    updateLabTestStatus(selectedTest.id, selectedTest.status, updatedResults);

    setParamInput("");
    setValInput("");
    setIsAbnormalInput(false);
    showToast(`Biomarker ${paramInput} recorded on sample #${selectedTest.testCode}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 backdrop-blur-md border border-purple-400/40 flex items-center justify-center text-white text-2xl font-bold">
            <TestTube2 className="w-8 h-8 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Laboratory Diagnostics & Pathology Hub
              </h1>
              <span className="text-xs bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                Lab Informatics
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-0.5">
              Specimen Tracking, Biomarker Analysis & Instant Digital EHR Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white/10 px-4 py-2 rounded-xl">
          <FlaskConical className="w-4 h-4 text-purple-300" />
          <span>Automated EHR Transmit: <strong>Active (HL7 Compliant)</strong></span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (5 cols): Test Orders Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Specimen & Lab Orders ({filteredTests.length})
              </h3>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="ordered">Ordered</option>
                <option value="sample_collected">Collected</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {filteredTests.map((test) => {
                const isSelected = test.id === selectedTest?.id;
                return (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTestId(test.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-300 ring-1 ring-purple-400"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{test.testName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          test.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : test.status === "processing"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {test.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Patient: <strong className="text-slate-900">{test.patientName}</strong> • Ordered by {test.doctorName || test.prescribedByDoctor}
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Code: {test.testCode} ({test.department})</span>
                      <span>{test.orderedDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col (7 cols): Specimen Details & Results Input */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTest ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Order Metadata */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{selectedTest.testName}</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                      #{selectedTest.testCode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Department: <strong>{selectedTest.department}</strong> • Ordered by <strong>{selectedTest.doctorName || selectedTest.prescribedByDoctor}</strong> for <strong>{selectedTest.patientName}</strong>
                  </div>
                </div>

                {/* Next Step Progression Action */}
                <button
                  onClick={() => handleAdvanceStatus(selectedTest)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  {selectedTest.status === "ordered" && "Mark Sample Collected →"}
                  {selectedTest.status === "sample_collected" && "Start Lab Processing →"}
                  {selectedTest.status === "processing" && "Sign Off & Complete Test ✓"}
                  {selectedTest.status === "completed" && "Re-verify Findings"}
                </button>
              </div>

              {/* Sample Tracking Workflow Steps */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Specimen Lifecycle Status
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  {[
                    { id: "ordered", label: "1. Ordered" },
                    { id: "sample_collected", label: "2. Sample Collected" },
                    { id: "processing", label: "3. Lab Processing" },
                    { id: "completed", label: "4. Report Verified" },
                  ].map((step, i) => {
                    const isDone =
                      (step.id === "ordered" && ["ordered", "sample_collected", "processing", "completed"].includes(selectedTest.status)) ||
                      (step.id === "sample_collected" && ["sample_collected", "processing", "completed"].includes(selectedTest.status)) ||
                      (step.id === "processing" && ["processing", "completed"].includes(selectedTest.status)) ||
                      (step.id === "completed" && selectedTest.status === "completed");

                    return (
                      <div
                        key={i}
                        className={`p-2 rounded-xl border font-semibold ${
                          isDone
                            ? "bg-purple-100/70 border-purple-300 text-purple-900"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {step.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Findings Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Validated Biomarkers & Quantitative Values
                </h4>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {selectedTest.results.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No parameters recorded yet. Enter values below to populate the patient diagnostic record.
                    </div>
                  ) : (
                    selectedTest.results.map((res, i) => (
                      <div key={i} className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{res.parameter}</div>
                          <div className="text-[10px] text-slate-400">Normal Range: {res.referenceRange} {res.unit}</div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm ${
                              res.isAbnormal
                                ? "text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200"
                                : "text-emerald-700 font-semibold"
                            }`}
                          >
                            {res.value} {res.unit} {res.isAbnormal && "⚠️ High"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Biomarker Parameter Form */}
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-purple-950">Add Diagnostic Biomarker Finding:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Parameter (e.g. HbA1c)"
                    value={paramInput}
                    onChange={(e) => setParamInput(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Observed Value (e.g. 7.2)"
                    value={valInput}
                    onChange={(e) => setValInput(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. %)"
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Ref Range (e.g. < 5.7)"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-300"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAbnormalInput}
                      onChange={(e) => setIsAbnormalInput(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span>Flag as Clinically Abnormal / Critical Value</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddResultParameter}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    + Append Parameter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an order from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
