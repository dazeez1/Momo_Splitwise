const {
  verifyAccessToken,
  extractTokenFromHeader,
} = require("../utils/jwtUtils");
const User = require("../models/User");

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        code: "MISSING_TOKEN",
      });
    }

    // Verify the token
    const decoded = verifyAccessToken(token);

    // Find the user and check if they're still active
    const user = await User.findById(decoded.userId).select(
      "-password -refreshTokens"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message,
      code: "AUTHENTICATION_FAILED",
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select(
        "-password -refreshTokens"
      );

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Middleware to check if user is verified
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "AUTHENTICATION_REQUIRED",
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  next();
};

/**
 * Middleware to check if user is verified
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requirePhoneVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "AUTHENTICATION_REQUIRED",
    });
  }

  if (!req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: "Phone verification required",
      code: "PHONE_NOT_VERIFIED",
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 * @param {string} userIdParam - Parameter name containing user ID
 * @returns {Function} Middleware function
 */
const requireOwnership = (userIdParam = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const resourceUserId = req.params[userIdParam];

    if (req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied - insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireEmailVerification,
  requirePhoneVerification,
  requireOwnership,
};
