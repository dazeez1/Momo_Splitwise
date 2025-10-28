const Group = require("../models/Group");
const Invitation = require("../models/Invitation");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { sendGroupInvitationEmail } = require("../services/emailService");

// Get all groups for a user
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;

    const groups = await Group.find({
      $or: [{ members: userId }, { createdBy: userId }],
      isActive: true,
    })
      .populate("members", "name email phoneNumber")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { groups },
      message: "Groups retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting user groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve groups",
      error: error.message,
    });
  }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    const group = await Group.findOne({
      _id: groupId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member (before populate)
    const isMember = group.members.some(
      (memberId) => memberId && memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Populate after checking membership
    await group.populate("members", "name email phoneNumber");
    await group.populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      data: { group },
      message: "Group retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve group",
      error: error.message,
    });
  }
};

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        code: "VALIDATION_ERROR",
      });
    }

    const userId = req.userId || req.user._id;
    const { name, description, members, memberEmails, currency, color } =
      req.body;
    const io = req.app.get("io");

    // Create the group with creator as initial member
    const group = new Group({
      name,
      description,
      members: [userId], // Start with just the creator
      createdBy: userId,
      currency: currency || "RWF",
      color: color || "bg-gradient-to-r from-yellow-600 to-yellow-700",
    });

    await group.save();

    const memberIds = [userId];
    const invitations = [];

    // Handle memberEmails (new approach)
    if (
      memberEmails &&
      Array.isArray(memberEmails) &&
      memberEmails.length > 0
    ) {
      for (const email of memberEmails) {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (user) {
          // User exists, add to group
          if (!memberIds.includes(user._id.toString())) {
            memberIds.push(user._id.toString());
          }

          // Send real-time notification
          if (io) {
            io.to(`user:${user._id}`).emit("group_invitation", {
              type: "group_added",
              groupId: group._id,
              groupName: group.name,
              invitedBy: req.user.name,
            });
          }
        } else {
          // User doesn't exist, create invitation
          const invitation = new Invitation({
            groupId: group._id,
            email: email.toLowerCase().trim(),
            invitedBy: userId,
          });
          await invitation.save();
          invitations.push(invitation);

          // Send invitation email (fire and forget)
          try {
            await sendGroupInvitationEmail(invitation, group, req.user);
          } catch (error) {
            console.error("Failed to send invitation email:", error);
          }
        }
      }
    } else if (members && Array.isArray(members)) {
      // Legacy support: handle direct member IDs
      members.forEach((memberId) => {
        if (memberId && !memberIds.includes(memberId)) {
          memberIds.push(memberId);
        }
      });
    }

    // Update group with all members
    group.members = memberIds;
    await group.save();

    await group.populate("members", "name email phoneNumber");
    await group.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      data: {
        group,
        invitations: invitations.length > 0 ? invitations : undefined,
      },
      message:
        invitations.length > 0
          ? `Group created. ${invitations.length} invitation(s) sent.`
          : "Group created successfully",
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: error.message,
    });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        code: "VALIDATION_ERROR",
      });
    }

    const { groupId } = req.params;
    const userId = req.userId || req.user._id;
    const { name, description, members, currency, color } = req.body;

    const group = await Group.findOne({
      _id: groupId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the creator
    const creatorId = group.createdBy.toString();
    const userIdStr = userId.toString();

    if (creatorId !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: "Only the group creator can update the group",
      });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (currency) group.currency = currency;
    if (color) group.color = color;

    // Update members if provided
    if (members && Array.isArray(members)) {
      // Ensure the creator remains in members
      const allMembers = [...new Set([userId, ...members])];
      group.members = allMembers;
    }

    await group.save();

    // Repopulate after save
    await group.populate("members", "name email phoneNumber");
    await group.populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      data: { group },
      message: "Group updated successfully",
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message,
    });
  }
};

// Delete a group (soft delete)
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId || req.user._id;

    const group = await Group.findOne({
      _id: groupId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the creator
    const creatorId = group.createdBy.toString();
    const userIdStr = userId.toString();

    if (creatorId !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: "Only the group creator can delete the group",
      });
    }

    // Soft delete
    group.isActive = false;
    await group.save();

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
      error: error.message,
    });
  }
};

// Add member to a group
exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.userId || req.user._id;

    const group = await Group.findOne({
      _id: groupId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member or creator
    const creatorId = group.createdBy.toString();
    const userIdStr = userId.toString();
    const isUserMember = group.members.some(
      (memberId) => memberId.toString() === userIdStr
    );

    if (!isUserMember && creatorId !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add members to this group",
      });
    }

    // Add member if not already in group
    const alreadyMember = group.members.some(
      (mId) => mId.toString() === memberId.toString()
    );

    if (!alreadyMember) {
      group.members.push(memberId);
      await group.save();
      await group.populate("members", "name email phoneNumber");
      await group.populate("createdBy", "name email");

      return res.status(200).json({
        success: true,
        data: { group },
        message: "Member added successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Member is already in the group",
      });
    }
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// Remove member from a group
exports.removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.userId || req.user._id;

    const group = await Group.findOne({
      _id: groupId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the creator
    const creatorId = group.createdBy.toString();
    const userIdStr = userId.toString();

    if (creatorId !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: "Only the group creator can remove members",
      });
    }

    // Cannot remove the creator
    if (creatorId === memberId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the group creator",
      });
    }

    const memberExists = group.members.some(
      (mId) => mId.toString() === memberId.toString()
    );

    if (!memberExists) {
      return res.status(400).json({
        success: false,
        message: "Member is not in the group",
      });
    }

    // Remove member
    group.members = group.members.filter(
      (mId) => mId.toString() !== memberId.toString()
    );

    await group.save();

    await group.populate("members", "name email phoneNumber");
    await group.populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      data: { group },
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};
