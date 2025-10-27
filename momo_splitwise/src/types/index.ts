export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
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
  splitType: 'equal' | 'percentage' | 'exact'; // Changed from 'custom' to 'exact'
  splits: ExpenseSplit[];
  createdAt: string; // Changed from Date to string
  groupId: string;
  category: string;
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

export interface RegistrationData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string; // Added missing confirmPassword
}

export interface AppContextType {
  // ... existing properties ...
  simplifyDebts: (groupId: string) => Debt[];
  getGroupExpenses: (groupId: string) => Expense[];
  getExpenseReport: (groupId?: string) => any;
  calculateBalances: (groupId: string) => Balance[];
}