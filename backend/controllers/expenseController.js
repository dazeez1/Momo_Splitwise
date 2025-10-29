const Expense = require("../models/Expense");
const Group = require("../models/Group");
const { validationResult } = require("express-validator");

/**
 * Get all expenses for the authenticated user
 */
exports.getUserExpenses = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;

    // Find expenses where user is either the payer or a participant
    const expenses = await Expense.find({
      isActive: true,
      $or: [{ paidBy: userId }, { "splits.userId": userId }],
    })
      .populate("paidBy", "name email")
      .populate("groupId", "name currency")
      .populate("splits.userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { expenses },
      message: "Expenses retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting expenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses",
      error: error.message,
    });
  }
};

/**
 * Get a single expense by ID
 */
exports.getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.userId || req.user._id;

    const expense = await Expense.findOne({
      _id: expenseId,
      isActive: true,
    })
      .populate("paidBy", "name email")
      .populate("groupId", "name currency")
      .populate("splits.userId", "name email");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if user is in the group
    const group = await Group.findById(expense.groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this expense",
      });
    }

    res.status(200).json({
      success: true,
      data: { expense },
      message: "Expense retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve expense",
      error: error.message,
    });
  }
};

/**
 * Create a new expense
 */
exports.createExpense = async (req, res) => {
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
      description,
      amount,
      currency,
      category,
      groupId,
      splitType,
      splits,
      paidBy,
    } = req.body;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Use provided paidBy or default to current user
    const payerId = paidBy || userId;

    // Validate payer is a group member
    if (!group.members.includes(payerId)) {
      return res.status(400).json({
        success: false,
        message: "Payer must be a group member",
      });
    }

    // Process splits based on split type
    let processedSplits = splits;
    if (splitType === "equal" && splits && splits.length > 0) {
      const amountPerPerson = amount / splits.length;
      processedSplits = splits.map((split) => ({
        userId: split.userId || split,
        amount: parseFloat(amountPerPerson.toFixed(2)),
      }));
    } else if (splitType === "percentage" && splits && splits.length > 0) {
      // Process percentage splits
      processedSplits = splits.map((split) => {
        const splitAmount = (amount * (split.percentage || 0)) / 100;
        return {
          userId: split.userId,
          amount: parseFloat(splitAmount.toFixed(2)),
          percentage: split.percentage,
        };
      });

      // Adjust the last split to compensate for rounding errors
      const totalAmount = processedSplits.reduce(
        (sum, split) => sum + split.amount,
        0
      );
      const difference = amount - totalAmount;
      if (Math.abs(difference) > 0.01 && processedSplits.length > 0) {
        processedSplits[processedSplits.length - 1].amount = parseFloat(
          (
            processedSplits[processedSplits.length - 1].amount + difference
          ).toFixed(2)
        );
      }
    }

    const expense = new Expense({
      description,
      amount,
      currency: currency || group.currency,
      category,
      groupId,
      splitType,
      splits: processedSplits,
      paidBy: payerId,
      createdBy: userId, // Track who created the expense
    });

    await expense.save();

    // Populate the expense
    await expense.populate("paidBy", "name email");
    await expense.populate("createdBy", "name email");
    await expense.populate("groupId", "name currency");
    await expense.populate("splits.userId", "name email");

    res.status(201).json({
      success: true,
      data: { expense },
      message: "Expense created successfully",
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

/**
 * Update an expense
 */
exports.updateExpense = async (req, res) => {
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

    const { expenseId } = req.params;
    const userId = req.userId || req.user._id;
    const updateData = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if user is in the group
    const group = await Group.findById(expense.groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this expense",
      });
    }

    // Only the creator of the expense can edit it
    // Check if user is the creator (not the payer)
    if (
      expense.createdBy &&
      expense.createdBy.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the person who created this expense can edit it",
      });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        expense[key] = updateData[key];
      }
    });

    await expense.save();

    // Populate the expense
    await expense.populate("paidBy", "name email");
    await expense.populate("createdBy", "name email");
    await expense.populate("groupId", "name currency");
    await expense.populate("splits.userId", "name email");

    res.status(200).json({
      success: true,
      data: { expense },
      message: "Expense updated successfully",
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message,
    });
  }
};

/**
 * Delete an expense
 */
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.userId || req.user._id;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if user is in the group
    const group = await Group.findById(expense.groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this expense",
      });
    }

    // Soft delete
    expense.isActive = false;
    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

/**
 * Get all expenses for a specific group
 */
exports.getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId || req.user._id;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      groupId,
      isActive: true,
    })
      .populate("paidBy", "name email")
      .populate("splits.userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { expenses },
      message: "Group expenses retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting group expenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve group expenses",
      error: error.message,
    });
  }
};
