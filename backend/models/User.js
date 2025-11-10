const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Please provide a valid phone number'
    ]
  },
  mobileMoneyNumber: {
    type: String,
    trim: true,
    default: null
  },
  mobileMoneyProvider: {
    type: String,
    enum: ['MTN', 'Airtel', 'SPENN', 'Bank', 'Other'],
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  preferences: {
    currency: {
      type: String,
      default: 'RWF',
      enum: ['RWF', 'USD', 'EUR', 'KES', 'UGX', 'TZS']
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'fr', 'sw']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      paymentReminders: {
        type: Boolean,
        default: true
      },
      expenseUpdates: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
      },
      expenseVisibility: {
        type: String,
        enum: ['public', 'group', 'private'],
        default: 'group'
      },
      allowFriendRequests: {
        type: Boolean,
        default: true
      }
    },
    timezone: {
      type: String,
      default: 'Africa/Kigali'
    },
    compactView: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d' // Refresh tokens expire in 7 days
    }
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for better query performance (unique fields already have indexes)
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Instance method to add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  return this.save();
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
  return this.save();
};

// Static method to find user by email or phone
userSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phoneNumber: identifier }
    ]
  });
};

// Static method to check if email exists
userSchema.statics.emailExists = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to check if phone exists
userSchema.statics.phoneExists = function(phoneNumber) {
  return this.findOne({ phoneNumber });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
