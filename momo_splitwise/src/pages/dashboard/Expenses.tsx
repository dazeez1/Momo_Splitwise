import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, CreditCard, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import { formatCurrency, formatDate } from '../../utils/calculations';

const Expenses: React.FC = () => {
  const { expenses, groups, users } = useApp();
  const { user } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const userGroups = groups.filter(group => 
    group.members.includes(user?.id || '')
  );

  const userExpenses = expenses.filter(expense => 
    expense.splits.some(split => split.userId === user?.id) ||
    expense.paidBy === user?.id
  );

  const filteredExpenses = userExpenses.filter(expense => {
    const matchesGroup = selectedGroup === 'all' || expense.groupId === selectedGroup;
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || 'Unknown Group';
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const toggleDropdown = (expenseId: string) => {
    setActiveDropdown(activeDropdown === expenseId ? null : expenseId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all your shared expenses
          </p>
        </div>
        <button
          onClick={() => setIsExpenseFormOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-luxury-purple to-luxury-pink text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Expenses
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-purple focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-purple focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Groups</option>
              {userGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-luxury-purple shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-luxury-purple shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredExpenses.length} of {userExpenses.length} expenses
          </p>
        </div>
      </div>

      {/* Expenses Grid/List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {userExpenses.length === 0 ? 'No expenses yet' : 'No expenses found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {userExpenses.length === 0 
              ? 'Get started by adding your first shared expense'
              : 'Try adjusting your filters to find what you\'re looking for'
            }
          </p>
          <button
            onClick={() => setIsExpenseFormOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-luxury-purple to-luxury-pink text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Expense</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((expense) => {
            const userSplit = expense.splits.find(split => split.userId === user?.id);
            const paidByUser = users.find(u => u.id === expense.paidBy);
            const isUserPayer = expense.paidBy === user?.id;
            
            return (
              <div
                key={expense.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {expense.description}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full capitalize">
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {getGroupName(expense.groupId)} • {formatDate(expense.createdAt)}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(expense.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {activeDropdown === expense.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Edit className="h-4 w-4" />
                            <span>Edit Expense</span>
                          </button>
                          <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Expense</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Paid by</span>
                      <span className="text-sm font-medium text-gray-900">
                        {paidByUser?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Split Type</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {expense.splitType}
                      </span>
                    </div>

                    {userSplit && (
                      <div className={`p-3 rounded-lg ${
                        isUserPayer ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          isUserPayer ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isUserPayer
                            ? `You paid ${formatCurrency(expense.amount - userSplit.amount)} more than your share`
                            : `You owe ${formatCurrency(userSplit.amount)}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => {
                const userSplit = expense.splits.find(split => split.userId === user?.id);
                const paidByUser = users.find(u => u.id === expense.paidBy);
                const isUserPayer = expense.paidBy === user?.id;

                return (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-luxury-purple to-luxury-pink rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {expense.category} • {expense.splitType} split
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getGroupName(expense.groupId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      {userSplit && (
                        <div className={`text-xs ${
                          isUserPayer ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isUserPayer ? 'You paid more' : 'You owe'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paidByUser?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-luxury-purple hover:text-luxury-pink transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        groupId={selectedGroup !== 'all' ? selectedGroup : userGroups[0]?.id || ''}
        users={users.filter(u => {
          if (selectedGroup !== 'all') {
            const group = groups.find(g => g.id === selectedGroup);
            return group?.members.includes(u.id);
          }
          return true;
        })}
      />
    </div>
  );
};

export default Expenses;