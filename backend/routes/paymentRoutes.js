const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  validatePaymentCreation,
  validatePaymentStatusUpdate,
} = require("../middleware/validationMiddleware");
const paymentController = require("../controllers/paymentController");

/**
 * @route   GET /api/payments
 * @desc    Get all payments for the authenticated user
 * @access  Private
 */
router.get("/", authenticateToken, paymentController.getUserPayments);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get a single payment by ID
 * @access  Private
 */
router.get("/:paymentId", authenticateToken, paymentController.getPaymentById);

/**
 * @route   POST /api/payments
 * @desc    Create a new payment
 * @access  Private
 */
router.post(
  "/",
  authenticateToken,
  validatePaymentCreation,
  paymentController.createPayment
);

/**
 * @route   PUT /api/payments/:paymentId/status
 * @desc    Update payment status
 * @access  Private
 */
router.put(
  "/:paymentId/status",
  authenticateToken,
  validatePaymentStatusUpdate,
  paymentController.updatePaymentStatus
);

/**
 * @route   DELETE /api/payments/:paymentId
 * @desc    Delete a payment (soft delete)
 * @access  Private
 */
router.delete(
  "/:paymentId",
  authenticateToken,
  paymentController.deletePayment
);

module.exports = router;
