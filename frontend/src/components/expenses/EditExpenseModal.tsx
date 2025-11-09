import React, { useState, useEffect } from "react";
import { X, Users, DollarSign, FileText } from "lucide-react";
import type { Expense, User } from "../../types";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { ExpenseCategory } from '../../types';
import {
  calculateEqualSplit,
  calculatePercentageSplit,
} from "../../utils/calculations";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  users: User[];
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  users,
}) => {
  const { updateExpense, groups } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    description: expense.description,
    amount: expense.amount.toString(),
    paidBy: expense.paidBy,
    splitType: expense.splitType as "equal" | "percentage" | "exact", // Changed from 'custom' to 'exact'
    category: expense.category,
  });
  const [splits, setSplits] = useState<
    { userId: string; amount: string; percentage?: string }[]
  >(
    expense.splits.map((split) => ({
      userId: split.userId,
      amount: split.amount.toString(),
      percentage: split.percentage?.toString(),
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentGroup = groups.find((g) => g.id === expense.groupId);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        paidBy: expense.paidBy,
        splitType: expense.splitType as "equal" | "percentage" | "exact", // Changed from 'custom' to 'exact'
        category: expense.category,
      });
      setSplits(
        expense.splits.map((split) => ({
          userId: split.userId,
          amount: split.amount.toString(),
          percentage: split.percentage?.toString(),
        }))
      );
    }
  }, [isOpen, expense]);

  const handleSplitTypeChange = (type: "equal" | "percentage" | "exact") => {
    // Changed from 'custom' to 'exact'
    setFormData((prev) => ({ ...prev, splitType: type }));

    if (type === "equal" && formData.amount) {
      updateEqualSplits();
    } else if (type === "percentage") {
      const newSplits = users.map((user) => ({
        userId: user.id,
        amount: "",
        percentage: (100 / users.length).toFixed(2).toString(),
      }));
      setSplits(newSplits);
    }
  };

  const updateEqualSplits = () => {
    if (!formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    const equalShares = calculateEqualSplit(amount, users.length);
    const newSplits = users.map((user, index) => ({
      userId: user.id,
      amount: equalShares[index].toString(),
      percentage: (100 / users.length).toFixed(2).toString(),
    }));
    setSplits(newSplits);
  };

  const handleAmountChange = (amount: string) => {
    setFormData((prev) => ({ ...prev, amount }));

    if (formData.splitType === "equal" && amount) {
      updateEqualSplits();
    }
  };

  const handlePercentageChange = (index: number, percentage: string) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], percentage };

    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      const percentageNum = parseFloat(percentage) || 0;
      newSplits[index].amount = ((amount * percentageNum) / 100).toFixed(2);
    }

    setSplits(newSplits);
  };

  const handleCustomAmountChange = (index: number, amount: string) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], amount };

    if (formData.amount) {
      const totalAmount = parseFloat(formData.amount);
      const customAmount = parseFloat(amount) || 0;
      const percentage =
        totalAmount > 0 ? (customAmount / totalAmount) * 100 : 0;
      newSplits[index].percentage = percentage.toFixed(2);
    }

    setSplits(newSplits);
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      showToast("Please enter a description", "error");
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return false;
    }

    if (!formData.paidBy) {
      showToast("Please select who paid for this expense", "error");
      return false;
    }

    const totalAmount = parseFloat(formData.amount);
    const splitTotal = splits.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0
    );

    if (Math.abs(splitTotal - totalAmount) > 0.01) {
      showToast(
        `Split amounts must equal total amount (${totalAmount.toFixed(2)} ${
          currentGroup?.currency || "RWF"
        })`,
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const updatedExpense: Expense = {
        ...expense,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        splitType: formData.splitType,
        splits: splits.map((split) => ({
          userId: split.userId,
          amount: parseFloat(split.amount) || 0,
          percentage: split.percentage
            ? parseFloat(split.percentage)
            : undefined,
        })),
        category: formData.category,
      };

      await updateExpense(updatedExpense);
      showToast("Expense updated successfully", "success");
      onClose();
    } catch (error) {
      console.error("Error updating expense:", error);
      showToast("Failed to update expense", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              <span>Description *</span>
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
              placeholder="What was this expense for?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4" />
                <span>Amount ({currentGroup?.currency || "RWF"}) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4" />
                <span>Paid By *</span>
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paidBy: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                required
                disabled={isSubmitting}
              >
                <option value="">Select who paid</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value as ExpenseCategory }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              required
              disabled={isSubmitting}
            >
              <option value="food">Food & Dining</option>
              <option value="transport">Transport</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Type *
            </label>
            <div className="flex space-x-4">
              {(["equal", "percentage", "exact"] as const).map(
                (
                  type // Changed from 'custom' to 'exact'
                ) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={formData.splitType === type}
                      onChange={() => handleSplitTypeChange(type)}
                      className="text-yellow-600 focus:ring-yellow-600"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {type}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Split Details *
              <span className="ml-2 text-xs text-gray-500">
                Total: {formData.amount || "0"}{" "}
                {currentGroup?.currency || "RWF"}
              </span>
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {splits.map((split, index) => {
                const user = users.find((u) => u.id === split.userId);
                if (!user) return null;

                return (
                  <div
                    key={split.userId}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </span>
                      <p className="text-xs text-gray-500 truncate">
                        {user.phoneNumber}
                      </p>
                    </div>

                    {formData.splitType === "percentage" && (
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={split.percentage}
                          onChange={(e) =>
                            handlePercentageChange(index, e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600 transition-all duration-200"
                          placeholder="%"
                          disabled={isSubmitting}
                        />
                      </div>
                    )}

                    {(formData.splitType === "exact" ||
                      formData.splitType === "equal") && ( // Changed from 'custom' to 'exact'
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={split.amount}
                          onChange={(e) =>
                            handleCustomAmountChange(index, e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600 transition-all duration-200"
                          placeholder="0.00"
                          readOnly={formData.splitType === "equal"}
                          disabled={
                            isSubmitting || formData.splitType === "equal"
                          }
                        />
                      </div>
                    )}

                    <div className="w-20 text-right">
                      <span className="text-sm text-gray-500">
                        {split.percentage &&
                          `${parseFloat(split.percentage).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
              {isSubmitting ? "Updating..." : "Update Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
