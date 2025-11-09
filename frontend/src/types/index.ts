export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
  profilePicture?: string;
  preferences?: {
    currency?: string;
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      paymentReminders?: boolean;
      expenseUpdates?: boolean;
    };
    privacy?: {
      profileVisibility?: string;
      expenseVisibility?: string;
      allowFriendRequests?: boolean;
    };
    compactView?: boolean;
  };
  createdAt: string;
}

// Remove the duplicate Group interface and use APIGroup consistently
export interface Group {
  id: string;
  name: string;
  members: string[];
  memberEmails?: string[];
  createdBy: string;
  createdAt: string;
  currency: string;
  color?: string;
  description?: string; // Added description field
}

// Remove APIGroup or make it consistent with Group
export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

// Define valid categories and split types for better type safety
export type ExpenseCategory = 
  | "food" 
  | "transport" 
  | "entertainment" 
  | "utilities" 
  | "shopping" 
  | "healthcare" 
  | "travel" 
  | "other";

export type SplitType = "equal" | "percentage" | "exact";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  createdBy?: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
  createdAt: string;
  groupId: string;
  category: ExpenseCategory;
  isSettled?: boolean;
}

export interface Balance {
  userId: string;
  balance: number;
  currency: string;
  groupId: string;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
  currency: string;
  groupId?: string;
  groupName?: string;
  expenseId?: string; // Added to track which expense this debt comes from
}

// Define enums for better type safety
export type PaymentRequestType = "settlement" | "request" | "direct_payment";
export type PaymentRequestStatus = 
  | "pending" 
  | "sent" 
  | "received" 
  | "completed" 
  | "failed" 
  | "cancelled";

export type PaymentMethod = "mobile_money" | "bank_transfer" | "cash" | "other";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description?: string;
  groupId?: string;
  type: PaymentRequestType;
  status: PaymentRequestStatus;
  paymentMethod?: PaymentMethod;
  fromMobileMoney?: string;
  toMobileMoney?: string;
  sentAt?: string;
  receivedAt?: string;
  completedAt?: string;
  createdAt: string;
  expenseId?: string; // Added to link to specific expense
}

export interface Payment {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description?: string;
  groupId?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  expenseId?: string; // Added to link to specific expense
  paymentRequestId?: string; // Added to link to payment request
}

export interface RegistrationData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

// Fix the AppContextType to use consistent types
export interface AppContextType {
  // State
  groups: Group[]; // Changed from APIGroup[] to Group[]
  expenses: Expense[];
  payments: Payment[];
  users: User[];
  currentGroup: Group | null; // Changed from APIGroup to Group
  balances: Balance[];
  debts: Debt[]; // Added missing debts array
  paymentRequests: PaymentRequest[]; // Added missing payment requests

  // Group methods
  addGroup: (group: Omit<Group, "id" | "createdAt">) => Promise<Group>;
  updateGroup: (group: Group) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  loadGroups: () => Promise<void>;

  // Expense methods
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  loadExpenses: () => Promise<void>;

  // Payment methods
  loadPayments: () => Promise<void>;
  addPayment: (payment: Omit<Payment, "id" | "createdAt">) => Promise<Payment>; // Added missing method
  updatePayment: (payment: Payment) => Promise<Payment>; // Added missing method

  // Payment Request methods
  loadPaymentRequests: () => Promise<void>;
  createPaymentRequest: (request: Omit<PaymentRequest, "id" | "createdAt">) => Promise<PaymentRequest>;
  updatePaymentRequest: (request: PaymentRequest) => Promise<PaymentRequest>;

  // User methods
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (user: User) => void;

  // Other methods
  setCurrentGroup: (group: Group | null) => void;
  simplifyDebts: (groupId: string) => Debt[];
  getGroupExpenses: (groupId: string) => Expense[];
  getExpenseReport: (groupId?: string) => any;
  calculateBalances: (groupId: string) => Balance[];
  resetToDemoData: () => void;
  clearAllData: () => void;
  syncAuthUser: (user: User) => void;
}

export type APIGroup = Group; // Now they're the same

