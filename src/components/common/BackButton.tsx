import React from "react";
import { useNavigate } from "react-router-dom";
import { PageId, pageToPath } from "../../routes/routeConfig";
import { ArrowLeft, Home } from "lucide-react";

interface BackButtonProps {
  label?: string;
  fallbackPage?: PageId;
  className?: string;
  showHomeButton?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = "Back",
  fallbackPage = "home" as PageId,
  className = "",
  showHomeButton = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(pageToPath(fallbackPage));
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:shadow-xs transition font-semibold text-xs active:scale-95 cursor-pointer backdrop-blur-xs"
        title="Go to previous screen"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>{label}</span>
      </button>

      {showHomeButton && (
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition font-medium text-xs cursor-pointer"
          title="Return to Home Dashboard"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Home</span>
        </button>
      )}
    </div>
  );
};

