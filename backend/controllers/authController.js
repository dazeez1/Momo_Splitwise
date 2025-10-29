const User = require("../models/User");
const { generateTokenPair, verifyRefreshToken } = require("../utils/jwtUtils");
const { validationResult } = require("express-validator");
const { sendWelcomeEmail } = require("../services/emailService");

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        code: "VALIDATION_ERROR",
      });
    }

    const { name, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUserByEmail = await User.emailExists(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
        code: "EMAIL_EXISTS",
      });
    }

    const existingUserByPhone = await User.phoneExists(phoneNumber);
    if (existingUserByPhone) {
      return res.status(409).json({
        success: false,
        message: "User with this phone number already exists",
        code: "PHONE_EXISTS",
      });
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password,
    });

    await newUser.save();

    // Generate tokens
    const tokens = generateTokenPair(newUser);

    // Add refresh token to user
    await newUser.addRefreshToken(tokens.refreshToken);

    // Update last login
    await newUser.updateLastLogin();

    // Send welcome email (fire and forget)
    sendWelcomeEmail(newUser).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    // Return user data (password excluded by schema transform)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: newUser,
        tokens,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`,
        code: "DUPLICATE_KEY",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "REGISTRATION_ERROR",
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const loginUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        code: "VALIDATION_ERROR",
      });
    }

    const { identifier, password } = req.body; // identifier can be email or phone

    // Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Add refresh token to user
    await user.addRefreshToken(tokens.refreshToken);

    // Update last login
    await user.updateLastLogin();

    // Return user data (password excluded by schema transform)
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
      code: "LOGIN_ERROR",
    });
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Generate new tokens
    const newTokens = generateTokenPair(user);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newTokens.refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        tokens: newTokens,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error.message);

    res.status(401).json({
      success: false,
      message: error.message,
      code: "TOKEN_REFRESH_FAILED",
    });
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.userId;

    if (refreshToken) {
      // Remove specific refresh token
      const user = await User.findById(userId);
      if (user) {
        await user.removeRefreshToken(refreshToken);
      }
    } else {
      // Remove all refresh tokens (logout from all devices)
      await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    res.status(500).json({
      success: false,
      message: "Logout failed",
      code: "LOGOUT_ERROR",
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
      code: "GET_USER_ERROR",
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        code: "VALIDATION_ERROR",
      });
    }

    const userId = req.userId;
    const { name, phoneNumber, preferences, profilePicture } = req.body;

    // Check if phone number is being updated and if it already exists
    if (phoneNumber) {
      const existingUser = await User.phoneExists(phoneNumber);
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists",
          code: "PHONE_EXISTS",
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name.trim();

    // Profile picture can be empty string to remove it, or a base64 string
    if (profilePicture !== undefined && profilePicture !== null) {
      updateData.profilePicture = profilePicture;
    } else if (profilePicture === "") {
      updateData.profilePicture = null; // Remove profile picture
    }

    if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();

    // Handle mobile money fields
    if (req.body.mobileMoneyNumber !== undefined) {
      updateData.mobileMoneyNumber = req.body.mobileMoneyNumber.trim() || null;
    }
    if (req.body.mobileMoneyProvider !== undefined) {
      updateData.mobileMoneyProvider = req.body.mobileMoneyProvider || null;
    }

    if (preferences)
      updateData.preferences = { ...req.user.preferences, ...preferences };

    console.log("Update data being sent to DB:", updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
        code: "DUPLICATE_PHONE",
      });
    }

    res.status(500).json({
      success: false,
      message: "Profile update failed",
      code: "UPDATE_PROFILE_ERROR",
    });
  }
};

/**
 * Get all users (for adding to groups)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select(
        "name email phoneNumber mobileMoneyNumber mobileMoneyProvider _id"
      )
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { users },
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
  updateProfile,
  getUsers,
};
