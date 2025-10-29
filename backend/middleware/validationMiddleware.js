const { body } = require("express-validator");

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email cannot exceed 100 characters"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or phone number is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Identifier must be between 3 and 100 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
];

/**
 * Validation rules for token refresh
 */
const validateRefreshToken = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isJWT()
    .withMessage("Invalid refresh token format"),
];

/**
 * Validation rules for logout
 */
const validateLogout = [
  body("refreshToken")
    .optional()
    .isJWT()
    .withMessage("Invalid refresh token format"),
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 characters"),

  body("preferences.currency")
    .optional()
    .isIn(["RWF", "USD", "EUR", "KES", "UGX", "TZS"])
    .withMessage("Invalid currency"),

  body("preferences.language")
    .optional()
    .isIn(["en", "fr", "sw"])
    .withMessage("Invalid language"),

  body("preferences.notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification preference must be boolean"),

  body("preferences.notifications.sms")
    .optional()
    .isBoolean()
    .withMessage("SMS notification preference must be boolean"),

  body("preferences.notifications.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification preference must be boolean"),
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
];

/**
 * Validation rules for creating a group
 */
const validateGroupCreation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Group name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  // Accept either members (user IDs) OR memberEmails (email strings)
  body("members")
    .optional()
    .isArray({ min: 0 })
    .withMessage("Members must be an array")
    .custom((members) => {
      return members.every((member) => typeof member === "string");
    })
    .withMessage("All members must be valid user IDs"),

  body("memberEmails")
    .optional()
    .isArray({ min: 0 })
    .withMessage("Member emails must be an array")
    .custom((emails) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every(
        (email) => typeof email === "string" && emailRegex.test(email)
      );
    })
    .withMessage("All member emails must be valid email addresses"),

  // Ensure at least one of members or memberEmails is provided
  body().custom((value) => {
    if (!value.members && !value.memberEmails) {
      throw new Error("Either members or memberEmails must be provided");
    }
    return true;
  }),

  body("currency")
    .optional()
    .isIn(["RWF", "USD", "EUR", "KES", "UGX", "TZS"])
    .withMessage("Invalid currency"),

  body("color").optional().isString().withMessage("Color must be a string"),
];

/**
 * Validation rules for updating a group
 */
const validateGroupUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Group name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("members")
    .optional()
    .isArray({ min: 0 })
    .withMessage("Members must be an array")
    .custom((members) => {
      return members.every((member) => typeof member === "string");
    })
    .withMessage("All members must be valid user IDs"),

  body("memberEmails")
    .optional()
    .isArray({ min: 0 })
    .withMessage("Member emails must be an array")
    .custom((emails) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every(
        (email) => typeof email === "string" && emailRegex.test(email)
      );
    })
    .withMessage("All member emails must be valid email addresses"),

  body("currency")
    .optional()
    .isIn(["RWF", "USD", "EUR", "KES", "UGX", "TZS"])
    .withMessage("Invalid currency"),

  body("color").optional().isString().withMessage("Color must be a string"),
];

/**
 * Validation rules for adding a member
 */
const validateAddMember = [
  body("memberId")
    .notEmpty()
    .withMessage("Member ID is required")
    .isMongoId()
    .withMessage("Invalid member ID format"),
];

/**
 * Validation rules for creating an expense
 */
const validateExpenseCreation = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("currency")
    .optional()
    .isIn(["RWF", "USD", "EUR", "KES", "UGX", "TZS"])
    .withMessage("Invalid currency"),

  body("category")
    .optional()
    .isIn([
      "food",
      "utilities",
      "transport",
      "entertainment",
      "shopping",
      "healthcare",
      "education",
      "travel",
      "other",
    ])
    .withMessage("Invalid category"),

  body("groupId")
    .notEmpty()
    .withMessage("Group ID is required")
    .isMongoId()
    .withMessage("Invalid group ID format"),

  body("splitType")
    .isIn(["equal", "percentage", "exact"])
    .withMessage("Invalid split type"),

  body("splits")
    .isArray({ min: 1 })
    .withMessage("At least one split is required")
    .custom((splits) => {
      return splits.every(
        (split) =>
          split.userId &&
          (split.amount !== undefined || split.percentage !== undefined)
      );
    })
    .withMessage("Each split must have a user ID and amount/percentage"),
];

/**
 * Validation rules for updating an expense
 */
const validateExpenseUpdate = [
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("currency")
    .optional()
    .isIn(["RWF", "USD", "EUR", "KES", "UGX", "TZS"])
    .withMessage("Invalid currency"),

  body("category")
    .optional()
    .isIn([
      "food",
      "utilities",
      "transport",
      "entertainment",
      "shopping",
      "healthcare",
      "education",
      "travel",
      "other",
    ])
    .withMessage("Invalid category"),

  body("splitType")
    .optional()
    .isIn(["equal", "percentage", "exact"])
    .withMessage("Invalid split type"),

  body("splits")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one split is required")
    .custom((splits) => {
      return splits.every(
        (split) =>
          split.userId &&
          (split.amount !== undefined || split.percentage !== undefined)
      );
    })
    .withMessage("Each split must have a user ID and amount/percentage"),
];

/**
 * Validation rules for payment creation
 */
const validatePaymentCreation = [
  body("toUserId")
    .notEmpty()
    .withMessage("Recipient is required")
    .isMongoId()
    .withMessage("Invalid recipient ID format"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("currency")
    .optional()
    .isIn(["RWF", "USD", "EUR", "KES", "UGX", "TZS"])
    .withMessage("Invalid currency"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("groupId").optional().isMongoId().withMessage("Invalid group ID format"),

  body("type")
    .optional()
    .isIn(["settlement", "request", "direct_payment"])
    .withMessage("Invalid payment type"),

  body("paymentMethod")
    .optional()
    .isIn(["mobile_money", "bank_transfer", "cash", "other"])
    .withMessage("Invalid payment method"),
];

/**
 * Validation rules for payment status update
 */
const validatePaymentStatusUpdate = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "sent", "received", "completed", "failed", "cancelled"])
    .withMessage("Invalid status"),
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateRefreshToken,
  validateLogout,
  validateProfileUpdate,
  validatePasswordChange,
  validateGroupCreation,
  validateGroupUpdate,
  validateAddMember,
  validateExpenseCreation,
  validateExpenseUpdate,
  validatePaymentCreation,
  validatePaymentStatusUpdate,
};
