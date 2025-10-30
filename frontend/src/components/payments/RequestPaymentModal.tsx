import React, { useState } from "react";
import { X, Download, User, Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useApp } from "../../contexts/AppContext";
import { formatCurrency } from "../../utils/calculations";
import apiService from "../../services/apiService";

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
  const { showToast } = useToast();
  const { groups } = useApp();
  const [formData, setFormData] = useState({
    fromUserId: "",
    amount: "",
    description: "",
    groupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (peopleOweYou.length === 0) {
      showToast("No one owes you money to request payment from", "info");
      return;
    }

    if (!formData.fromUserId || !formData.amount || !formData.description) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine group currency
      const group = groups.find((g) => g.id === formData.groupId);
      const currency = group?.currency || "RWF";

      // Create payment request via API (user requests payment FROM another user)
      await apiService.createPayment({
        toUserId: formData.fromUserId, // Person who should pay
        amount,
        currency,
        description: formData.description,
        groupId: formData.groupId || undefined,
        type: "request",
        paymentMethod: "mobile_money",
      });

      showToast("Payment request sent successfully", "success");
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
      showToast("Failed to send payment request. Please try again.", "error");
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
                Quick Select from Who Owes You
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                {peopleOweYou.map((credit, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickSelectCredit(credit)}
                    className="w-full flex items-center justify-between p-3 text-left bg-white rounded-lg hover:bg-yellow-50 hover:border-yellow-300 border border-transparent transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
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
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Click any credit above to auto-fill the form
              </p>
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              <span>Request From *</span>
            </label>
            {peopleOweYou.length === 0 ? (
              <div className="w-full px-3 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  💰 No one owes you money yet!
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  All your balances are settled. There's no payment to request.
                </p>
              </div>
            ) : (
              <select
                value={formData.fromUserId}
                onChange={(e) => {
                  const selectedCredit = peopleOweYou.find(
                    (c) => c.user?.id === e.target.value
                  );
                  setFormData((prev) => ({
                    ...prev,
                    fromUserId: e.target.value,
                    amount: selectedCredit?.amount.toString() || prev.amount,
                    description:
                      `Payment request from ${selectedCredit?.user?.name} for ${selectedCredit?.group}` ||
                      prev.description,
                    groupId: selectedCredit?.groupId || prev.groupId,
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                required
                disabled={isSubmitting}
              >
                <option value="">Select who should pay</option>
                {peopleOweYou.map((credit) => (
                  <option key={credit.user?.id} value={credit.user?.id}>
                    {credit.user?.name} (
                    {formatCurrency(credit.amount, credit.currency)} -{" "}
                    {credit.group})
                  </option>
                ))}
              </select>
            )}
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
              disabled={isSubmitting || peopleOweYou.length === 0}
            >
              {isSubmitting
                ? "Sending..."
                : peopleOweYou.length === 0
                ? "Nothing to request"
                : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPaymentModal;
