import React, { useState } from "react";
import { X, Send, User, Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/calculations";

interface SendPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPayment: (
    toUserId: string,
    amount: number,
    description: string,
    groupId?: string
  ) => void;
  users: any[];
  youOwePeople: any[];
}

const SendPaymentModal: React.FC<SendPaymentModalProps> = ({
  isOpen,
  onClose,
  onSendPayment,
  users,
  youOwePeople,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    toUserId: "",
    amount: "",
    description: "",
    groupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.toUserId || !formData.amount || !formData.description) {
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

      onSendPayment(
        formData.toUserId,
        amount,
        formData.description,
        formData.groupId || undefined
      );
      onClose();
      setFormData({ toUserId: "", amount: "", description: "", groupId: "" });
    } catch (error) {
      console.error("Error sending payment:", error);
      alert("Failed to send payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ toUserId: "", amount: "", description: "", groupId: "" });
    onClose();
  };

  const quickSelectDebt = (debt: any) => {
    setFormData({
      toUserId: debt.user?.id || "",
      amount: debt.amount.toString(),
      description: `Settle up with ${debt.user?.name} for ${debt.group}`,
      groupId: debt.groupId || "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Send Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Select from Debts */}
          {youOwePeople.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select from Debts
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {youOwePeople.map((debt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickSelectDebt(debt)}
                    className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {debt.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{debt.group}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(debt.amount, debt.currency)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              <span>Recipient *</span>
            </label>
            <select
              value={formData.toUserId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, toUserId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              required
              disabled={isSubmitting}
            >
              <option value="">Select recipient</option>
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
              placeholder="What's this payment for?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Send className="h-4 w-4" />
              <span className="text-sm font-medium">Payment Method</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              This payment will be processed via MTN Mobile Money. You'll
              receive a confirmation once completed.
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
              {isSubmitting ? "Sending..." : "Send Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendPaymentModal;
