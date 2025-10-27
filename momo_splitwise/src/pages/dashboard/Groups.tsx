import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Grid, List, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import EditGroupModal from '../../components/groups/EditGroupModal';
import { formatCurrency } from '../../utils/calculations';
import type { Group } from '../../types';

const Groups: React.FC = () => {
  const { groups, users, deleteGroup, getGroupExpenses } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const userGroups = groups.filter(group => 
    group.members.includes(user?.id || '')
  );

  const filteredGroups = userGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberNames = (memberIds: string[]) => {
    return memberIds
      .map(id => users.find(u => u.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const toggleDropdown = (groupId: string) => {
    setActiveDropdown(activeDropdown === groupId ? null : groupId);
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = (groupId: string) => {
    deleteGroup(groupId);
    setActiveDropdown(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedGroup(null);
  };

  const getGroupStats = (groupId: string) => {
    const expenses = getGroupExpenses(groupId);
    const totalAmount = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0); // Added type annotations
    const memberCount = groups.find(g => g.id === groupId)?.members.length || 0;
    
    return { totalAmount, expenseCount: expenses.length, memberCount };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-2">
            Manage your expense groups and track shared costs
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredGroups.length} of {userGroups.length} groups
            </span>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid/List */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {userGroups.length === 0 ? 'No groups yet' : 'No groups found'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {userGroups.length === 0 
              ? "Create your first group to start tracking shared expenses with friends, roommates, or your savings group."
              : "Try adjusting your search terms to find what you're looking for."
            }
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Group</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const stats = getGroupStats(group.id);
            
            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`h-3 ${group.color} rounded-t-2xl`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {group.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{group.description}</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(group.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {activeDropdown === group.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button 
                            onClick={() => handleEdit(group)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Group</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(group.id)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Group</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Members</span>
                      <span className="font-medium text-gray-900">
                        {stats.memberCount} people
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expenses</span>
                      <span className="font-medium text-gray-900">
                        {stats.expenseCount} total
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(stats.totalAmount, group.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Currency</span>
                      <span className="font-medium text-gray-900">{group.currency}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/dashboard/groups/${group.id}`}
                      className="flex-1 bg-linear-to-r from-yellow-600 to-yellow-700 text-white text-center py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      View Group
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.map((group) => {
                const stats = getGroupStats(group.id);
                
                return (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-8 ${group.color} rounded-lg mr-4`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {group.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {group.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stats.memberCount} members</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {getMemberNames(group.members)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stats.expenseCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(stats.totalAmount, group.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(group)}
                          className="text-yellow-600 hover:text-yellow-700 transition-colors"
                        >
                          Edit
                        </button>
                        <Link
                          to={`/dashboard/groups/${group.id}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Group Modal */}
      {selectedGroup && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          group={selectedGroup}
        />
      )}
    </div>
  );
};

export default Groups;