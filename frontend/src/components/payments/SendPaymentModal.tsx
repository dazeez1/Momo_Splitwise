import React, { useState } from "react";
import { X, Send, User, Wallet, Copy, Phone } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useApp } from "../../contexts/AppContext";
import { formatCurrency } from "../../utils/calculations";
import {
  generatePaymentCode,
  copyToClipboard,
  createPhoneCallUrl,
} from "../../utils/momoPayment";
import apiService from "../../services/apiService";

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
  const { showToast } = useToast();
  const { groups } = useApp();
  const [formData, setFormData] = useState({
    toUserId: "",
    amount: "",
    description: "",
    groupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(true);
      showToast("Payment code copied to clipboard!", "success");
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      showToast("Failed to copy code", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (youOwePeople.length === 0) {
      showToast("You don't have any pending debts to pay", "info");
      return;
    }

    if (!formData.toUserId || !formData.amount || !formData.description) {
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

      // Create payment via API
      await apiService.createPayment({
        toUserId: formData.toUserId,
        amount,
        currency,
        description: formData.description,
        groupId: formData.groupId || undefined,
        type: "settlement",
        paymentMethod: "mobile_money",
      });

      showToast("Payment sent successfully", "success");
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
      showToast("Failed to send payment. Please try again.", "error");
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

  // Get recipient details
  const recipient = users.find((u) => u.id === formData.toUserId);

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
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                {youOwePeople.map((debt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickSelectDebt(debt)}
                    className="w-full flex items-center justify-between p-3 text-left bg-white rounded-lg hover:bg-yellow-50 hover:border-yellow-300 border border-transparent transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
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
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Click any debt above to auto-fill the form
              </p>
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              <span>Recipient *</span>
            </label>
            {youOwePeople.length === 0 ? (
              <div className="w-full px-3 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  🎉 You don't owe anyone!
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  All your debts are settled. There's no payment to send.
                </p>
              </div>
            ) : (
              <select
                value={formData.toUserId}
                onChange={(e) => {
                  const selectedDebt = youOwePeople.find(
                    (d) => d.user?.id === e.target.value
                  );
                  setFormData((prev) => ({
                    ...prev,
                    toUserId: e.target.value,
                    amount: selectedDebt?.amount.toString() || prev.amount,
                    description:
                      `Settle up with ${selectedDebt?.user?.name} for ${selectedDebt?.group}` ||
                      prev.description,
                    groupId: selectedDebt?.groupId || prev.groupId,
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                required
                disabled={isSubmitting}
              >
                <option value="">Select recipient</option>
                {youOwePeople.map((debt) => (
                  <option key={debt.user?.id} value={debt.user?.id}>
                    {debt.user?.name} (
                    {formatCurrency(debt.amount, debt.currency)} - {debt.group})
                  </option>
                ))}
              </select>
            )}

            {/* Recipient's Mobile Money Info */}
            {recipient &&
              recipient.mobileMoneyNumber &&
              formData.amount &&
              !isNaN(parseFloat(formData.amount)) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Wallet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Send to{" "}
                        {recipient.mobileMoneyProvider || "Mobile Money"}:
                      </p>
                      <p className="text-lg font-bold text-blue-700 mt-1">
                        {recipient.mobileMoneyNumber}
                      </p>
                    </div>
                  </div>

                  {/* USSD Code */}
                  {recipient.mobileMoneyProvider &&
                    recipient.mobileMoneyProvider !== "Bank" && (
                      <div className="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-600">
                            Dial Code
                          </p>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleCopyCode(
                                e,
                                generatePaymentCode(
                                  recipient.mobileMoneyProvider || "MTN",
                                  recipient.mobileMoneyNumber,
                                  parseFloat(formData.amount)
                                )
                              )
                            }
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copiedCode ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-sm font-mono text-gray-800 bg-gray-50 px-2 py-2 rounded border border-gray-200 break-all">
                            {generatePaymentCode(
                              recipient.mobileMoneyProvider || "MTN",
                              recipient.mobileMoneyNumber,
                              parseFloat(formData.amount)
                            )}
                          </code>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              const code = generatePaymentCode(
                                recipient.mobileMoneyProvider || "MTN",
                                recipient.mobileMoneyNumber,
                                parseFloat(formData.amount)
                              );

                              // Copy the code first
                              await copyToClipboard(code);
                              showToast(
                                `Payment code copied! Open your ${
                                  recipient.mobileMoneyProvider ||
                                  "mobile money"
                                } app and dial the code.`,
                                "success"
                              );

                              // Try to open the dialer (if user wants)
                              setTimeout(() => {
                                window.location.href = createPhoneCallUrl(code);
                              }, 1500);
                            }}
                            className="flex items-center justify-center w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Phone className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              )}
            {recipient && !recipient.mobileMoneyNumber && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-3">
                <Wallet className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    ⚠️ {recipient.name} hasn't added their mobile money number
                    yet.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Ask them to add it in their profile settings.
                  </p>
                </div>
              </div>
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
              disabled={isSubmitting || youOwePeople.length === 0}
            >
              {isSubmitting
                ? "Sending..."
                : youOwePeople.length === 0
                ? "No debts to pay"
                : "Send Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendPaymentModal;
