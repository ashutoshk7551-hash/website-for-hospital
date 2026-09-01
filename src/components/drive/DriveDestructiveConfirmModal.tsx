import React from "react";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";

interface DriveDestructiveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  items?: string[];
  isProcessing?: boolean;
}

export const DriveDestructiveConfirmModal: React.FC<DriveDestructiveConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  items,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {items && items.length > 0 && (
          <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-1.5 text-xs text-red-950">
            <div className="font-semibold text-red-900 text-[11px] uppercase tracking-wider">
              Affected Google Drive Items:
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px]">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            This action will modify or delete data in your Google Drive cloud account. This action cannot be undone.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isProcessing ? "Processing..." : "Confirm Deletion"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
