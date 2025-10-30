import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDestructive ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${
                  isDestructive ? "text-red-600" : "text-yellow-600"
                }`}
              />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-center mb-6">{message}</p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${
                isDestructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
