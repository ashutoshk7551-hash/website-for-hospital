import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  Stethoscope,
  Pill,
  TestTube2,
  HeartPulse,
  ShieldCheck,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { BackButton } from "../common/BackButton";

export const ContactPage: React.FC = () => {
  const { showToast, triggerEmergencyAlert, setCurrentPage, openInquiryModal } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "General OPD",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields.");
      return;
    }

    setSubmitted(true);
    showToast(`Inquiry from ${formData.name} sent to ${formData.department}! Reference: INQ-${Date.now().toString().slice(-4)}`);
  };

  const departments = [
    {
      name: "Emergency & Trauma (24/7)",
      phone: "+1 (555) 911-PEOPLE",
      email: "emergency@peopleshospital.org",
      hours: "24 Hours / 7 Days",
      icon: HeartPulse,
      color: "text-red-600 bg-red-50",
    },
    {
      name: "Outpatient Department (OPD)",
      phone: "+1 (555) 234-8900",
      email: "opd@peopleshospital.org",
      hours: "Mon - Sat: 8:00 AM - 8:00 PM",
      icon: Stethoscope,
      color: "text-blue-600 bg-blue-50",
    },
    {
      name: "Smart Central Pharmacy",
      phone: "+1 (555) 234-8902",
      email: "pharmacy@peopleshospital.org",
      hours: "24 Hours / 7 Days",
      icon: Pill,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      name: "Diagnostics & Pathology Lab",
      phone: "+1 (555) 234-8903",
      email: "lab@peopleshospital.org",
      hours: "Mon - Sun: 7:00 AM - 10:00 PM",
      icon: TestTube2,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Previous Screen" fallbackPage="home" showHomeButton={true} />
      </div>

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <PhoneCall className="w-4 h-4 text-teal-400" />
            <span>Hospital Communications & Patient Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact <span className="text-teal-400">People's Hospital</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Our medical helpdesk, clinical triage team, and patient navigators are ready to assist you. For urgent medical emergencies, please trigger the 24/7 SOS alert immediately.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={triggerEmergencyAlert}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Emergency 24/7 Hotline</span>
            </button>
            <button
              onClick={() => setCurrentPage("appointments")}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Book OPD Appointment</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Form & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Send an Inquiry or Feedback</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your inquiry to our administrative or clinical desk. We will respond within 2 to 4 business hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-emerald-900">Inquiry Dispatched Successfully!</h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your message has been logged with the <strong>{formData.department}</strong> coordinator.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    department: "General OPD",
                    subject: "",
                    message: "",
                  });
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Johnathan Smith"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. john@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General OPD">General OPD & Consultations</option>
                    <option value="Cardiology">Cardiology Department</option>
                    <option value="Pharmacy">Pharmacy & Medication Refills</option>
                    <option value="Laboratory">Laboratory & Diagnostic Reports</option>
                    <option value="Billing & Insurance">Billing, Insurance & TPA</option>
                    <option value="Hospital Administration">Hospital Administration</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Inquiring about specialized cardiac consultation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Message / Clinical Detail *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry, medical questions, or feedback in detail..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Clinical / Administrative Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Hospital Directory & Location */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Hospital Location Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Campus Headquarters</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">People's Hospital Medical Center</div>
                  <div>450 Health Sciences Parkway, Suite 100</div>
                  <div>Metropolis, NY 10001, United States</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Operating Hours</div>
                  <div>Emergency & Pharmacy: 24/7 All Days</div>
                  <div>OPD Clinics: Mon - Sat (8:00 AM - 8:00 PM)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Direct Inquiries</div>
                  <div>helpdesk@peopleshospital.org</div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Hotlines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Department Hotlines</h3>
            <div className="space-y-3">
              {departments.map((d, idx) => {
                const Icon = d.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${d.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{d.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{d.phone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-600 font-bold shrink-0">
                      {d.hours.includes("24") ? "24/7" : "OPD"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
