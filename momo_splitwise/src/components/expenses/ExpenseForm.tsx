import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, FileText } from 'lucide-react';
import type { Expense, User } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { calculateEqualSplit, calculatePercentageSplit } from '../../utils/calculations';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  users: User[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, groupId, users }) => {
  const { addExpense, currentGroup } = useApp();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitType: 'equal' as 'equal' | 'percentage' | 'custom',
    category: 'food',
  });
  const [splits, setSplits] = useState<{ userId: string; amount: string; percentage?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (users.length > 0 && isOpen) {
      setFormData(prev => ({ 
        ...prev, 
        paidBy: users[0]?.id || '',
        category: 'food'
      }));
      initializeSplits();
    }
  }, [users, isOpen]);

  const initializeSplits = () => {
    const initialSplits = users.map(user => ({
      userId: user.id,
      amount: '',
      percentage: ((100 / users.length).toFixed(2)).toString(),
    }));
    setSplits(initialSplits);
  };

  const handleSplitTypeChange = (type: 'equal' | 'percentage' | 'custom') => {
    setFormData(prev => ({ ...prev, splitType: type }));
    
    if (type === 'equal' && formData.amount) {
      updateEqualSplits();
    } else if (type === 'percentage') {
      const newSplits = users.map(user => ({
        userId: user.id,
        amount: '',
        percentage: ((100 / users.length).toFixed(2)).toString(),
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
      percentage: ((100 / users.length).toFixed(2)).toString(),
    }));
    setSplits(newSplits);
  };

  const handleAmountChange = (amount: string) => {
    setFormData(prev => ({ ...prev, amount }));
    
    if (formData.splitType === 'equal' && amount) {
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
      const percentage = totalAmount > 0 ? (customAmount / totalAmount) * 100 : 0;
      newSplits[index].percentage = percentage.toFixed(2);
    }
    
    setSplits(newSplits);
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    
    if (!formData.paidBy) {
      alert('Please select who paid for this expense');
      return false;
    }

    // Validate splits
    const totalAmount = parseFloat(formData.amount);
    const splitTotal = splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
    
    if (Math.abs(splitTotal - totalAmount) > 0.01) {
      alert(`Split amounts (${splitTotal.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)})`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency: currentGroup?.currency || 'KES',
        paidBy: formData.paidBy,
        splitType: formData.splitType,
        splits: splits.map(split => ({
          userId: split.userId,
          amount: parseFloat(split.amount) || 0,
          percentage: split.percentage ? parseFloat(split.percentage) : undefined,
        })),
        groupId,
        category: formData.category,
      };

      addExpense(expenseData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      paidBy: users[0]?.id || '',
      splitType: 'equal',
      category: 'food',
    });
    initializeSplits();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="What was this expense for?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4" />
                <span>Amount ({currentGroup?.currency || 'KES'}) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="">Select who paid</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Split Type *</label>
            <div className="flex space-x-4">
              {(['equal', 'percentage', 'custom'] as const).map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={formData.splitType === type}
                    onChange={() => handleSplitTypeChange(type)}
                    className="text-primary-600 focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Split Details *
              <span className="ml-2 text-xs text-gray-500">
                Total: {formData.amount || '0'} {currentGroup?.currency || 'KES'}
              </span>
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {splits.map((split, index) => {
                const user = users.find(u => u.id === split.userId);
                if (!user) return null;

                return (
                  <div key={split.userId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 truncate">{user.name}</span>
                      <p className="text-xs text-gray-500 truncate">{user.phoneNumber}</p>
                    </div>
                    
                    {formData.splitType === 'percentage' && (
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={split.percentage}
                          onChange={(e) => handlePercentageChange(index, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="%"
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                    
                    {(formData.splitType === 'custom' || formData.splitType === 'equal') && (
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={split.amount}
                          onChange={(e) => handleCustomAmountChange(index, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="0.00"
                          readOnly={formData.splitType === 'equal'}
                          disabled={isSubmitting || formData.splitType === 'equal'}
                        />
                      </div>
                    )}
                    
                    <div className="w-20 text-right">
                      <span className="text-sm text-gray-500">
                        {split.percentage && `${parseFloat(split.percentage).toFixed(1)}%`}
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;