import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Mail,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { formatCurrency } from "../../utils/calculations";
import EditGroupModal from "../../components/groups/EditGroupModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import apiService from "../../services/apiService";
import type { Group, Expense } from "../../types";

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const {
    groups,
    expenses,
    users,
    getGroupExpenses,
    calculateBalances,
    loadGroups,
  } = useApp();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    memberId?: string;
    memberName?: string;
  }>({ isOpen: false });

  useEffect(() => {
    if (groupId && groups.length > 0) {
      const foundGroup = groups.find((g) => g.id === groupId);
      if (foundGroup) {
        setGroup(foundGroup);
      } else {
        // If not found in local state, navigate back
        navigate("/dashboard/groups");
      }
    }
  }, [groupId, groups, navigate]);

  // Also reload groups when groupId changes
  useEffect(() => {
    if (groupId) {
      loadGroups();
    }
  }, [groupId]);

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  const groupExpenses = getGroupExpenses(groupId!);
  const balances = calculateBalances(groupId!);
  const isCreator = group.createdBy === authUser?.id;

  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Find user by email
      const user = users.find(
        (u) => u.email.toLowerCase() === memberEmail.toLowerCase()
      );

      if (user && groupId) {
        await apiService.addGroupMember(groupId, user.id);

        // Reload groups from API
        await loadGroups();

        showToast("Member added successfully", "success");
        setIsAddMemberModalOpen(false);
        setMemberEmail("");
        setError(null);
      } else {
        setError("User not found. Please enter a valid email address.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add member. Please try again.");
      console.error("Error adding member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const member = users.find((u) => u.id === memberId);
    setConfirmDialog({
      isOpen: true,
      memberId,
      memberName: member?.name || "this member",
    });
  };

  const confirmRemoveMember = async () => {
    if (!confirmDialog.memberId || !groupId) return;

    try {
      await apiService.removeGroupMember(groupId, confirmDialog.memberId);

      // Reload groups from API to get fresh data
      await loadGroups();

      showToast("Member removed successfully", "success");
      setConfirmDialog({ isOpen: false });
    } catch (err: any) {
      console.error("Error removing member:", err);
      showToast("Failed to remove member", "error");
      // Update the group state even if there was an error
      await loadGroups();
      setConfirmDialog({ isOpen: false });
    }
  };

  const memberNames = group.members.map((memberId) => {
    const member = users.find((u) => u.id === memberId);
    return member ? member.name : "Unknown User";
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/groups"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-luxury font-bold text-gray-900">
              {group.name}
            </h1>
            <p className="text-gray-600 mt-1">{group.description}</p>
          </div>
        </div>

        {isCreator && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Group</span>
          </button>
        )}
      </div>

      {/* Group Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Members</h3>
            <Users className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {group.members.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Total Expenses
            </h3>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {groupExpenses.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <Calendar className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(
              groupExpenses.reduce((sum, exp) => sum + exp.amount, 0),
              group.currency
            )}
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Members</h2>
          {isCreator && (
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {group.members.map((memberId, index) => {
            const member = users.find((u) => u.id === memberId);
            const balance = balances.find((b) => b.userId === memberId);
            const isUser = memberId === authUser?.id;

            return (
              <div
                key={memberId}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member ? member.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member ? member.name : "Unknown User"}
                      {isUser && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member ? member.email : "No email"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p
                      className={`text-lg font-semibold ${
                        balance && balance.balance > 0
                          ? "text-green-600"
                          : balance && balance.balance < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {balance
                        ? formatCurrency(
                            Math.abs(balance.balance),
                            group.currency
                          )
                        : formatCurrency(0, group.currency)}
                      {balance && balance.balance > 0 && " owes you"}
                      {balance && balance.balance < 0 && " you owe"}
                    </p>
                  </div>

                  {isCreator && !isUser && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Expenses
        </h2>

        {groupExpenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No expenses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupExpenses.slice(0, 5).map((expense) => {
              const paidByUser = users.find((u) => u.id === expense.paidBy);

              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {expense.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      Paid by {paidByUser?.name || "Unknown"}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Group Modal */}
      {isEditModalOpen && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          group={group}
        />
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Add Member by Email
              </h2>
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setMemberEmail("");
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <div className="text-red-600">
                  <X className="h-5 w-5" />
                </div>
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => {
                    setMemberEmail(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && memberEmail && !isSubmitting) {
                      handleAddMember();
                    }
                  }}
                  placeholder="user@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the email address of the person you want to add. They will
                receive a notification if they have an account.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setMemberEmail("");
                  setError(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={isSubmitting || !memberEmail}
                className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Member Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmDialog.memberName} from this group? This action cannot be undone.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        onConfirm={confirmRemoveMember}
        onCancel={() => setConfirmDialog({ isOpen: false })}
        isDestructive={true}
      />
    </div>
  );
};

export default GroupDetail;
