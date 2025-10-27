import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/calculations";

const Reports: React.FC = () => {
  const { groups, expenses, getExpenseReport } = useApp();
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [reportData, setReportData] = useState<any>(null);

  const userGroups = groups.filter((group) =>
    group.members.includes(user?.id || "")
  );

  useEffect(() => {
    let filteredExpenses = expenses.filter((expense) => {
      const matchesGroup =
        selectedGroup === "all" || expense.groupId === selectedGroup;
      return matchesGroup;
    });

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "30":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90":
          startDate.setDate(now.getDate() - 90);
          break;
        case "365":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredExpenses = filteredExpenses.filter(
        (expense) => new Date(expense.createdAt) >= startDate
      );
    }

    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyBreakdown = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const averageExpense =
      filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

    setReportData({
      totalExpenses: filteredExpenses.length,
      totalAmount,
      averageExpense,
      categoryBreakdown,
      monthlyBreakdown,
      expenses: filteredExpenses,
    });
  }, [expenses, selectedGroup, dateRange]);

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = [
      "Date",
      "Description",
      "Amount",
      "Category",
      "Paid By",
      "Group",
    ];
    const csvData = reportData.expenses.map((expense: any) => [
      new Date(expense.createdAt).toLocaleDateString(),
      expense.description,
      expense.amount,
      expense.category,
      expense.paidBy,
      groups.find((g) => g.id === expense.groupId)?.name || "Unknown",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row: any) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `momo-splitwise-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "bg-green-500",
      transport: "bg-blue-500",
      utilities: "bg-yellow-500",
      entertainment: "bg-purple-500",
      shopping: "bg-pink-500",
      other: "bg-gray-500",
    };
    return colors[category] || colors.other;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      food: "Food & Dining",
      transport: "Transport",
      utilities: "Utilities",
      entertainment: "Entertainment",
      shopping: "Shopping",
      other: "Other",
    };
    return names[category] || category;
  };

  if (!reportData) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">
            Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Analyze your expense patterns and trends
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Groups</option>
              {userGroups.map((group) => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              {reportData.totalExpenses} expenses found •{" "}
              {formatCurrency(reportData.totalAmount, "RWF")} total
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-yellow-600 to-yellow-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(reportData.totalAmount, "RWF")}
              </p>
              <p className="text-yellow-200 text-sm mt-1">
                {reportData.totalExpenses} expenses
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(reportData.averageExpense, "RWF")}
              </p>
              <p className="text-gray-500 text-sm mt-1">per expense</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Object.keys(reportData.categoryBreakdown).length}
              </p>
              <p className="text-gray-500 text-sm mt-1">different categories</p>
            </div>
            <PieChart className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-yellow-600" />
            Expenses by Category
          </h3>
          <div className="space-y-4">
            {Object.entries(reportData.categoryBreakdown)
              .sort(([, a], [, b]) => (b as number) - (a as number)) // Added type assertions
              .map(([category, amount]) => {
                const percentage =
                  ((amount as number) / reportData.totalAmount) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {getCategoryName(category)}
                      </span>
                      <div className="text-right">
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(amount as number, "RWF")}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getCategoryColor(
                          category
                        )}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-yellow-600" />
            Monthly Spending
          </h3>
          <div className="space-y-4">
            {Object.entries(reportData.monthlyBreakdown)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([month, amount]) => {
                const percentage =
                  ((amount as number) /
                    Math.max(
                      ...(Object.values(
                        reportData.monthlyBreakdown
                      ) as number[])
                    )) *
                  100;
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{month}</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(amount as number, "RWF")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-linear-to-r from-yellow-600 to-yellow-700 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Expenses
        </h3>
        <div className="space-y-4">
          {reportData.expenses.slice(0, 10).map((expense: any) => {
            const group = groups.find((g) => g.id === expense.groupId);
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${getCategoryColor(
                      expense.category
                    )}`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {expense.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {group?.name} •{" "}
                      {new Date(expense.createdAt).toLocaleDateString()} •
                      <span className="capitalize"> {expense.category}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {expense.splitType} split
                  </p>
                </div>
              </div>
            );
          })}
          {reportData.expenses.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No expenses found for the selected filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;