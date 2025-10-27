import React, { useState } from 'react';
import { Scale, ArrowRight, User, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/calculations';

const Balances: React.FC = () => {
  const { user } = useAuth();
  const { groups, users, simplifyDebts } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const userGroups = groups.filter(group => 
    group.members.includes(user?.id || '')
  );

  // Calculate debts for selected group or all groups
  const debts = selectedGroup === 'all' 
    ? userGroups.flatMap(group => simplifyDebts(group.id).map((debt: any) => ({ 
        ...debt, 
        groupId: group.id, 
        groupName: group.name 
      })))
    : simplifyDebts(selectedGroup).map((debt: any) => ({ 
        ...debt, 
        groupId: selectedGroup, 
        groupName: userGroups.find(g => g.id === selectedGroup)?.name 
      }));

  // Filter debts that involve the current user
  const userDebts = debts.filter(debt => 
    debt.from === user?.id || debt.to === user?.id
  );

  // People you owe
  const youOwe = userDebts.filter(debt => debt.from === user?.id);

  // People who owe you
  const oweYou = userDebts.filter(debt => debt.to === user?.id);

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">Balances</h1>
          <p className="text-gray-600 mt-2">
            Track who owes whom and simplify group debts
          </p>
        </div>
      </div>

      {/* Group Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Scale className="h-6 w-6 text-luxury-purple" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Simplify Debts</h3>
            <p className="text-gray-600 text-sm">
              Minimize the number of transactions needed to settle all debts
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-purple focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Groups</option>
            {userGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* You Owe Section */}
      {youOwe.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-red-600">You Owe</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {youOwe.map((debt, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getUserName(debt.to)}</p>
                    <p className="text-sm text-gray-500">{debt.groupName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(debt.amount, debt.currency)}
                    </p>
                    <p className="text-sm text-gray-500">Total owed</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owe You Section */}
      {oweYou.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-green-600">Owe You</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {oweYou.map((debt, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getUserName(debt.from)}</p>
                    <p className="text-sm text-gray-500">{debt.groupName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(debt.amount, debt.currency)}
                    </p>
                    <p className="text-sm text-gray-500">Total to receive</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 transform rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Debts State */}
      {youOwe.length === 0 && oweYou.length === 0 && (
        <div className="text-center py-12">
          <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up!</h3>
          <p className="text-gray-500">You don't owe anyone and no one owes you.</p>
        </div>
      )}

      {/* Simplified Transactions */}
      {debts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Simplified Transactions ({debts.length})
          </h3>
          <div className="space-y-3">
            {debts.map((debt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 text-luxury-purple rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {getUserName(debt.from)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">
                    {formatCurrency(debt.amount, debt.currency)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">
                    {getUserName(debt.to)}
                  </span>
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </div>

                {debt.groupName && debt.groupName !== 'all' && (
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {debt.groupName}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Balances;