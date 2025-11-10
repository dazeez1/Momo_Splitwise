const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");

/**
 * Calculate balances for a group
 * Returns: Array of balances for each member
 */
exports.getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId || req.user._id;

    // Find the group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Get all active expenses for this group
    const expenses = await Expense.find({
      groupId: group._id,
      isActive: true,
    }).populate("splits.userId", "name");

    // Initialize balances
    const balances = {};
    group.members.forEach((memberId) => {
      balances[memberId.toString()] = 0;
    });

    // Calculate balances from expenses
    expenses.forEach((expense) => {
      // Add amount paid by the payer
      balances[expense.paidBy.toString()] =
        (balances[expense.paidBy.toString()] || 0) + expense.amount;

      // Subtract amounts owed by each participant
      expense.splits.forEach((split) => {
        const splitUserId = split.userId._id
          ? split.userId._id.toString()
          : split.userId.toString();
        balances[splitUserId] = (balances[splitUserId] || 0) - split.amount;
      });
    });

    // Adjust balances based on completed payments
    const completedPayments = await Payment.find({
      $or: [{ groupId: group._id }, { groupId: null }, { groupId: undefined }],
      status: "completed",
      isActive: true,
    });

    completedPayments.forEach((payment) => {
      const fromUserId = payment.fromUserId._id
        ? payment.fromUserId._id.toString()
        : payment.fromUserId.toString();
      const toUserId = payment.toUserId._id
        ? payment.toUserId._id.toString()
        : payment.toUserId.toString();

      // If payment is from User A to User B, it reduces A's debt to B
      // Add to payer's balance (reduces their debt)
      if (balances[fromUserId] !== undefined) {
        balances[fromUserId] = balances[fromUserId] + payment.amount;
      }

      // Subtract from recipient's balance (reduces their credit)
      if (balances[toUserId] !== undefined) {
        balances[toUserId] = balances[toUserId] - payment.amount;
      }
    });

    // Convert to array format
    const balanceArray = Object.entries(balances).map(([userId, balance]) => ({
      userId,
      balance: parseFloat(balance.toFixed(2)),
      currency: group.currency,
      groupId: group._id.toString(),
    }));

    res.status(200).json({
      success: true,
      data: { balances: balanceArray },
      message: "Balances calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating balances:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate balances",
      error: error.message,
    });
  }
};

/**
 * Simplify debts for a group (reduce number of transactions)
 * Returns: Array of simplified debts
 */
exports.getSimplifiedDebts = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId || req.user._id;

    // Ensure balances are calculated using existing logic
    await this.getGroupBalances(req, res);

    // This is called internally, so we need to get the data differently
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Get balances using the same logic as getGroupBalances
    const expenses = await Expense.find({
      groupId: group._id,
      isActive: true,
    }).populate("splits.userId", "name");

    const balances = {};
    group.members.forEach((memberId) => {
      balances[memberId.toString()] = 0;
    });

    expenses.forEach((expense) => {
      balances[expense.paidBy.toString()] =
        (balances[expense.paidBy.toString()] || 0) + expense.amount;

      expense.splits.forEach((split) => {
        const splitUserId = split.userId._id
          ? split.userId._id.toString()
          : split.userId.toString();
        balances[splitUserId] = (balances[splitUserId] || 0) - split.amount;
      });
    });

    const completedPayments = await Payment.find({
      $or: [{ groupId: group._id }, { groupId: null }, { groupId: undefined }],
      status: "completed",
      isActive: true,
    });

    completedPayments.forEach((payment) => {
      const fromUserId = payment.fromUserId._id
        ? payment.fromUserId._id.toString()
        : payment.fromUserId.toString();
      const toUserId = payment.toUserId._id
        ? payment.toUserId._id.toString()
        : payment.toUserId.toString();

      if (balances[fromUserId] !== undefined) {
        balances[fromUserId] = balances[fromUserId] + payment.amount;
      }
      if (balances[toUserId] !== undefined) {
        balances[toUserId] = balances[toUserId] - payment.amount;
      }
    });

    // Separate creditors and debtors
    const creditors = [];
    const debtors = [];
    const balanceArray = Object.entries(balances).map(([userId, balance]) => ({
      userId,
      balance: parseFloat(balance.toFixed(2)),
      currency: group.currency,
      groupId: group._id.toString(),
    }));

    balanceArray.forEach((balance) => {
      if (balance.balance > 0.01) {
        creditors.push(balance);
      } else if (balance.balance < -0.01) {
        debtors.push({ ...balance, balance: Math.abs(balance.balance) });
      }
    });

    // Simple debt simplification algorithm
    const debts = [];
    const creditorBalances = [...creditors];
    const debtorBalances = [...debtors];

    creditorBalances.forEach((creditor) => {
      debtorBalances.forEach((debtor) => {
        if (creditor.balance > 0.01 && debtor.balance > 0.01) {
          const amount = Math.min(creditor.balance, debtor.balance);
          if (amount > 0.01) {
            debts.push({
              from: debtor.userId,
              to: creditor.userId,
              amount: parseFloat(amount.toFixed(2)),
              currency: creditor.currency,
              groupId: groupId,
            });

            creditor.balance -= amount;
            debtor.balance -= amount;
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      data: { debts },
      message: "Debts simplified successfully",
    });
  } catch (error) {
    console.error("Error simplifying debts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to simplify debts",
      error: error.message,
    });
  }
};
