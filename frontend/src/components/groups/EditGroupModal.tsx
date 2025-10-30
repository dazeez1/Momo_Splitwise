import React, { useState, useEffect } from "react";
import { X, Users, FileText, User } from "lucide-react";
import type { Group } from "../../types";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

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
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    currency: group.currency,
    color: group.color,
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    group.members
  );
  const [emailSearch, setEmailSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      showToast("Please enter a group name", "error");
      return;
    }

    if (selectedMembers.length === 0) {
      showToast("Please add at least one member to the group", "error");
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

      await updateGroup(updatedGroup);
      showToast("Group updated successfully", "success");
      onClose();
    } catch (error) {
      console.error("Error updating group:", error);
      showToast("Failed to update group. Please try again.", "error");
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

  const handleSearchEmail = async () => {
    if (!emailSearch.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for users by email
      const matchingUsers = users.filter(
        (u) =>
          u.email.toLowerCase().includes(emailSearch.toLowerCase()) &&
          !selectedMembers.includes(u.id)
      );
      setSearchResults(matchingUsers);
    } catch (error) {
      console.error("Error searching for users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddByEmail = async () => {
    if (!emailSearch.trim()) {
      showToast("Please enter an email address", "error");
      return;
    }

    // Check if user exists in our database
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === emailSearch.toLowerCase()
    );

    if (existingUser && !selectedMembers.includes(existingUser.id)) {
      toggleMember(existingUser.id);
      showToast(`${existingUser.name} added to group`, "success");
      setEmailSearch("");
      setSearchResults([]);
    } else {
      showToast(
        "User not found. You can add members by email in the group detail page once this feature is fully implemented.",
        "info"
      );
    }
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
                {selectedMembers.length} member(s)
              </span>
            </label>

            {/* Add member by email */}
            <div className="mb-4 flex space-x-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchEmail();
                    }
                  }}
                  placeholder="Search by email..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAddByEmail}
                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Display selected members */}
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {selectedMembers.map((memberId) => {
                const memberUser = users.find((u) => u.id === memberId);
                const isCurrentUser = memberId === user?.id;

                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      {!isCurrentUser && (
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleMember(memberId)}
                          className="text-yellow-600 focus:ring-yellow-600 rounded"
                          disabled={isSubmitting}
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {memberUser?.name || "Unknown User"}
                          {isCurrentUser && " (You)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {memberUser?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    {!isCurrentUser && (
                      <button
                        type="button"
                        onClick={() => toggleMember(memberId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick add from search results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Search Results:
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        toggleMember(u.id);
                        setEmailSearch("");
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className="text-yellow-600 text-sm">+ Add</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
