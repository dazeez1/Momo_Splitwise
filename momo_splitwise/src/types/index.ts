export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string; // User ID
  splitType: 'equal' | 'percentage' | 'custom';
  splits: Split[];
  createdAt: Date;
  groupId: string;
  category: string;
}

export interface Split {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[]; // User IDs
  createdBy: string;
  createdAt: Date;
  currency: string;
}

export interface Balance {
  userId: string;
  amount: number;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AppContextType {
  groups: Group[];
  expenses: Expense[];
  users: User[];
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Group;
  addUserToGroup: (groupId: string, userId: string) => void;
  getGroupExpenses: (groupId: string) => Expense[];
  calculateBalances: (groupId: string) => Map<string, number>;
  simplifyDebts: (groupId: string) => Debt[];
  getExpenseReport: (groupId: string) => {
    totalExpenses: number;
    expenseCount: number;
    categoryBreakdown: Record<string, number>;
    memberContributions: Record<string, number>;
  };
}