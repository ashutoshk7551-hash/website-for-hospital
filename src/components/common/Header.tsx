import React, { useState } from "react";
import { useApp, PageId } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  Activity,
  User,
  Stethoscope,
  Pill,
  Building2,
  TestTube2,
  Calendar,
  FileText,
  Search,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Bell,
  Menu,
  X,
  PhoneCall,
  GitBranch,
  Award,
  ChevronDown,
  Info,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    currentPage,
    setCurrentPage,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setAiModalOpen,
    triggerEmergencyAlert,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roles: { role: UserRole; label: string; icon: any; page: PageId; color: string }[] = [
    { role: "patient", label: "Patient", icon: User, page: "patient-portal", color: "bg-blue-600" },
    { role: "doctor", label: "Doctor", icon: Stethoscope, page: "doctor-portal", color: "bg-teal-600" },
    { role: "pharmacist", label: "Pharmacist", icon: Pill, page: "pharmacist-portal", color: "bg-emerald-600" },
    { role: "admin", label: "Hospital Admin", icon: Building2, page: "hospital-dashboard", color: "bg-indigo-600" },
    { role: "lab_tech", label: "Laboratory", icon: TestTube2, page: "lab-mgmt", color: "bg-purple-600" },
  ];

  const handleRoleChange = (r: UserRole, targetPage: PageId) => {
    setActiveRole(r);
    setCurrentPage(targetPage);
  };

  const navLinks: { id: PageId; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Activity },
    { id: "medicine-search", label: "Medicine Search", icon: Search },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "digital-prescription", label: "e-Prescription", icon: FileText },
    { id: "doctor-pharmacist-connect", label: "Doctor ↔ Pharmacist", icon: MessageSquare },
    { id: "department-flow", label: "Hospital Flow", icon: GitBranch },
    { id: "competition", label: "Competition Demo", icon: Award },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner: Role Switcher & Emergency Quick Action */}
      <div className="bg-slate-900 text-white px-4 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Role Quick Selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
          <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider hidden sm:inline">
            Active Role:
          </span>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            {roles.map((item) => {
              const Icon = item.icon;
              const isActive = activeRole === item.role;
              return (
                <button
                  key={item.role}
                  id={`role-switch-${item.role}`}
                  onClick={() => handleRoleChange(item.role, item.page)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    isActive
                      ? `${item.color} text-white shadow-xs`
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-3">
          <button
            id="emergency-top-btn"
            onClick={() => {
              setCurrentPage("emergency");
              triggerEmergencyAlert();
            }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-xs font-semibold animate-pulse transition"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Emergency SOS</span>
          </button>
          
          <button
            id="ai-top-btn"
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 text-white px-2.5 py-1 rounded-md text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span className="hidden md:inline">AI Clinical Support</span>
            <span className="md:hidden">AI</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  People's<span className="text-teal-600"> Hospital</span>
                </span>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-1.5 py-0.5 rounded border border-teal-200">
                  HEALTH SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hospital, Pharmacy & Patient Management System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 5).map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => setCurrentPage(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}

            {/* Portals Dropdown */}
            <div className="relative">
              <button
                id="portals-dropdown-btn"
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                onBlur={() => setTimeout(() => setPortalsDropdownOpen(false), 200)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition ${
                  [
                    "patient-portal",
                    "doctor-portal",
                    "pharmacist-portal",
                    "hospital-dashboard",
                    "pharmacy-mgmt",
                    "lab-mgmt",
                  ].includes(currentPage)
                    ? "bg-teal-50 text-teal-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>Department Portals</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {portalsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role-Based Workspaces
                  </div>
                  <button
                    onClick={() => {
                      setActiveRole("patient");
                      setCurrentPage("patient-portal");
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold">Patient Portal</div>
                      <div className="text-[10px] text-slate-400">Prescriptions, Reminders, Lab Reports</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole("doctor");
                      setCurrentPage("doctor-portal");
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-semibold">Doctor Portal</div>
                      <div className="text-[10px] text-slate-400">e-Prescription, Appointments, EHR</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole("pharmacist");
                      setCurrentPage("pharmacist-portal");
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">Pharmacist Dashboard</div>
                      <div className="text-[10px] text-slate-400">Verification, Dispensing, Interactions</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole("admin");
                      setCurrentPage("hospital-dashboard");
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold">Hospital Administrator</div>
                      <div className="text-[10px] text-slate-400">Beds, Staff, OPD/IPD Operations</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("pharmacy-mgmt");
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Pill className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-semibold">Smart Pharmacy Inventory</div>
                      <div className="text-[10px] text-slate-400">Stock Alerts, Batch Tracking</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole("lab_tech");
                      setCurrentPage("lab-mgmt");
                      setPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <TestTube2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-semibold">Laboratory Management</div>
                      <div className="text-[10px] text-slate-400">Sample Tracking, Digital Reports</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* More / System Dropdown */}
            <div className="relative">
              <button
                id="tools-dropdown-btn"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition ${
                  ["competition", "department-flow", "analytics", "security-privacy", "health-records", "about", "contact"].includes(currentPage)
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setCurrentPage("department-flow");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <GitBranch className="w-4 h-4 text-teal-600" />
                    Hospital Integration Flow
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("competition");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    Problem & Innovation Demo
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("analytics");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Hospital Analytics
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("health-records");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    Unified Health Records (EHR)
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("security-privacy");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Security & HIPAA Audit
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("about");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Info className="w-4 h-4 text-indigo-600" />
                    About Platform
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("contact");
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    Hospital Directory & Contact
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons: Notifications & Role Badge */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">Hospital Notifications</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No active notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !notif.isRead ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Active Workspace Indicator Pill */}
            <div
              onClick={() => {
                const roleMap: Record<UserRole, PageId> = {
                  patient: "patient-portal",
                  doctor: "doctor-portal",
                  pharmacist: "pharmacist-portal",
                  admin: "hospital-dashboard",
                  lab_tech: "lab-mgmt",
                };
                setCurrentPage(roleMap[activeRole]);
              }}
              className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium uppercase leading-tight">Logged in as</div>
                <div className="text-xs font-semibold text-slate-800 capitalize leading-tight">
                  {activeRole.replace("_", " ")}
                </div>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentPage(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left ${
                    currentPage === link.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Role Portals</div>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    setActiveRole(r.role);
                    setCurrentPage(r.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left ${
                    activeRole === r.role ? "bg-teal-50 text-teal-800 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
