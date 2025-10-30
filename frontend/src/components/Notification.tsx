import React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface NotificationProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600",
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-xl border shadow-xl max-w-md animate-slide-in-right ${colors[type]}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm mt-1 opacity-90 break-words">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Notification;
