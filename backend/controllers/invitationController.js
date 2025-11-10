const Invitation = require("../models/Invitation");
const Group = require("../models/Group");
const User = require("../models/User");
/**
 * Get all pending invitations for the current user
 */
exports.getUserInvitations = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;

    // Find invitations by user's email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const invitations = await Invitation.find({
      email: user.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("groupId", "name description currency members")
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { invitations },
      message: "Invitations retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting invitations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve invitations",
      error: error.message,
    });
  }
};

/**
 * Get a single invitation by ID
 */
exports.getInvitationById = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId)
      .populate("groupId", "name description currency members")
      .populate("invitedBy", "name email");

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { invitation },
      message: "Invitation retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve invitation",
      error: error.message,
    });
  }
};

/**
 * Accept an invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.userId || req.user._id;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Check if user's email matches
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this invitation",
      });
    }

    // Check if invitation is expired
    if (invitation.isExpired()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: "This invitation has expired",
      });
    }

    // Check if invitation is already accepted/declined
    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status}`,
      });
    }

    // Add user to group
    const group = await Group.findById(invitation.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is already a member
    if (group.members.some((m) => m.toString() === userId.toString())) {
      // User is already a member, just mark invitation as accepted
      invitation.status = "accepted";
      await invitation.save();

      return res.status(200).json({
        success: true,
        data: { group },
        message: "You are already a member of this group",
      });
    }

    // Add user to group members
    group.members.push(userId);
    await group.save();

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();

    // Populate the group before returning
    await group.populate("members", "name email");
    await group.populate("createdBy", "name email");

    // Emit Socket.io notification
    const emitNotification = req.app.get("emitNotification");
    if (emitNotification) {
      emitNotification(invitation.invitedBy, "group_member_joined", {
        message: `${user.name} accepted the invitation to join ${group.name}`,
        groupId: group._id,
        userId: userId,
      });
    }

    res.status(200).json({
      success: true,
      data: { group, invitation },
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation",
      error: error.message,
    });
  }
};

/**
 * Decline an invitation
 */
exports.declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.userId || req.user._id;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Check if user's email matches
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to decline this invitation",
      });
    }

    // Update invitation status
    invitation.status = "declined";
    await invitation.save();

    res.status(200).json({
      success: true,
      message: "Invitation declined successfully",
    });
  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decline invitation",
      error: error.message,
    });
  }
};

/**
 * Delete/Cancel an invitation (for the group creator)
 */
exports.deleteInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.userId || req.user._id;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Check if user is the one who sent the invitation or is group creator
    const group = await Group.findById(invitation.groupId);
    if (
      invitation.invitedBy.toString() !== userId.toString() &&
      group.createdBy.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this invitation",
      });
    }

    // Delete invitation
    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete invitation",
      error: error.message,
    });
  }
};
