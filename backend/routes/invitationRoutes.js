const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const invitationController = require("../controllers/invitationController");

/**
 * @route   GET /api/invitations
 * @desc    Get all pending invitations for the current user
 * @access  Private
 */
router.get("/", authenticateToken, invitationController.getUserInvitations);

/**
 * @route   GET /api/invitations/:invitationId
 * @desc    Get a single invitation by ID
 * @access  Private
 */
router.get(
  "/:invitationId",
  authenticateToken,
  invitationController.getInvitationById
);

/**
 * @route   PUT /api/invitations/:invitationId/accept
 * @desc    Accept an invitation
 * @access  Private
 */
router.put(
  "/:invitationId/accept",
  authenticateToken,
  invitationController.acceptInvitation
);

/**
 * @route   PUT /api/invitations/:invitationId/decline
 * @desc    Decline an invitation
 * @access  Private
 */
router.put(
  "/:invitationId/decline",
  authenticateToken,
  invitationController.declineInvitation
);

/**
 * @route   DELETE /api/invitations/:invitationId
 * @desc    Delete/Cancel an invitation (for group creator)
 * @access  Private
 */
router.delete(
  "/:invitationId",
  authenticateToken,
  invitationController.deleteInvitation
);

module.exports = router;
