import React from "react";
import { useApp } from "../../context/AppContext";
import { Activity, ShieldCheck } from "lucide-react";

interface AuthHydrationGuardProps {
  children: React.ReactNode;
  portalName?: string;
}

export const AuthHydrationGuard: React.FC<AuthHydrationGuardProps> = ({
  children,
  portalName = "Clinical Portal",
}) => {
  const { isAuthInitializing } = useApp();

  if (isAuthInitializing) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm animate-pulse">
            <Activity className="w-8 h-8 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Verifying Clinical Session & Access
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          Re-hydrating authenticated credentials and patient records for {portalName}...
        </p>

        <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-3/4" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
