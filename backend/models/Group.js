const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "RWF",
      enum: ["RWF", "USD", "EUR", "KES", "UGX", "TZS"],
    },
    color: {
      type: String,
      default: "bg-gradient-to-r from-yellow-600 to-yellow-700",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
groupSchema.index({ createdBy: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ isActive: 1 });

// Virtual for member count
groupSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Method to check if user is a member
groupSchema.methods.isMember = function (userId) {
  return this.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );
};

// Method to add member
groupSchema.methods.addMember = function (userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
    return true;
  }
  return false;
};

// Method to remove member
groupSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(
    (memberId) => memberId.toString() !== userId.toString()
  );
};

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
