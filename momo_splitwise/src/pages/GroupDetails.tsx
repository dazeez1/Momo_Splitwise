import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  CreditCard, 
  Calculator,
  Send,
  User,
  BarChart3
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseReports from '../components/reports/ExpenseReports';
import { formatCurrency, formatDate } from '../utils/calculations';
import { generateMomoPaymentLink, simulateMomoPayment } from '../utils/momoPayment';

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, users, simplifyDebts, getGroupExpenses } = useApp();
  const { user } = useAuth();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [sendingPayment, setSendingPayment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'balances' | 'expenses' | 'reports'>('balances');

  const group = groups.find(g => g.id === groupId);
  const groupExpenses = group ? getGroupExpenses(group.id) : [];
  const groupUsers = users.filter(u => group?.members.includes(u.id));
  const debts = group ? simplifyDebts(group.id) : [];

  const handleSendPayment = async (debt: { from: string; to: string; amount: number }) => {
    if (debt.from !== user?.id) return;

    setSendingPayment(debt.to);
    
    const recipient = users.find(u => u.id === debt.to);
    if (!recipient) return;

    try {
      const paymentLink = generateMomoPaymentLink(recipient.phoneNumber, debt.amount, `Payment for ${group?.name}`);
      
      // Simulate opening mobile money app
      alert(`Opening mobile money app with payment link:\n${paymentLink}\n\nIn a real app, this would redirect to your mobile money app.`);
      
      // Simulate payment processing
      const success = await simulateMomoPayment();
      
      if (success) {
        alert(`Payment of ${formatCurrency(debt.amount)} sent successfully to ${recipient.name}!`);
        // In a real app, you would update the backend here
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setSendingPayment(null);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
          <Link to="/groups" className="text-primary-600 hover:text-primary-700">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'balances':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calculator className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Balances</h2>
            </div>

            {debts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up! 🎉</h3>
                <p className="text-gray-500">No outstanding balances in this group</p>
              </div>
            ) : (
              <div className="space-y-4">
                {debts.map((debt, index) => {
                  const fromUser = users.find(u => u.id === debt.from);
                  const toUser = users.find(u => u.id === debt.to);
                  const isUserInvolved = debt.from === user?.id || debt.to === user?.id;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isUserInvolved
                          ? debt.from === user?.id
                            ? 'border-rose-200 bg-rose-50'
                            : 'border-emerald-200 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{fromUser?.name}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{toUser?.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg font-bold ${
                          debt.from === user?.id ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {formatCurrency(debt.amount)}
                        </span>
                        
                        {debt.from === user?.id && (
                          <button
                            onClick={() => handleSendPayment(debt)}
                            disabled={sendingPayment === debt.to}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            <span>{sendingPayment === debt.to ? 'Sending...' : 'Pay via MoMo'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'expenses':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
            </div>

            {groupExpenses.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                <p className="text-gray-500 mb-4">Add your first expense to get started</p>
                <button
                  onClick={() => setIsExpenseFormOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Expense</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupExpenses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(expense => {
                    const paidByUser = users.find(u => u.id === expense.paidBy);
                    const userSplit = expense.splits.find(split => split.userId === user?.id);
                    
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{expense.description}</h3>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Paid by {paidByUser?.name}</span>
                            <span>•</span>
                            <span>{formatDate(expense.createdAt)}</span>
                            <span>•</span>
                            <span className="capitalize">{expense.category}</span>
                            <span>•</span>
                            <span className="capitalize">{expense.splitType} split</span>
                          </div>
                          {userSplit && (
                            <div className="mt-2">
                              <span className={`text-sm font-medium ${
                                expense.paidBy === user?.id
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}>
                                {expense.paidBy === user?.id 
                                  ? `You paid ${formatCurrency(expense.amount - userSplit.amount)} more than your share`
                                  : `You owe ${formatCurrency(userSplit.amount)}`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );

      case 'reports':
        return <ExpenseReports groupId={group.id} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/groups"
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Groups</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-600">{group.description}</p>
            </div>
            <button
              onClick={() => setIsExpenseFormOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'balances', name: 'Balances', icon: Calculator },
                { id: 'expenses', name: 'Expenses', icon: CreditCard },
                { id: 'reports', name: 'Reports', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
              </div>
              <div className="space-y-3">
                {groupUsers.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.phoneNumber}</p>
                    </div>
                    {member.id === user?.id && (
                      <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium text-gray-900">{group.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-gray-900">{formatDate(group.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Expenses:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(groupExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expense Count:</span>
                  <span className="font-medium text-gray-900">{groupExpenses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Members:</span>
                  <span className="font-medium text-gray-900">{groupUsers.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Form Modal */}
        <ExpenseForm
          isOpen={isExpenseFormOpen}
          onClose={() => setIsExpenseFormOpen(false)}
          groupId={group.id}
          users={groupUsers}
        />
      </div>
    </div>
  );
};

export default GroupDetails;