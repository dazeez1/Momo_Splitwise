const express = require("express");
const {
  getCurrentUser,
  updateProfile,
  getUsers,
} = require("../controllers/authController");
const { validateProfileUpdate } = require("../middleware/validationMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Get all users (for adding to groups)
 * @access  Private
 */
router.get("/", getUsers);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", getCurrentUser);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", validateProfileUpdate, updateProfile);

module.exports = router;
