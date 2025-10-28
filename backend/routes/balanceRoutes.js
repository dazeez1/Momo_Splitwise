const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const balanceController = require("../controllers/balanceController");

/**
 * @route   GET /api/balances/group/:groupId
 * @desc    Get balances for a specific group
 * @access  Private
 */
router.get(
  "/group/:groupId",
  authenticateToken,
  balanceController.getGroupBalances
);

/**
 * @route   GET /api/balances/group/:groupId/simplify
 * @desc    Get simplified debts for a specific group
 * @access  Private
 */
router.get(
  "/group/:groupId/simplify",
  authenticateToken,
  balanceController.getSimplifiedDebts
);

module.exports = router;
