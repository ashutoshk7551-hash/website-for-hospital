/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/common/Header";
import { Breadcrumbs } from "./components/common/Breadcrumbs";
import { Footer } from "./components/common/Footer";
import { AuthHydrationGuard } from "./components/common/AuthHydrationGuard";
import { AiSupportModal } from "./components/common/AiSupportModal";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";
import { PatientAuthModal } from "./components/common/PatientAuthModal";
import { StaffAuthModal } from "./components/common/StaffAuthModal";
import { SmsDeviceModal } from "./components/common/SmsDeviceModal";
import { LandingPage } from "./components/pages/LandingPage";
import { AboutPage } from "./components/pages/AboutPage";
import { ContactPage } from "./components/pages/ContactPage";
import { PatientList } from "./components/patients/PatientList";
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
import { AdminPortal } from "./components/admin/AdminPortal";
import { GoogleDriveVault } from "./components/drive/GoogleDriveVault";
import { GmailHub } from "./components/gmail/GmailHub";
import { GoogleDocsHub } from "./components/docs/GoogleDocsHub";
import { WorkspaceSuitePage } from "./components/workspace/WorkspaceSuitePage";
import { GoogleSheetsHub } from "./components/workspace/GoogleSheetsHub";
import { GoogleCalendarHub } from "./components/workspace/GoogleCalendarHub";
import { GoogleSlidesHub } from "./components/workspace/GoogleSlidesHub";
import { GoogleTasksHub } from "./components/workspace/GoogleTasksHub";
import { GoogleChatHub } from "./components/workspace/GoogleChatHub";
import { GoogleFormsHub } from "./components/workspace/GoogleFormsHub";
import { GoogleKeepHub } from "./components/workspace/GoogleKeepHub";
import { DriveExportModal } from "./components/drive/DriveExportModal";
import { HipaaComplianceModal } from "./components/common/HipaaComplianceModal";
import { PatientInquiryModal } from "./components/common/PatientInquiryModal";
import { CheckCircle } from "lucide-react";

const MainContent: React.FC = () => {
  const {
    toastMessage,
    hipaaModalOpen,
    setHipaaModalOpen,
    inquiryModalOpen,
    setInquiryModalOpen,
    inquiryModalType,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white">
      <Header />
      <Breadcrumbs />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          {/* Main Landing & Informational */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/dashboard" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Appointments */}
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/:id" element={<AppointmentsPage />} />

          {/* Patient Registry & Directory with Real-time Firestore Sync */}
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patient-list" element={<PatientList />} />

          {/* Patient Portal & Profile Deep-links */}
          <Route
            path="/patient-portal"
            element={
              <AuthHydrationGuard portalName="Patient Health Portal">
                <PatientPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/patient-dashboard"
            element={
              <AuthHydrationGuard portalName="Patient Health Portal">
                <PatientPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <AuthHydrationGuard portalName="Patient Health Profile">
                <PatientPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <AuthHydrationGuard portalName="Patient Health Profile">
                <PatientPortal />
              </AuthHydrationGuard>
            }
          />

          {/* Clinical Staff Portals */}
          <Route
            path="/doctor-portal"
            element={
              <AuthHydrationGuard portalName="Doctor Clinical Station">
                <DoctorPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/doctor"
            element={
              <AuthHydrationGuard portalName="Doctor Clinical Station">
                <DoctorPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/pharmacist-portal"
            element={
              <AuthHydrationGuard portalName="Pharmacist Verification Station">
                <PharmacistPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/pharmacist"
            element={
              <AuthHydrationGuard portalName="Pharmacist Verification Station">
                <PharmacistPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/hospital-dashboard"
            element={
              <AuthHydrationGuard portalName="Hospital Operations Command Center">
                <HospitalDashboard />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthHydrationGuard portalName="Executive Administration Console">
                <AdminPortal />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/admin-portal"
            element={
              <AuthHydrationGuard portalName="Executive Administration Console">
                <AdminPortal />
              </AuthHydrationGuard>
            }
          />

          {/* Cloud Integrations */}
          <Route
            path="/google-drive-vault"
            element={
              <AuthHydrationGuard portalName="Google Drive Cloud Vault">
                <GoogleDriveVault />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/drive"
            element={
              <AuthHydrationGuard portalName="Google Drive Cloud Vault">
                <GoogleDriveVault />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/gmail-hub"
            element={
              <AuthHydrationGuard portalName="Gmail Medical Hub">
                <GmailHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/gmail"
            element={
              <AuthHydrationGuard portalName="Gmail Medical Hub">
                <GmailHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/google-docs"
            element={
              <AuthHydrationGuard portalName="Google Docs Clinical Hub">
                <GoogleDocsHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/docs"
            element={
              <AuthHydrationGuard portalName="Google Docs Clinical Hub">
                <GoogleDocsHub />
              </AuthHydrationGuard>
            }
          />

          {/* Google Workspace Suite & Expanded Tools */}
          <Route path="/workspace-suite" element={<WorkspaceSuitePage />} />
          <Route path="/workspace" element={<WorkspaceSuitePage />} />

          <Route
            path="/google-sheets"
            element={
              <AuthHydrationGuard portalName="Google Sheets Clinical Registry">
                <GoogleSheetsHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/sheets"
            element={
              <AuthHydrationGuard portalName="Google Sheets Clinical Registry">
                <GoogleSheetsHub />
              </AuthHydrationGuard>
            }
          />

          <Route
            path="/google-calendar"
            element={
              <AuthHydrationGuard portalName="Google Calendar Clinical Schedule">
                <GoogleCalendarHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/calendar"
            element={
              <AuthHydrationGuard portalName="Google Calendar Clinical Schedule">
                <GoogleCalendarHub />
              </AuthHydrationGuard>
            }
          />

          <Route
            path="/google-slides"
            element={
              <AuthHydrationGuard portalName="Google Slides Case Studies">
                <GoogleSlidesHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/slides"
            element={
              <AuthHydrationGuard portalName="Google Slides Case Studies">
                <GoogleSlidesHub />
              </AuthHydrationGuard>
            }
          />

          <Route
            path="/google-tasks"
            element={
              <AuthHydrationGuard portalName="Google Tasks Action Tracker">
                <GoogleTasksHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/tasks"
            element={
              <AuthHydrationGuard portalName="Google Tasks Action Tracker">
                <GoogleTasksHub />
              </AuthHydrationGuard>
            }
          />

          <Route
            path="/google-chat"
            element={
              <AuthHydrationGuard portalName="Google Chat Care Team Channel">
                <GoogleChatHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthHydrationGuard portalName="Google Chat Care Team Channel">
                <GoogleChatHub />
              </AuthHydrationGuard>
            }
          />

          <Route
            path="/google-forms"
            element={
              <AuthHydrationGuard portalName="Google Forms Intake & Surveys">
                <GoogleFormsHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/forms"
            element={
              <AuthHydrationGuard portalName="Google Forms Intake & Surveys">
                <GoogleFormsHub />
              </AuthHydrationGuard>
            }
          />

          <Route
            path="/google-keep"
            element={
              <AuthHydrationGuard portalName="Google Keep Bedside Notes">
                <GoogleKeepHub />
              </AuthHydrationGuard>
            }
          />
          <Route
            path="/keep"
            element={
              <AuthHydrationGuard portalName="Google Keep Bedside Notes">
                <GoogleKeepHub />
              </AuthHydrationGuard>
            }
          />

          {/* Department Services */}
          <Route path="/pharmacy-mgmt" element={<PharmacyManagement />} />
          <Route path="/pharmacy" element={<PharmacyManagement />} />
          <Route path="/lab-mgmt" element={<LaboratoryManagement />} />
          <Route path="/laboratory" element={<LaboratoryManagement />} />
          <Route path="/digital-prescription" element={<DigitalPrescriptionPage />} />
          <Route path="/prescriptions" element={<DigitalPrescriptionPage />} />
          
          {/* Medicine Formulary & Deep links */}
          <Route path="/medicine-search" element={<MedicineSearchPage />} />
          <Route path="/medicines" element={<MedicineSearchPage />} />
          <Route path="/medicines/:id" element={<MedicineSearchPage />} />
          <Route path="/medicine/:id" element={<MedicineSearchPage />} />

          <Route path="/doctor-pharmacist-connect" element={<DoctorPharmacistConnect />} />
          
          {/* Health Records & Record ID Deep links */}
          <Route path="/health-records" element={<HealthRecordsPage />} />
          <Route path="/records" element={<HealthRecordsPage />} />
          <Route path="/records/:id" element={<HealthRecordsPage />} />
          <Route path="/record/:id" element={<HealthRecordsPage />} />

          {/* Operations & System */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/security-privacy" element={<SecurityPrivacyPage />} />
          <Route path="/competition" element={<CompetitionSection />} />
          <Route path="/department-flow" element={<DepartmentFlowPage />} />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Clinical AI Decision Support Modal */}
      <AiSupportModal />

      {/* Global Quick Search & Service Discovery Modal */}
      <GlobalSearchModal />

      {/* Global Patient Sign In & Registration Modal */}
      <PatientAuthModal />

      {/* Global Doctor, Pharmacist, Admin, Lab Staff Sign In Modal */}
      <StaffAuthModal />

      {/* Global Interactive SMS Mobile Device Simulation Modal */}
      <SmsDeviceModal />

      {/* Global HIPAA / Data Privacy Compliance Modal */}
      <HipaaComplianceModal
        isOpen={hipaaModalOpen}
        onClose={() => setHipaaModalOpen(false)}
      />

      {/* Global Patient Intake & Inquiry Submission Modal */}
      <PatientInquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialType={inquiryModalType}
      />

      {/* Global Google Drive Document Export Modal */}
      <DriveExportModal />

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


