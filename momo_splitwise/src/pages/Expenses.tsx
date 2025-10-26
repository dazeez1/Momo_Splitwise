import { useState } from 'react';
import { Plus, Search, CreditCard } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { formatCurrency, formatDate } from '../utils/calculations';

const Expenses: React.FC = () => {
  const { expenses, groups, users } = useApp();
  const { user } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Expenses</h1>
            <p className="text-gray-600">
              Track and manage all your shared expenses
            </p>
          </div>
          <button
            onClick={() => setIsExpenseFormOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Groups</option>
                {userGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                Showing {filteredExpenses.length} of {userExpenses.length} expenses
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
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
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Expense</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map(expense => {
                const userSplit = expense.splits.find(split => split.userId === user?.id);
                const paidByUser = users.find(u => u.id === expense.paidBy);
                const isUserPayer = expense.paidBy === user?.id;
                
                return (
                  <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {expense.description}
                          </h3>
                          <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full capitalize">
                            {expense.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>Paid by {paidByUser?.name}</span>
                          <span>•</span>
                          <span>{getGroupName(expense.groupId)}</span>
                          <span>•</span>
                          <span>{formatDate(expense.createdAt)}</span>
                        </div>

                        {userSplit && (
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`font-medium ${
                              isUserPayer 
                                ? 'text-emerald-600' 
                                : 'text-rose-600'
                            }`}>
                              {isUserPayer
                                ? `You paid ${formatCurrency(expense.amount - userSplit.amount)} more than your share`
                                : `You owe ${formatCurrency(userSplit.amount)}`
                              }
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              Total: {formatCurrency(expense.amount)}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 capitalize">
                              Split: {expense.splitType}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatCurrency(expense.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expense.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
    </div>
  );
};

export default Expenses;