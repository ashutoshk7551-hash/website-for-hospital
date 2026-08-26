import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  HeartPulse,
  PhoneCall,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Ambulance,
  Activity,
  User,
} from "lucide-react";

export const EmergencyPage: React.FC = () => {
  const { patients, triggerEmergencyAlert, hospitalStats, showToast } = useApp();
  const currentPatient = patients[0];

  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [eta, setEta] = useState(6);

  const handleDispatchAmbulance = () => {
    setAmbulanceDispatched(true);
    triggerEmergencyAlert();
    showToast("Ambulance Unit #4 dispatched to your current geolocation!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-red-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/30 backdrop-blur-md rounded-full text-xs font-semibold text-red-200 mb-2 border border-red-400/40">
            <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
            24/7 Rapid Emergency Response Network
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Emergency Care & Medical Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-red-100/90 mt-0.5">
            Instant SOS alert, real-time ambulance tracking, and emergency allergy broadcast.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-red-950/80 border border-red-700/60 px-4 py-3 rounded-2xl">
          <PhoneCall className="w-6 h-6 text-red-400 animate-bounce" />
          <div>
            <div className="text-[10px] uppercase font-bold text-red-300">National Emergency Hotline</div>
            <div className="text-lg font-black text-white">911 / 1-800-PEOPLES-HOSP</div>
          </div>
        </div>
      </div>

      {/* SOS Giant Trigger Button */}
      <div className="bg-white rounded-3xl p-8 border-2 border-red-200 shadow-xl text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Immediate Medical Assistance Required?</h2>
          <p className="text-xs text-slate-500">
            Pressing the button below instantly notifies the Hospital Trauma Team, transmits your live GPS coordinates, and alerts your emergency contact.
          </p>
        </div>

        <button
          onClick={handleDispatchAmbulance}
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:to-rose-700 text-white font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl shadow-red-500/50 mx-auto flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95 border-4 border-white ring-8 ring-red-100 cursor-pointer"
        >
          <HeartPulse className="w-12 h-12 animate-pulse" />
          <span>PRESS SOS</span>
          <span className="text-[10px] font-normal tracking-normal opacity-90">1-Click Hospital Alert</span>
        </button>

        {ambulanceDispatched && (
          <div className="max-w-lg mx-auto p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 text-left">
              <Ambulance className="w-6 h-6 text-emerald-600 animate-pulse" />
              <div>
                <div className="font-bold">Rapid Response Unit #4 En Route</div>
                <div className="text-[11px] text-emerald-700">Paramedic Team: ALS Equipped • ETA: {eta} Minutes</div>
              </div>
            </div>
            <span className="font-bold text-emerald-800 bg-emerald-200 px-2.5 py-1 rounded-full">
              LIVE TRACKING
            </span>
          </div>
        )}
      </div>

      {/* Emergency Grid: Patient Allergy Card & Triage Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Patient Emergency Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Emergency Medical Identity Card
              </h3>
            </div>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
              Critical Profile
            </span>
          </div>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-base font-bold text-slate-900">{currentPatient.name}</div>
                <div className="text-slate-500">Age: {currentPatient.age} • Gender: {currentPatient.gender}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-red-700 uppercase">Blood Type</span>
                <div className="text-xl font-black text-red-600">{currentPatient.bloodGroup}</div>
              </div>
            </div>

            <div className="border-t border-red-200 pt-2 space-y-1">
              <span className="font-bold text-red-950 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Severe Drug Allergies:
              </span>
              <div className="text-red-700 font-semibold bg-white p-2 rounded-lg border border-red-200">
                {currentPatient.allergies.join(", ")}
              </div>
            </div>

            <div className="border-t border-red-200 pt-2 space-y-1">
              <span className="font-bold text-slate-900">Pre-Existing Conditions:</span>
              <div className="text-slate-700">{currentPatient.chronicConditions.join(", ")}</div>
            </div>

            <div className="border-t border-red-200 pt-2 flex justify-between items-center text-[11px]">
              <div>
                <span className="font-bold text-slate-900">Emergency Contact: </span>
                {currentPatient.emergencyContact.name} ({currentPatient.emergencyContact.relationship})
              </div>
              <span className="font-bold text-red-600">{currentPatient.emergencyContact.phone}</span>
            </div>
          </div>
        </div>

        {/* Right: Hospital Emergency Resources (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Trauma & Resuscitation Center Readiness
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500">ICU Beds Available</span>
              <div className="text-xl font-bold text-slate-900">{hospitalStats.icuBedsAvailable} Units</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Ventilator Equipped</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500">Trauma Surgeons On Duty</span>
              <div className="text-xl font-bold text-slate-900">3 Specialists</div>
              <span className="text-[10px] text-blue-600 font-semibold">Ready in OR 1 & OR 2</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500">Blood Bank Reserve</span>
              <div className="text-xl font-bold text-slate-900">O-Neg / A+ Ready</div>
              <span className="text-[10px] text-slate-500">Central Pathology Bank</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500">Average Triage Time</span>
              <div className="text-xl font-bold text-emerald-600">2.4 Minutes</div>
              <span className="text-[10px] text-slate-500">Door-to-Doctor protocol</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900">First-Aid & Triage Reference:</div>
            <div>• <strong>Chest Pain / Cardiac:</strong> Keep patient seated, administer prescribed sublingual nitroglycerin if indicated.</div>
            <div>• <strong>Stroke (F.A.S.T):</strong> Face drooping, Arm weakness, Speech difficulty, Time to call 911 immediately.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
