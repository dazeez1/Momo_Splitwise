// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Group types
export interface ExpenseGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberEmails: string[];
}

// Expense types
export interface Expense {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splits: ExpenseSplit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface CreateExpenseRequest {
  groupId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splits: Omit<ExpenseSplit, 'userId'>[];
}

// Payment types
export interface Payment {
  id: string;
  expenseId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  expenseId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Mobile Money types
export interface MobileMoneyPayment {
  id: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

export interface MobileMoneyPaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
}
