import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  BarChart3,
  Smartphone,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/calculations";

const Dashboard: React.FC = () => {
  const { groups, expenses, simplifyDebts } = useApp();
  const { user } = useAuth();

  const userGroups = groups.filter((group) =>
    group.members.includes(user?.id || "")
  );

  const userExpenses = expenses.filter(
    (expense) =>
      expense.splits.some((split) => split.userId === user?.id) ||
      expense.paidBy === user?.id
  );

  const totalSpent = userExpenses.reduce((sum, expense) => {
    if (expense.paidBy === user?.id) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const totalOwed = userExpenses.reduce((sum, expense) => {
    const userSplit = expense.splits.find((split) => split.userId === user?.id);
    return sum + (userSplit?.amount || 0);
  }, 0);

  const netBalance = totalSpent - totalOwed;

  const totalDebts = userGroups.reduce((sum, group) => {
    const debts = simplifyDebts(group.id);
    const userDebts = debts.filter((debt) => debt.from === user?.id);
    return sum + userDebts.reduce((debtSum, debt) => debtSum + debt.amount, 0);
  }, 0);

  const stats = [
    {
      title: "Total Groups",
      value: userGroups.length.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+2 this month",
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+15% from last month",
    },
    {
      title: "You Are Owed",
      value: formatCurrency(netBalance > 0 ? netBalance : 0),
      icon: ArrowDownLeft,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "Pending settlements",
    },
    {
      title: "You Owe",
      value: formatCurrency(totalDebts),
      icon: ArrowUpRight,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      change: "To be paid",
    },
  ];

  const quickActions = [
    {
      title: "Create Group",
      description: "Start a new expense group",
      icon: Users,
      href: "/dashboard/groups/new",
      color: "from-yellow-700 to-pink-700",
    },
    {
      title: "Add Expense",
      description: "Record a shared expense",
      icon: CreditCard,
      href: "/dashboard/expenses/new",
      color: "from-gold to-teal",
    },
    {
      title: "View Balances",
      description: "Check who owes what",
      icon: BarChart3,
      href: "/dashboard/balances",
      color: "from-teal to-navy",
    },
    {
      title: "Make Payment",
      description: "Settle up with friends",
      icon: Smartphone,
      href: "/dashboard/payments",
      color: "from-navy to-yellow",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-br   from-yellow-700 to-pink-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-luxury font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-yellow-100 text-lg">
              Here's what's happening with your expenses and groups today.
            </p>
          </div>
          <Link
            to="/dashboard/groups/new"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-white text-yellow-700 font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>New Group</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-luxury font-bold text-gray-900">
              Quick Actions
            </h2>
            <Link
              to="/dashboard/groups"
              className="inline-flex items-center space-x-2 text-yellow-700 hover:text-luxury-pink font-medium text-sm"
            >
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div
                  className={`w-12 h-12 bg-linear-to-br  ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-luxury font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              {userExpenses.slice(0, 5).map((expense) => {
                const isPayer = expense.paidBy === user?.id;
                const userSplit = expense.splits.find(
                  (split) => split.userId === user?.id
                );

                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPayer
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {expense.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isPayer ? "You paid" : "You owe"} •{" "}
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        isPayer ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isPayer ? "+" : "-"}
                      {formatCurrency(userSplit?.amount || expense.amount)}
                    </div>
                  </div>
                );
              })}
              {userExpenses.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start by creating a group or adding an expense
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Groups */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-luxury font-bold text-gray-900">
            Your Groups
          </h2>
          <Link
            to="/dashboard/groups"
            className="inline-flex items-center space-x-2 text-yellow-700 hover:text-luxury-pink font-medium text-sm"
          >
            <span>View All Groups</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {userGroups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No groups yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first group to start splitting expenses
            </p>
            <Link
              to="/dashboard/groups/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-br  from-yellow-700 to-pink-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Group</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.slice(0, 3).map((group) => (
              <Link
                key={group.id}
                to={`/dashboard/groups/${group.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`h-3 ${group.color} rounded-t-2xl`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {group.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{group.members.length} members</span>
                    <span>{group.currency}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
