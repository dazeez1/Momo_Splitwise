import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/calculations';

interface ExpenseReportsProps {
  groupId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ExpenseReports: React.FC<ExpenseReportsProps> = ({ groupId }) => {
  const { getExpenseReport, users, getGroupExpenses } = useApp();
  const { user } = useAuth();

  const report = getExpenseReport(groupId);
  const groupExpenses = getGroupExpenses(groupId);

  const categoryData = Object.entries(report.categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: parseFloat(value.toFixed(2))
  }));

  const memberData = Object.entries(report.memberContributions).map(([userId, amount]) => {
    const member = users.find(u => u.id === userId);
    return {
      name: member?.name || 'Unknown',
      amount: parseFloat(amount.toFixed(2)),
      isCurrentUser: userId === user?.id
    };
  }).sort((a, b) => b.amount - a.amount);

  const recentExpenses = groupExpenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(report.totalExpenses)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{report.expenseCount} expenses</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
          <p className="text-3xl font-bold text-green-600">
            {Object.keys(report.categoryBreakdown).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Spending categories</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Members</h3>
          <p className="text-3xl font-bold text-blue-600">
            {memberData.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Group members</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Contributions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Contributions</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                <Legend />
                <Bar dataKey="amount" name="Amount Paid" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {recentExpenses.map((expense) => {
            const paidByUser = users.find(u => u.id === expense.paidBy);
            return (
              <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{expense.description}</span>
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full capitalize">
                      {expense.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Paid by {paidByUser?.name} • {new Date(expense.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
                  <div className="text-sm text-gray-500 capitalize">{expense.splitType} split</div>
                </div>
              </div>
            );
          })}
          {recentExpenses.length === 0 && (
            <p className="text-gray-500 text-center py-4">No expenses yet</p>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const dataStr = JSON.stringify({
              summary: report,
              categories: categoryData,
              members: memberData,
              recentExpenses
            }, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-report-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Export Report
        </button>
      </div>
    </div>
  );
};

export default ExpenseReports;