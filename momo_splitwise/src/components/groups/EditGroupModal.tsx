import React, { useState, useEffect } from "react";
import { X, Users, FileText, User } from "lucide-react";
import type { Group } from "../../types";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

// Color options for groups
const GROUP_COLORS = [
  "bg-linear-to-r from-yellow-600 to-yellow-700",
  "bg-linear-to-r from-blue-500 to-cyan-500",
  "bg-linear-to-r from-green-500 to-emerald-500",
  "bg-linear-to-r from-orange-500 to-red-500",
  "bg-linear-to-r from-purple-500 to-pink-500",
  "bg-linear-to-r from-rose-500 to-pink-500",
];

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const { updateGroup, users } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    currency: group.currency,
    color: group.color,
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    group.members
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: group.name,
        description: group.description,
        currency: group.currency,
        color: group.color,
      });
      setSelectedMembers(group.members);
    }
  }, [isOpen, group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Please add at least one member to the group");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedGroup: Group = {
        ...group,
        name: formData.name.trim(),
        description: formData.description.trim(),
        currency: formData.currency,
        color: formData.color,
        members: selectedMembers,
        // Removed updatedAt property since it doesn't exist in Group type
      };

      updateGroup(updatedGroup);
      onClose();
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Group</h2>
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              placeholder="What's this group for?"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`h-10 rounded-lg border-2 ${
                    formData.color === color
                      ? "border-gray-900"
                      : "border-gray-300"
                  } ${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
              required
              disabled={isSubmitting}
            >
              <option value="RWF">Rwandan Franc (RWF)</option>
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Group Members *
              <span className="ml-2 text-xs text-gray-500">
                {selectedMembers.length} member(s) selected
              </span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {users
                .filter((u) => u.id !== user?.id)
                .map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="text-yellow-600 focus:ring-yellow-600 rounded"
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </label>
                ))}
            </div>

            {/* Show current user as auto-selected */}
            {user && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="text-yellow-600 focus:ring-yellow-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name} (You)
                    </p>
                    <p className="text-xs text-gray-500">Group admin</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-yellow-600 to-yellow-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;