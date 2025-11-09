import React, { useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { X, Users, FileText, User, Plus } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Color options for groups
const GROUP_COLORS = [
  "bg-linear-to-r from-purple-500 to-pink-500",
  "bg-linear-to-r from-blue-500 to-cyan-500",
  "bg-linear-to-r from-green-500 to-emerald-500",
  "bg-linear-to-r from-orange-500 to-red-500",
  "bg-linear-to-r from-indigo-500 to-purple-500",
  "bg-linear-to-r from-rose-500 to-pink-500",
];

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addGroup, users, loadGroups } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "Rwf",
    color: GROUP_COLORS[0],
  });
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Reset emails when modal opens
      setMemberEmails([]);
      setEmailInput("");
    }
  }, [isOpen]);

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;

    const email = emailInput.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if email already added
    if (memberEmails.includes(email)) {
      setError("This email is already added");
      return;
    }

    setMemberEmails([...memberEmails, email]);
    setEmailInput("");
    setError("");
  };

  const handleRemoveEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (memberEmails.length === 0) {
      setError("Please add at least one member by email");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creating group with member emails:", memberEmails);
      await addGroup({
        name: formData.name.trim(),
        description: formData.description.trim(),
        currency: formData.currency.toUpperCase(),
        color: formData.color,
        members: memberEmails,
      });

      onClose();
      resetForm();

      // Reload groups list from API
      loadGroups();
     
    } catch (error: any) {
      console.error("Error creating group:", error);
      setError(error.message || "Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      currency: "Rwf",
      color: GROUP_COLORS[0],
    });
    setMemberEmails([]);
    setEmailInput("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Group
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

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
              <option value="Rwf">Rwandan Francs (Rwf)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add Members by Email *
              <span className="ml-2 text-xs text-gray-500">
                {memberEmails.length} member(s) added
              </span>
            </label>

            {/* Email Input */}
            <div className="flex space-x-2 mb-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent disabled:opacity-50"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddEmail}
                disabled={isSubmitting || !emailInput.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Added Emails List */}
            {memberEmails.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {memberEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Current User Info */}
            {user && (
              <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name} (You)
                    </p>
                    <p className="text-xs text-gray-500">
                      Automatically added as member
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              💡 Add members by their email address. If they have an account,
              they'll be added immediately. If not, they'll receive an
              invitation.
            </p>
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
              className="px-6 py-3 text-sm font-medium text-white bg-linear-to-r from-yellow-600 to-yellow-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
