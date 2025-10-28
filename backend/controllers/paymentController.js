const Payment = require("../models/Payment");
const User = require("../models/User");
const Group = require("../models/Group");
const { validationResult } = require("express-validator");
const {
  sendPaymentRequestEmail,
  sendPaymentCompletedEmail,
} = require("../services/emailService");

/**
 * Get all payments for the authenticated user
 */
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;

    const payments = await Payment.find({
      isActive: true,
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .populate("fromUserId", "name email phoneNumber")
      .populate("toUserId", "name email phoneNumber")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { payments },
      message: "Payments retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payments",
      error: error.message,
    });
  }
};

/**
 * Get a single payment by ID
 */
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId || req.user._id;

    const payment = await Payment.findOne({
      _id: paymentId,
      isActive: true,
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .populate("fromUserId", "name email phoneNumber")
      .populate("toUserId", "name email phoneNumber")
      .populate("groupId", "name");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { payment },
      message: "Payment retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment",
      error: error.message,
    });
  }
};

/**
 * Create a new payment
 */
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        code: "VALIDATION_ERROR",
      });
    }

    const userId = req.userId || req.user._id;
    const {
      toUserId,
      amount,
      currency,
      description,
      groupId,
      type,
      paymentMethod,
    } = req.body;

    // Verify users exist
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Create payment
    const payment = new Payment({
      fromUserId: userId,
      toUserId,
      amount,
      currency,
      description,
      groupId,
      type: type || "settlement",
      paymentMethod: paymentMethod || "mobile_money",
      status: "pending",
    });

    await payment.save();

    // Populate the payment
    await payment.populate("fromUserId", "name email");
    await payment.populate("toUserId", "name email");
    await payment.populate("groupId", "name");

    // Emit Socket.io notification if in a group
    if (groupId) {
      const emitNotification = req.app.get("emitNotification");
      if (emitNotification) {
        emitNotification(toUserId, "payment_request", {
          message: `${req.user?.name || "Someone"} sent you a payment request`,
          paymentId: payment._id,
          amount,
          currency,
          groupId,
        });
      }
    }

    // Send payment request email (fire and forget)
    try {
      const recipient = await User.findById(toUserId);
      const group = groupId ? await Group.findById(groupId) : null;
      if (recipient) {
        await sendPaymentRequestEmail(recipient, payment, req.user, group);
      }
    } catch (error) {
      console.error("Failed to send payment request email:", error);
    }

    res.status(201).json({
      success: true,
      data: { payment },
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

/**
 * Update payment status
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId || req.user._id;
    const { status } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Authorization logic
    const isPayer = payment.fromUserId.toString() === userId.toString();
    const isRecipient = payment.toUserId.toString() === userId.toString();

    // Sender can mark as "sent"
    // Recipient can mark as "received" or "completed"
    if (status === "sent" && !isPayer) {
      return res.status(403).json({
        success: false,
        message: "Only the sender can mark payment as sent",
      });
    }

    if ((status === "received" || status === "completed") && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can update payment status",
      });
    }

    // Update status
    const previousStatus = payment.status;
    payment.status = status;

    // Set timestamps based on status
    if (status === "sent") {
      payment.sentAt = new Date();
    } else if (status === "received") {
      payment.receivedAt = new Date();
    } else if (status === "completed") {
      payment.completedAt = new Date();
    }

    await payment.save();

    // Populate the payment
    await payment.populate("fromUserId", "name email");
    await payment.populate("toUserId", "name email");
    await payment.populate("groupId", "name");

    // Emit Socket.io notifications based on status
    const emitNotification = req.app.get("emitNotification");
    if (emitNotification) {
      const payerName = payment.fromUserId.name || "Sender";
      const recipientName = payment.toUserId.name || "Recipient";
      const payerId = payment.fromUserId._id || payment.fromUserId;
      const recipientId = payment.toUserId._id || payment.toUserId;

      if (status === "sent" && previousStatus !== "sent") {
        // Notify recipient that payment was sent
        emitNotification(recipientId, "payment_sent", {
          type: "payment_sent",
          title: "Payment Sent",
          message: `${payerName} sent you ${payment.amount} ${payment.currency}. Please confirm when received.`,
          paymentId: payment._id,
          groupId: payment.groupId?._id || payment.groupId,
          amount: payment.amount,
          currency: payment.currency,
        });
      } else if (status === "received" && previousStatus !== "received") {
        // Auto-complete when received is confirmed
        payment.status = "completed";
        payment.completedAt = new Date();
        await payment.save();

        // Notify both parties that payment is completed
        emitNotification(payerId, "payment_completed", {
          type: "payment_completed",
          title: "Payment Completed",
          message: `${recipientName} confirmed receipt and completed your payment of ${payment.amount} ${payment.currency}`,
          paymentId: payment._id,
          groupId: payment.groupId?._id || payment.groupId,
          amount: payment.amount,
          currency: payment.currency,
        });

        emitNotification(recipientId, "payment_completed", {
          type: "payment_completed",
          title: "Payment Completed",
          message: `Payment of ${payment.amount} ${payment.currency} from ${payerName} has been completed`,
          paymentId: payment._id,
          groupId: payment.groupId?._id || payment.groupId,
          amount: payment.amount,
          currency: payment.currency,
        });
      } else if (status === "completed" && previousStatus !== "completed") {
        // Notify both parties that payment is completed
        emitNotification(payerId, "payment_completed", {
          type: "payment_completed",
          title: "Payment Completed",
          message: `${recipientName} marked your payment of ${payment.amount} ${payment.currency} as completed`,
          paymentId: payment._id,
          groupId: payment.groupId?._id || payment.groupId,
          amount: payment.amount,
          currency: payment.currency,
        });

        emitNotification(recipientId, "payment_completed", {
          type: "payment_completed",
          title: "Payment Marked Complete",
          message: `Payment of ${payment.amount} ${payment.currency} completed`,
          paymentId: payment._id,
          groupId: payment.groupId?._id || payment.groupId,
          amount: payment.amount,
          currency: payment.currency,
        });

        // Send completion emails (fire and forget)
        try {
          const payer = await User.findById(payment.fromUserId);
          const recipient = await User.findById(payment.toUserId);
          const group = payment.groupId
            ? await Group.findById(payment.groupId)
            : null;

          if (payer) {
            await sendPaymentCompletedEmail(payer, payment, recipient, group);
          }
        } catch (error) {
          console.error("Failed to send payment completed email:", error);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: { payment },
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

/**
 * Delete a payment (soft delete)
 */
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId || req.user._id;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Only sender can delete payment
    if (payment.fromUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the sender can delete this payment",
      });
    }

    // Soft delete
    payment.isActive = false;
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};
