const express = require("express");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
  updateProfile,
} = require("../controllers/authController");
const {
  validateRegistration,
  validateLogin,
  validateRefreshToken,
  validateLogout,
  validateProfileUpdate,
} = require("../middleware/validationMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateRegistration, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validateLogin, loginUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", validateRefreshToken, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticateToken, validateLogout, logoutUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateToken, getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", authenticateToken, validateProfileUpdate, updateProfile);

module.exports = router;
