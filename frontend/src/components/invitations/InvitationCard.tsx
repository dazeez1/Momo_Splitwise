import React, { useState } from "react";
import { Mail, User, Calendar, Check, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import apiService from "../../services/apiService";
import { useToast } from "../../contexts/ToastContext";
import { useApp } from "../../contexts/AppContext";

interface InvitationCardProps {
  invitation: {
    id: string;
    groupId: any;
    invitedBy: any;
    email: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  };
  onUpdate: () => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onUpdate,
}) => {
  const { showToast } = useToast();
  const { loadGroups } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await apiService.acceptInvitation(invitation.id);
      await loadGroups();
      showToast(
        "Invitation accepted! You've been added to the group.",
        "success"
      );
      onUpdate();
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      showToast(error?.message || "Failed to accept invitation", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await apiService.declineInvitation(invitation.id);
      showToast("Invitation declined", "info");
      onUpdate();
    } catch (error: any) {
      console.error("Error declining invitation:", error);
      showToast(error?.message || "Failed to decline invitation", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div className="bg-white rounded-xl border border-yellow-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {invitation.groupId?.name || "Group"}
              </h4>
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>
                  Invited by {invitation.invitedBy?.name || "Unknown"}
                </span>
              </p>
            </div>
          </div>

          {invitation.groupId?.description && (
            <p className="text-sm text-gray-600 mb-3">
              {invitation.groupId.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {isExpired
                  ? "Expired"
                  : `Expires ${formatDistanceToNow(
                      new Date(invitation.expiresAt),
                      { addSuffix: true }
                    )}`}
              </span>
            </div>
          </div>
        </div>

        {!isExpired && isProcessing === false && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleAccept}
              className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              <Check className="h-4 w-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={handleDecline}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              <X className="h-4 w-4" />
              <span>Decline</span>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="ml-4 text-sm text-gray-500">Processing...</div>
        )}

        {isExpired && (
          <div className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
            Expired
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationCard;
