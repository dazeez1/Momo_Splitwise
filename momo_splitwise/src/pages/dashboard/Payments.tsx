import React, { useState, useEffect } from 'react';
import { Send, Download, Phone, Wallet, CheckCircle, Clock, AlertCircle, Filter, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/calculations';

interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  groupId: string;
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const { groups, expenses, users, calculateBalances } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'history'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSendingPayment, setIsSendingPayment] = useState(false);

  // Calculate balances for the selected group
  const balances = selectedGroup === 'all' 
    ? groups.flatMap(group => calculateBalances(group.id))
    : calculateBalances(selectedGroup);

  // Filter balances to show only what the current user owes or is owed
  const userBalances = balances.filter(balance => 
    balance.userId === user?.id && Math.abs(balance.balance) > 0.01
  );

  // People who owe the current user
  const peopleOweYou = balances.filter(balance => 
    balance.balance < -0.01 && balance.userId !== user?.id
  ).map(balance => {
    const debtor = users.find(u => u.id === balance.userId);
    const group = groups.find(g => g.id === balance.groupId);
    return {
      user: debtor,
      amount: Math.abs(balance.balance),
      currency: balance.currency,
      group: group?.name
    };
  });

  // People the current user owes
  const youOwePeople = balances.filter(balance => 
    balance.balance > 0.01 && balance.userId !== user?.id
  ).map(balance => {
    const creditor = users.find(u => u.id === balance.userId);
    const group = groups.find(g => g.id === balance.groupId);
    return {
      user: creditor,
      amount: balance.balance,
      currency: balance.currency,
      group: group?.name
    };
  });

  // Mock payment requests (in a real app, this would come from an API)
  useEffect(() => {
    const mockRequests: PaymentRequest[] = [
      {
        id: '1',
        fromUserId: 'user2',
        toUserId: user?.id || '',
        amount: 2500,
        currency: 'KES',
        description: 'Dinner at Carnivore',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        groupId: 'group1'
      },
      {
        id: '2',
        fromUserId: user?.id || '',
        toUserId: 'user3',
        amount: 1500,
        currency: 'KES',
        description: 'Uber rides',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        groupId: 'group2'
      }
    ];
    setPaymentRequests(mockRequests);
  }, [user]);

  const handleSendPayment = async (toUserId: string, amount: number, description: string) => {
    setIsSendingPayment(true);
    try {
      // Simulate API call to mobile money service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would integrate with M-Pesa, Airtel Money, etc.
      console.log('Sending payment:', { toUserId, amount, description });
      
      // Add to payment history
      const newPayment: PaymentRequest = {
        id: Date.now().toString(),
        fromUserId: user?.id || '',
        toUserId,
        amount,
        currency: 'KES',
        description,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        groupId: 'direct'
      };
      
      setPaymentRequests(prev => [newPayment, ...prev]);
      
      // Show success message
      alert('Payment sent successfully!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsSendingPayment(false);
    }
  };

  const handleRequestPayment = (fromUserId: string, amount: number, description: string) => {
    const newRequest: PaymentRequest = {
      id: Date.now().toString(),
      fromUserId,
      toUserId: user?.id || '',
      amount,
      currency: 'KES',
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      groupId: 'direct'
    };
    
    setPaymentRequests(prev => [newRequest, ...prev]);
    alert('Payment request sent!');
  };

  const getStatusIcon = (status: PaymentRequest['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: PaymentRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const filteredPaymentRequests = paymentRequests.filter(request =>
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    users.find(u => u.id === (request.fromUserId === user?.id ? request.toUserId : request.fromUserId))?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">
            Send and receive payments with mobile money integration
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveTab('send')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-700 to-yellow-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Send className="h-5 w-5" />
            <span>Send Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', count: youOwePeople.length + peopleOweYou.length },
              { id: 'send', name: 'Send & Request' },
              { id: 'history', name: 'History', count: filteredPaymentRequests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-yellow-700 text-yellow-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-yellow-700 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">You Owe</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(
                          youOwePeople.reduce((sum, item) => sum + item.amount, 0),
                          'KES'
                        )}
                      </p>
                      <p className="text-red-200 text-sm mt-1">
                        {youOwePeople.length} people
                      </p>
                    </div>
                    <Download className="h-8 w-8 text-red-200" />
                  </div>
                </div>

                <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">You Are Owed</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(
                          peopleOweYou.reduce((sum, item) => sum + item.amount, 0),
                          'KES'
                        )}
                      </p>
                      <p className="text-green-200 text-sm mt-1">
                        {peopleOweYou.length} people
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Net Balance</p>
                      <p className={`text-2xl font-bold mt-1 ${
                        youOwePeople.reduce((sum, item) => sum + item.amount, 0) - 
                        peopleOweYou.reduce((sum, item) => sum + item.amount, 0) > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {formatCurrency(
                          youOwePeople.reduce((sum, item) => sum + item.amount, 0) - 
                          peopleOweYou.reduce((sum, item) => sum + item.amount, 0),
                          'KES'
                        )}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-yellow-700" />
                  </div>
                </div>
              </div>

              {/* You Owe Section */}
              {youOwePeople.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">You Owe</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {youOwePeople.map((item, index) => (
                      <div key={index} className="p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full">
                            <Wallet className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.user?.name}</p>
                            <p className="text-sm text-gray-500">{item.group}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(item.amount, item.currency)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleSendPayment(item.user?.id || '', item.amount, `Settle up with ${item.user?.name}`)}
                              className="px-4 py-2 bg-linear-to-r from-yellow-700 to-yellow-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                            >
                              Pay Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* You Are Owed Section */}
              {peopleOweYou.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">You Are Owed</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {peopleOweYou.map((item, index) => (
                      <div key={index} className="p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full">
                            <Wallet className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.user?.name}</p>
                            <p className="text-sm text-gray-500">{item.group}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(item.amount, item.currency)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleRequestPayment(item.user?.id || '', item.amount, `Request payment from ${item.user?.name}`)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                            >
                              Request
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {youOwePeople.length === 0 && peopleOweYou.length === 0 && (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up!</h3>
                  <p className="text-gray-500">You don't owe anyone and no one owes you.</p>
                </div>
              )}
            </div>
          )}

          {/* Send & Request Tab */}
          {activeTab === 'send' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Send Payment */}
              <div className="bg-linear-to-br from-yellow-700 to-yellow-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Send Payment</h3>
                <p className="text-purple-100 mb-6">
                  Send money directly to friends via mobile money
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-100 text-sm font-medium mb-2">
                      Recipient
                    </label>
                    <select className="w-full px-3 py-2 bg-white bg-opacity-20 border border-purple-300 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent">
                      <option value="">Select a friend</option>
                      {users.filter(u => u.id !== user?.id).map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-purple-100 text-sm font-medium mb-2">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white bg-opacity-20 border border-purple-300 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-purple-100 text-sm font-medium mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white bg-opacity-20 border border-purple-300 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="What's this for?"
                    />
                  </div>
                  
                  <button
                    disabled={isSendingPayment}
                    className="w-full bg-white text-yellow-700 py-3 px-4 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSendingPayment ? 'Sending...' : 'Send via Mobile Money'}
                  </button>
                </div>
              </div>

              {/* Request Payment */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Request Payment</h3>
                <p className="text-gray-600 mb-6">
                  Send a payment request to someone who owes you
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      From
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent">
                      <option value="">Select who owes you</option>
                      {peopleOweYou.map((item, index) => (
                        <option key={index} value={item.user?.id}>
                          {item.user?.name} - {formatCurrency(item.amount, item.currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent"
                      placeholder="What's this for?"
                    />
                  </div>
                  
                  <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200">
                    Send Request
                  </button>
                </div>
              </div>

              {/* Mobile Money Providers */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Supported Mobile Money Providers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'M-Pesa', color: 'bg-green-500' },
                    { name: 'Airtel Money', color: 'bg-red-500' },
                    { name: 'T-Kash', color: 'bg-purple-500' },
                    { name: 'MTN Mobile Money', color: 'bg-yellow-500' }
                  ].map((provider, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
                      <span className="font-medium text-gray-900">{provider.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                {filteredPaymentRequests.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredPaymentRequests.map((request) => {
                      const isOutgoing = request.fromUserId === user?.id;
                      const otherUser = users.find(u => 
                        u.id === (isOutgoing ? request.toUserId : request.fromUserId)
                      );

                      return (
                        <div key={request.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {getStatusIcon(request.status)}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {isOutgoing ? 'Sent to' : 'Received from'} {otherUser?.name}
                                </p>
                                <p className="text-sm text-gray-500">{request.description}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                isOutgoing ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {isOutgoing ? '-' : '+'}{formatCurrency(request.amount, request.currency)}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                    <p className="text-gray-500">Your payment transactions will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;