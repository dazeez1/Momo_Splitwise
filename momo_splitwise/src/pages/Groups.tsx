import { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import GroupCard from '../components/group/GroupCard';
import CreateGroupModal from '../components/group/CreateGroupModal';

const Groups: React.FC = () => {
  const { groups } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const userGroups = groups.filter(group => 
    group.members.includes(user?.id || '')
  );

  const filteredGroups = userGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Groups</h1>
            <p className="text-gray-600">
              Manage your expense groups and track shared costs
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </button>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
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
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Groups;