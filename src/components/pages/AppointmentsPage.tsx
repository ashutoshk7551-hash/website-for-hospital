import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const AppointmentsPage: React.FC = () => {
  const { doctors, patients, bookAppointment, showToast, setCurrentPage } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("10:30 AM");
  const [consultType, setConsultType] = useState<"in_person" | "teleconsultation">("in_person");
  const [symptoms, setSymptoms] = useState<string>("");
  const [confirmedPass, setConfirmedPass] = useState<any | null>(null);

  const departments = ["All", "Cardiology", "Endocrinology", "Pediatrics", "Internal Medicine", "Orthopedics"];

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDept === "All") return true;
    return doc.department === selectedDept;
  });

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:15 AM",
    "02:00 PM",
    "02:45 PM",
    "03:30 PM",
    "04:15 PM",
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const token = Math.floor(100 + Math.random() * 900);

    const newApt = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      date,
      time,
      status: "scheduled" as const,
      type: consultType,
      symptoms: symptoms || "Routine Clinical Consultation",
      roomNumber: `Room ${Math.floor(200 + Math.random() * 80)}`,
      tokenNumber: token,
    };

    bookAppointment(newApt);
    setConfirmedPass(newApt);
    showToast(`Appointment booked with ${selectedDoctor.name} on ${date}! Token #${token}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Smart Hospital OPD Scheduling
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Book Doctor Consultation & Token Pass
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
            Instant digital confirmation with synchronized electronic medical records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/10 px-4 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-time Doctor Availability</span>
        </div>
      </div>

      {confirmedPass ? (
        /* Confirmation Pass Card */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-emerald-300 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Appointment Confirmed!</h2>
            <p className="text-xs text-slate-500">Your digital token has been registered in the Hospital OPD Queue.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Queue Token #</div>
                <div className="text-3xl font-black text-blue-600">#{confirmedPass.tokenNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase">
                  {confirmedPass.type.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Doctor:</span>
                <div className="font-bold text-slate-900">{confirmedPass.doctorName}</div>
                <div className="text-slate-500">{confirmedPass.department}</div>
              </div>
              <div>
                <span className="text-slate-400">Patient:</span>
                <div className="font-bold text-slate-900">{confirmedPass.patientName}</div>
              </div>
              <div>
                <span className="text-slate-400">Date & Time:</span>
                <div className="font-bold text-slate-900">{confirmedPass.date} at {confirmedPass.time}</div>
              </div>
              <div>
                <span className="text-slate-400">Location:</span>
                <div className="font-bold text-slate-900">{confirmedPass.roomNumber} (Main OPD)</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setConfirmedPass(null)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => setCurrentPage("patient-portal")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
            >
              Go to Patient Portal
            </button>
          </div>
        </div>
      ) : (
        /* Booking Workflow Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Department & Doctor Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Department Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Department
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedDept === dept
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Choose Physician ({filteredDoctors.length} Available)
              </label>
              <div className="space-y-3">
                {filteredDoctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {doc.specialty}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {doc.qualification} • {doc.experienceYears} Years Exp
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Consultation Fee: {doc.consultationFee}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-blue-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Date, Time & Confirmation Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleBooking} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                3. Consultation Details
              </h3>

              {/* Patient Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Patient Profile</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id} - Age {p.age})
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Consultation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType("in_person")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      consultType === "in_person"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Hospital In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultType("teleconsultation")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      consultType === "teleconsultation"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Teleconsultation
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Time Slot</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Chief Symptoms / Reason for Visit</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild chest tightness on exertion, routine blood pressure review"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition"
              >
                Confirm & Generate OPD Token
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
