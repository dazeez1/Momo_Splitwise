import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import InvitationCard from "./InvitationCard";
import apiService from "../../services/apiService";
import { useToast } from "../../contexts/ToastContext";

interface Invitation {
  id: string;
  groupId: any;
  invitedBy: any;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface InvitationsListProps {
  onInvitationAction?: () => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({
  onInvitationAction,
}) => {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getInvitations();
      const fetchedInvitations =
        response.data?.invitations || response.invitations || [];

      // Transform MongoDB invitations to frontend format
      const transformedInvitations: Invitation[] = fetchedInvitations.map(
        (inv: any) => ({
          id: inv._id,
          groupId: inv.groupId,
          invitedBy: inv.invitedBy,
          email: inv.email,
          status: inv.status,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })
      );

      setInvitations(transformedInvitations);
    } catch (error) {
      console.error("Error loading invitations:", error);
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleUpdate = () => {
    loadInvitations();
    if (onInvitationAction) {
      onInvitationAction();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Loading invitations...</span>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-2">
          <Mail className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Group Invitations
          </h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pending invitations</p>
          <p className="text-sm text-gray-400 mt-1">
            You'll see group invitations here when you receive them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <Mail className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Group Invitations ({invitations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default InvitationsList;
