const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  validateGroupCreation,
  validateGroupUpdate,
  validateAddMember,
} = require("../middleware/validationMiddleware");
const groupController = require("../controllers/groupController");

/**
 * @route   GET /api/groups
 * @desc    Get all groups for the authenticated user
 * @access  Private
 */
router.get("/", authenticateToken, groupController.getUserGroups);

/**
 * @route   GET /api/groups/:groupId
 * @desc    Get a single group by ID
 * @access  Private
 */
router.get("/:groupId", authenticateToken, groupController.getGroupById);

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post(
  "/",
  authenticateToken,
  validateGroupCreation,
  groupController.createGroup
);

/**
 * @route   PUT /api/groups/:groupId
 * @desc    Update a group
 * @access  Private
 */
router.put(
  "/:groupId",
  authenticateToken,
  validateGroupUpdate,
  groupController.updateGroup
);

/**
 * @route   DELETE /api/groups/:groupId
 * @desc    Delete a group (soft delete)
 * @access  Private
 */
router.delete("/:groupId", authenticateToken, groupController.deleteGroup);

/**
 * @route   POST /api/groups/:groupId/members
 * @desc    Add a member to a group
 * @access  Private
 */
router.post(
  "/:groupId/members",
  authenticateToken,
  validateAddMember,
  groupController.addMember
);

/**
 * @route   DELETE /api/groups/:groupId/members/:memberId
 * @desc    Remove a member from a group
 * @access  Private
 */
router.delete(
  "/:groupId/members/:memberId",
  authenticateToken,
  groupController.removeMember
);

module.exports = router;
