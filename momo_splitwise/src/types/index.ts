export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  createdAt: string; // Changed from Date to string for serialization
}

export interface Group {
  id: string;
  name: string;
  description: string;
  currency: string;
  color: string;
  members: string[];
  createdBy: string;
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splits: ExpenseSplit[];
  groupId: string;
  category: string;
  createdAt: string; // Changed from Date to string
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface Balance {
  userId: string;
  groupId: string;
  balance: number;
  currency: string;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
  currency: string;
  groupId?: string;
  groupName?: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  // createdAt is handled by the system
}