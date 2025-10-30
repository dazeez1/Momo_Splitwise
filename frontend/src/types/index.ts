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
  createdAt: string; // Changed from Date to string
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: string; // Changed from Date to string
  currency: string;
  color: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  createdBy?: string; // Track who created the expense
  splitType: "equal" | "percentage" | "exact"; // Changed from 'custom' to 'exact'
  splits: ExpenseSplit[];
  createdAt: string; // Changed from Date to string
  groupId: string;
  category: string;
  isSettled?: boolean; // Computed: true when all debts from this expense are settled
}

export interface Balance {
  userId: string;
  balance: number;
  currency: string;
  groupId: string; // Added missing groupId
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
  currency: string;
  groupId?: string; // Added optional groupId
  groupName?: string;
}

export interface Payment {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description?: string;
  groupId?: string;
  type: "settlement" | "request" | "direct_payment";
  status:
    | "pending"
    | "sent"
    | "received"
    | "completed"
    | "failed"
    | "cancelled";
  paymentMethod?: "mobile_money" | "bank_transfer" | "cash" | "other";
  fromMobileMoney?: string;
  toMobileMoney?: string;
  sentAt?: string;
  receivedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string; // Added missing confirmPassword
}

export interface AppContextType {
  // State
  groups: Group[];
  expenses: Expense[];
  payments: Payment[];
  users: User[];
  currentGroup: Group | null;
  balances: Balance[];

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
