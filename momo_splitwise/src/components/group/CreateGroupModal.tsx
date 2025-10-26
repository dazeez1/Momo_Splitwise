import React, { useState, useEffect } from 'react';
import { X, Users, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { addGroup, users } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'KES',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Auto-select current user
      setSelectedMembers([user.id]);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      alert('Please add at least one member to the group');
      return;
    }

    setIsSubmitting(true);

    try {
      addGroup({
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: selectedMembers,
        createdBy: user?.id || '',
        currency: formData.currency,
      });

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      currency: 'KES',
    });
    setSelectedMembers(user ? [user.id] : []);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4" />
              <span>Group Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Roommates, Weekend Trip, Chama Group"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              <span>Description (Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="What's this group for?"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add Members *
              <span className="ml-2 text-xs text-gray-500">
                {selectedMembers.length} member(s) selected
              </span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {users
                .filter(u => u.id !== user?.id) // Exclude current user from list (they're auto-added)
                .map(user => (
                  <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="text-primary-600 focus:ring-primary-500"
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                    </div>
                  </label>
                ))}
            </div>
            {users.filter(u => u.id !== user?.id).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No other users found. You can still create a group and invite friends later!
              </p>
            )}
            
            {/* Show current user as auto-selected */}
            {user && (
              <div className="mt-2 p-2 bg-primary-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name} (You)</p>
                    <p className="text-xs text-gray-500">Automatically added as member</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;