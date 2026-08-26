/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp, PageId } from "./context/AppContext";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { AiSupportModal } from "./components/common/AiSupportModal";
import { LandingPage } from "./components/pages/LandingPage";
import { PatientPortal } from "./components/pages/PatientPortal";
import { DoctorPortal } from "./components/pages/DoctorPortal";
import { PharmacistPortal } from "./components/pages/PharmacistPortal";
import { HospitalDashboard } from "./components/pages/HospitalDashboard";
import { PharmacyManagement } from "./components/pages/PharmacyManagement";
import { LaboratoryManagement } from "./components/pages/LaboratoryManagement";
import { AppointmentsPage } from "./components/pages/AppointmentsPage";
import { DigitalPrescriptionPage } from "./components/pages/DigitalPrescriptionPage";
import { MedicineSearchPage } from "./components/pages/MedicineSearchPage";
import { DoctorPharmacistConnect } from "./components/pages/DoctorPharmacistConnect";
import { HealthRecordsPage } from "./components/pages/HealthRecordsPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { EmergencyPage } from "./components/pages/EmergencyPage";
import { SecurityPrivacyPage } from "./components/pages/SecurityPrivacyPage";
import { CompetitionSection } from "./components/pages/CompetitionSection";
import { DepartmentFlowPage } from "./components/pages/DepartmentFlowPage";
import { CheckCircle, AlertTriangle } from "lucide-react";

const MainContent: React.FC = () => {
  const { currentPage, toastMessage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case "home":
      case "about":
      case "contact":
        return <LandingPage />;
      case "patient-portal":
        return <PatientPortal />;
      case "doctor-portal":
        return <DoctorPortal />;
      case "pharmacist-portal":
        return <PharmacistPortal />;
      case "hospital-dashboard":
        return <HospitalDashboard />;
      case "pharmacy-mgmt":
        return <PharmacyManagement />;
      case "lab-mgmt":
        return <LaboratoryManagement />;
      case "appointments":
        return <AppointmentsPage />;
      case "digital-prescription":
        return <DigitalPrescriptionPage />;
      case "medicine-search":
        return <MedicineSearchPage />;
      case "doctor-pharmacist-connect":
        return <DoctorPharmacistConnect />;
      case "health-records":
        return <HealthRecordsPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "emergency":
        return <EmergencyPage />;
      case "security-privacy":
        return <SecurityPrivacyPage />;
      case "competition":
        return <CompetitionSection />;
      case "department-flow":
        return <DepartmentFlowPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderPage()}
      </main>

      <Footer />

      {/* Global Clinical AI Decision Support Modal */}
      <AiSupportModal />

      {/* Global Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl border border-slate-700">
            <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

