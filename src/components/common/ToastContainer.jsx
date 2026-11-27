import React from "react";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        let borderColor = "border-slate-800";
        let bgColor = "bg-slate-900/95";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderColor = "border-emerald-500/30";
        } else if (toast.type === "warning") {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderColor = "border-amber-500/30";
        } else if (toast.type === "error" || toast.type === "danger") {
          icon = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
          borderColor = "border-red-500/40";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${bgColor} ${borderColor}`}
          >
            <div className="flex items-center gap-3 mr-2">
              {icon}
              <p className="text-xs text-white font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}