import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/calculations';

const Reports: React.FC = () => {
  const { groups, expenses, getExpenseReport } = useApp();
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const userGroups = groups.filter(group => 
    group.members.includes(user?.id || '')
  );

  const filteredExpenses = expenses.filter(expense => {
    const matchesGroup = selectedGroup === 'all' || expense.groupId === selectedGroup;
    return matchesGroup;
  });

  const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthlyBreakdown = filteredExpenses.reduce((acc, expense) => {
    const month = new Date(expense.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Paid By', 'Group'];
    const csvData = filteredExpenses.map(expense => [
      new Date(expense.createdAt).toLocaleDateString(),
      expense.description,
      expense.amount,
      expense.category,
      expense.paidBy,
      groups.find(g => g.id === expense.groupId)?.name || 'Unknown'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `momo-splitwise-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Analyze your expense patterns and trends
          </p>
        </div>
        
        <button
          onClick={exportToCSV}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-700 to-yellow-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Download className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-purple focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Groups</option>
                           {userGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-purple focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              {filteredExpenses.length} expenses found
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br fromyellow-700e toyellow-600k text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(
                  filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
                  filteredExpenses[0]?.currency || 'KES'
                )}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(
                  filteredExpenses.length > 0 
                    ? filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length
                    : 0,
                  filteredExpenses[0]?.currency || 'KES'
                )}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-luxury-purple" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Object.keys(categoryBreakdown).length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-luxury-purple" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h3>
          <div className="space-y-4">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                    <span className="text-gray-900">
                      {formatCurrency(amount, filteredExpenses[0]?.currency || 'KES')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-yellow-700 to-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / Math.max(...Object.values(categoryBreakdown))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Spending
          </h3>
          <div className="space-y-4">
            {Object.entries(monthlyBreakdown)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, amount]) => (
                <div key={month} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{month}</span>
                    <span className="text-gray-900">
                      {formatCurrency(amount, filteredExpenses[0]?.currency || 'KES')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-yellow-700 to-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / Math.max(...Object.values(monthlyBreakdown))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Expenses
        </h3>
        <div className="space-y-4">
          {filteredExpenses
            .slice(0, 10)
            .map(expense => {
              const group = groups.find(g => g.id === expense.groupId);
              return (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      expense.category === 'food' ? 'bg-green-500' :
                      expense.category === 'transport' ? 'bg-blue-500' :
                      expense.category === 'utilities' ? 'bg-yellow-500' :
                      expense.category === 'entertainment' ? 'bg-purple-500' :
                      expense.category === 'shopping' ? 'bg-pink-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {group?.name} • {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Reports;