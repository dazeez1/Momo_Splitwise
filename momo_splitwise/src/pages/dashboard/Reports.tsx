import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Filter,
  Calendar,
  TrendingUp,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/calculations";
import { useToast } from "../../contexts/ToastContext";

const Reports: React.FC = () => {
  const { groups, expenses, getExpenseReport } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
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
    if (!reportData || reportData.expenses.length === 0) {
      showToast("No data to export", "info");
      return;
    }

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
    showToast("Report exported to CSV successfully", "success");
  };

  const exportToPDF = () => {
    if (!reportData || reportData.expenses.length === 0) {
      showToast("No data to export", "info");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Momo Splitwise Report", 14, 22);

    // Report Info
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Expenses: ${reportData.totalExpenses}`, 14, 38);
    doc.text(
      `Total Amount: ${formatCurrency(reportData.totalAmount, "RWF")}`,
      14,
      44
    );

    // Summary data
    const summaryData = [
      ["Total Spent", formatCurrency(reportData.totalAmount, "RWF")],
      ["Average Expense", formatCurrency(reportData.averageExpense, "RWF")],
      [
        "Number of Categories",
        Object.keys(reportData.categoryBreakdown).length.toString(),
      ],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "striped",
    });

    // Expense data
    const expenseData = reportData.expenses.map((expense: any) => [
      new Date(expense.createdAt).toLocaleDateString(),
      expense.description,
      formatCurrency(expense.amount, expense.currency),
      expense.category,
      groups.find((g) => g.id === expense.groupId)?.name || "Unknown",
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Date", "Description", "Amount", "Category", "Group"]],
      body: expenseData,
      theme: "grid",
    });

    doc.save(
      `momo-splitwise-report-${new Date().toISOString().split("T")[0]}.pdf`
    );
    showToast("Report exported to PDF successfully", "success");
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

        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-yellow-600 text-yellow-600 font-semibold rounded-lg hover:bg-yellow-50 transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <FileText className="h-5 w-5" />
            <span>Export PDF</span>
          </button>
        </div>
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
        {/* Category Breakdown - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-yellow-600" />
            Expenses by Category
          </h3>
          {Object.keys(reportData.categoryBreakdown).length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(reportData.categoryBreakdown)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([category, amount]) => ({
                        name: getCategoryName(category),
                        value: amount as number,
                        color: getCategoryColor(category).replace("bg-", ""),
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(reportData.categoryBreakdown).map(
                      ([category], index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            getCategoryColor(category).includes("green")
                              ? "#10b981"
                              : getCategoryColor(category).includes("blue")
                              ? "#3b82f6"
                              : getCategoryColor(category).includes("yellow")
                              ? "#eab308"
                              : getCategoryColor(category).includes("purple")
                              ? "#a855f7"
                              : getCategoryColor(category).includes("pink")
                              ? "#ec4899"
                              : "#6b7280"
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value, "RWF")}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {Object.entries(reportData.categoryBreakdown)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([category, amount]) => {
                    const percentage =
                      ((amount as number) / reportData.totalAmount) * 100;
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getCategoryColor(
                              category
                            )}`}
                          />
                          <span className="text-gray-700">
                            {getCategoryName(category)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(amount as number, "RWF")} (
                          {percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No category data
            </div>
          )}
        </div>

        {/* Monthly Breakdown - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-yellow-600" />
            Monthly Spending
          </h3>
          {Object.keys(reportData.monthlyBreakdown).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(reportData.monthlyBreakdown)
                  .sort(
                    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
                  )
                  .map(([month, amount]) => ({
                    month,
                    amount: amount as number,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value, "RWF")}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar
                  dataKey="amount"
                  fill="#eab308"
                  name="Spending"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No monthly data
            </div>
          )}
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
