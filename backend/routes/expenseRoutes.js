const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  validateExpenseCreation,
  validateExpenseUpdate,
} = require("../middleware/validationMiddleware");
const expenseController = require("../controllers/expenseController");

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for the authenticated user
 * @access  Private
 */
router.get("/", authenticateToken, expenseController.getUserExpenses);

/**
 * @route   GET /api/expenses/:expenseId
 * @desc    Get a single expense by ID
 * @access  Private
 */
router.get("/:expenseId", authenticateToken, expenseController.getExpenseById);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post(
  "/",
  authenticateToken,
  validateExpenseCreation,
  expenseController.createExpense
);

/**
 * @route   PUT /api/expenses/:expenseId
 * @desc    Update an expense
 * @access  Private
 */
router.put(
  "/:expenseId",
  authenticateToken,
  validateExpenseUpdate,
  expenseController.updateExpense
);

/**
 * @route   DELETE /api/expenses/:expenseId
 * @desc    Delete an expense
 * @access  Private
 */
router.delete(
  "/:expenseId",
  authenticateToken,
  expenseController.deleteExpense
);

/**
 * @route   GET /api/expenses/group/:groupId
 * @desc    Get all expenses for a specific group
 * @access  Private
 */
router.get(
  "/group/:groupId",
  authenticateToken,
  expenseController.getGroupExpenses
);

module.exports = router;
