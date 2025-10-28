const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      required: true,
      enum: ["RWF", "USD", "EUR", "KES", "UGX", "TZS"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    type: {
      type: String,
      enum: ["settlement", "request", "direct_payment"],
      default: "settlement",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "received", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["mobile_money", "bank_transfer", "cash", "other"],
      default: "mobile_money",
    },
    fromMobileMoney: {
      type: String,
      trim: true,
    },
    toMobileMoney: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
    sentAt: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
paymentSchema.index({ fromUserId: 1 });
paymentSchema.index({ toUserId: 1 });
paymentSchema.index({ groupId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
