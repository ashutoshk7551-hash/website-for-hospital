import React, { useState } from "react";
import {
  X,
  UserPlus,
  HeartPulse,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Activity,
  CheckCircle2,
  Calendar,
  Layers,
  Save,
  Loader2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { db, collection, addDoc, serverTimestamp } from "../../lib/firebase";

interface AddNewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPatientId: string) => void;
}

export const AddNewPatientModal: React.FC<AddNewPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast, setCurrentPatientId } = useApp();

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">(38);
  const [gender, setGender] = useState("Female");
  const [phone, setPhone] = useState("+1 (555) 789-0123");
  const [email, setEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  
  // Medical History & Clinical Profile
  const [medicalHistoryText, setMedicalHistoryText] = useState("Stage 1 Essential Hypertension, Seasonal Asthma");
  const [allergiesText, setAllergiesText] = useState("Penicillin, Sulfa Drugs");
  const [chronicConditionsText, setChronicConditionsText] = useState("Hypertension, Mild Asthma");
  
  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState("Robert Smith");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (555) 321-9876");

  // Vitals
  const [bloodPressure, setBloodPressure] = useState("122/82 mmHg");
  const [heartRate, setHeartRate] = useState<number>(74);
  const [bloodSugar, setBloodSugar] = useState<number>(98);
  const [weight, setWeight] = useState<number>(68);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter the patient's full legal name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please enter a valid primary phone number.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid patient email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Split medical history, allergies, chronic conditions by comma
      const medicalHistory = medicalHistoryText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const allergies = allergiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const chronicConditions = chronicConditionsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const patientData = {
        name: name.trim(),
        age: typeof age === "number" ? age : parseInt(String(age), 10) || 30,
        gender: gender || "Other",
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        bloodGroup: bloodGroup || "O+",
        medicalHistory: medicalHistory.length > 0 ? medicalHistory : ["No major prior medical history documented"],
        allergies: allergies.length > 0 ? allergies : ["None reported"],
        chronicConditions: chronicConditions.length > 0 ? chronicConditions : ["None reported"],
        emergencyContact: {
          name: emergencyName.trim() || "Emergency Contact",
          relationship: emergencyRelation.trim() || "Family",
          phone: emergencyPhone.trim() || phone.trim(),
        },
        recentVitals: {
          bloodPressure: bloodPressure || "120/80 mmHg",
          heartRate: Number(heartRate) || 72,
          bloodSugar: Number(bloodSugar) || 96,
          temperature: 98.6,
          weight: Number(weight) || 65,
          lastUpdated: new Date().toLocaleDateString(),
        },
        // CRITICAL REQUIREMENT: serverTimestamp() on Firestore document creation
        createdAt: serverTimestamp(),
      };

      // Call addDoc(collection(db, "patients"), patientData) directly to Firestore
      const docRef = await addDoc(collection(db, "patients"), patientData);

      showToast(`✅ Patient "${name}" added to Cloud Firestore! Synced to all devices.`);
      setCurrentPatientId(docRef.id);

      if (onSuccess) {
        onSuccess(docRef.id);
      }

      onClose();
    } catch (err: any) {
      console.error("Firestore addDoc error:", err);
      setErrorMsg(err.message || "Failed to save patient to Cloud Firestore.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Add New Patient to Cloud Firestore
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-semibold">
                  🟢 Live Multi-Device Sync
                </span>
              </h2>
              <p className="text-xs text-blue-200/90">
                Directly writes to global Firestore <code className="text-teal-200 font-mono">patients</code> collection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core Personal Details */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Demographics & Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clara Oswald"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. clara.oswald@hospital.care"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 789-0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History & Clinical Profile */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>2. Clinical History & Allergies</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical History (comma-separated conditions / past diagnoses)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Stage 1 Essential Hypertension, Bronchial Asthma, Appendectomy 2021"
                value={medicalHistoryText}
                onChange={(e) => setMedicalHistoryText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documented Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Chronic Conditions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes Type 2"
                  value={chronicConditionsText}
                  onChange={(e) => setChronicConditionsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Emergency Contact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Smith"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Parent / Sibling"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 321-9876"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>4. Baseline Vitals</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Add Patient to Cloud Firestore</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
