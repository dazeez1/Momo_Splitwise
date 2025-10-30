import React from 'react';
import { Trash2, Edit, User } from 'lucide-react';
import type { Expense } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  const { users, groups } = useApp();
  const { user } = useAuth();

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || 'Unknown Group';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-green-100 text-green-800',
      transport: 'bg-blue-100 text-blue-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Start by adding your first expense to track shared costs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map(expense => {
        const paidByUser = users.find(u => u.id === expense.paidBy);
        const isOwnedByUser = expense.paidBy === user?.id;

        return (
          <div
            key={expense.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {expense.description}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>
                      Paid by <strong className={isOwnedByUser ? 'text-luxury-purple' : 'text-gray-900'}>
                        {isOwnedByUser ? 'You' : getUserName(expense.paidBy)}
                      </strong>
                    </span>
                  </div>
                  <div>
                    Group: <strong className="text-gray-900">{getGroupName(expense.groupId)}</strong>
                  </div>
                  <div>
                    Date: <strong className="text-gray-900">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </strong>
                  </div>
                </div>

                {/* Split Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Split Details:</span>
                    <span className="text-sm text-gray-500 capitalize">{expense.splitType} split</span>
                  </div>
                  <div className="space-y-2">
                    {expense.splits.map(split => {
                      const splitUser = users.find(u => u.id === split.userId);
                      const isCurrentUser = split.userId === user?.id;
                      return (
                        <div key={split.userId} className="flex items-center justify-between text-sm">
                          <span className={isCurrentUser ? 'text-luxury-purple font-medium' : 'text-gray-600'}>
                            {isCurrentUser ? 'You' : splitUser?.name || 'Unknown User'}
                          </span>
                          <div className="flex items-center space-x-3">
                            {expense.splitType === 'percentage' && split.percentage && (
                              <span className="text-gray-500 text-xs">
                                {split.percentage.toFixed(1)}%
                              </span>
                            )}
                            <span className={isCurrentUser ? 'text-luxury-purple font-medium' : 'text-gray-900'}>
                              {formatCurrency(split.amount, expense.currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(expense.amount, expense.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-gray-400 hover:text-luxury-purple hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Edit expense"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;