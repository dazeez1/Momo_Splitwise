import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  Activity
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import GroupCard from '../components/group/GroupCard';
import { formatCurrency } from '../utils/calculations';

const Dashboard: React.FC = () => {
  const { groups, expenses, simplifyDebts } = useApp();
  const { user } = useAuth();

  const userGroups = groups.filter(group => 
    group.members.includes(user?.id || '')
  );

  const userExpenses = expenses.filter(expense => 
    expense.splits.some(split => split.userId === user?.id) ||
    expense.paidBy === user?.id
  );

  const totalSpent = userExpenses.reduce((sum, expense) => {
    if (expense.paidBy === user?.id) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const totalOwed = userExpenses.reduce((sum, expense) => {
    const userSplit = expense.splits.find(split => split.userId === user?.id);
    return sum + (userSplit?.amount || 0);
  }, 0);

  const netBalance = totalSpent - totalOwed;

  const totalDebts = userGroups.reduce((sum, group) => {
    const debts = simplifyDebts(group.id);
    const userDebts = debts.filter(debt => debt.from === user?.id);
    return sum + userDebts.reduce((debtSum, debt) => debtSum + debt.amount, 0);
  }, 0);

  const stats = [
    {
      title: 'Total Groups',
      value: userGroups.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'You Are Owed',
      value: formatCurrency(netBalance > 0 ? netBalance : 0),
      icon: ArrowDownLeft,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'You Owe',
      value: formatCurrency(totalDebts),
      icon: ArrowUpRight,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your expenses and groups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
              <Link
                to="/groups"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                <span>View All</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {userGroups.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
                <p className="text-gray-500 mb-4">Create your first group to start splitting expenses</p>
                <Link
                  to="/groups"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Group</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userGroups.slice(0, 4).map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              <Link
                to="/groups/new"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create New Group</p>
                  <p className="text-sm text-gray-500">Start splitting expenses with friends</p>
                </div>
              </Link>

              <Link
                to="/expenses"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Expense</p>
                  <p className="text-sm text-gray-500">Record a new shared expense</p>
                </div>
              </Link>

              <Link
                to="/groups"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Balances</p>
                  <p className="text-sm text-gray-500">Check who owes what</p>
                </div>
              </Link>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                {userExpenses.slice(0, 3).map(expense => (
                  <div key={expense.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{expense.description}</p>
                      <p className="text-xs text-gray-500">
                        {expense.paidBy === user?.id ? 'You paid' : 'You owe'} • {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${
                      expense.paidBy === user?.id ? 'text-green-600' : 'text-rose-600'
                    }`}>
                      {expense.paidBy === user?.id ? '+' : '-'}{formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
                {userExpenses.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;