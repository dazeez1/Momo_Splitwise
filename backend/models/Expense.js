const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      required: true,
      default: "RWF",
      enum: ["RWF", "USD", "EUR", "KES", "UGX", "TZS"],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "food",
        "utilities",
        "transport",
        "entertainment",
        "shopping",
        "healthcare",
        "education",
        "travel",
        "other",
      ],
      default: "other",
    },
    splitType: {
      type: String,
      enum: ["equal", "percentage", "exact"],
      default: "equal",
      required: true,
    },
    splits: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
expenseSchema.index({ groupId: 1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ isActive: 1 });
expenseSchema.index({ "splits.userId": 1 });

// Validate that splits match the total amount based on split type
expenseSchema.pre("save", function (next) {
  if (this.splitType === "equal") {
    // Equal split - divide by number of participants
    const amountPerPerson = this.amount / this.splits.length;
    this.splits.forEach((split) => {
      split.amount = parseFloat(amountPerPerson.toFixed(2));
    });
  } else if (this.splitType === "exact") {
    // Exact amounts specified
    const totalSplit = this.splits.reduce(
      (sum, split) => sum + split.amount,
      0
    );
    if (Math.abs(totalSplit - this.amount) > 0.01) {
      return next(
        new Error("Split amounts must equal the total expense amount")
      );
    }
  }

  next();
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
