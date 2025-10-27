import React, { useState } from "react";
import { X, Download, User, Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/calculations";

interface RequestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPayment: (
    fromUserId: string,
    amount: number,
    description: string,
    groupId?: string
  ) => void;
  users: any[];
  peopleOweYou: any[];
}

const RequestPaymentModal: React.FC<RequestPaymentModalProps> = ({
  isOpen,
  onClose,
  onRequestPayment,
  users,
  peopleOweYou,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fromUserId: "",
    amount: "",
    description: "",
    groupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromUserId || !formData.amount || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      onRequestPayment(
        formData.fromUserId,
        amount,
        formData.description,
        formData.groupId || undefined
      );
      onClose();
      setFormData({ fromUserId: "", amount: "", description: "", groupId: "" });
    } catch (error) {
      console.error("Error requesting payment:", error);
      alert("Failed to send payment request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ fromUserId: "", amount: "", description: "", groupId: "" });
    onClose();
  };

  const quickSelectCredit = (credit: any) => {
    setFormData({
      fromUserId: credit.user?.id || "",
      amount: credit.amount.toString(),
      description: `Payment request from ${credit.user?.name} for ${credit.group}`,
      groupId: credit.groupId || "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Request Payment
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Select from Credits */}
          {peopleOweYou.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select from Credits
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {peopleOweYou.map((credit, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickSelectCredit(credit)}
                    className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {credit.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{credit.group}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(credit.amount, credit.currency)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              <span>From *</span>
            </label>
            <select
              value={formData.fromUserId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fromUserId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              required
              disabled={isSubmitting}
            >
              <option value="">Select who should pay</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Wallet className="h-4 w-4" />
              <span>Amount (RWF) *</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              placeholder="What's this payment request for?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Payment Request</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              The recipient will receive a notification about this payment
              request. They can pay you via mobile money or bank transfer.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-yellow-600 to-yellow-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPaymentModal;
