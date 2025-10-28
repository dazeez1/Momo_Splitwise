import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Group, Expense, User, Balance, Debt } from '../types';
// REMOVED: import { useAuth } from './AuthContext';

// Simple ID generator function
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Default demo data for first-time users
const defaultUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+250788123456',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    phoneNumber: '+250788654321',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phoneNumber: '+250788789012',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phoneNumber: '+250788345678',
    createdAt: new Date().toISOString(),
  }
];

const defaultGroups: Group[] = [
  {
    id: 'group1',
    name: 'Roommates',
    description: 'Apartment shared expenses',
    currency: 'RWF',
    color: 'bg-gradient-to-r from-yellow-600 to-yellow-700',
    members: ['user1', 'user2', 'user3'],
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'group2',
    name: 'Weekend Trip',
    description: 'Mountain getaway expenses',
    currency: 'RWF',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    members: ['user1', 'user2', 'user4'],
    createdBy: 'user2',
    createdAt: new Date().toISOString(),
  }
];

const defaultExpenses: Expense[] = [
  {
    id: 'expense1',
    description: 'Monthly Rent',
    amount: 300000,
    currency: 'RWF',
    paidBy: 'user1',
    splitType: 'equal',
    splits: [
      { userId: 'user1', amount: 100000 },
      { userId: 'user2', amount: 100000 },
      { userId: 'user3', amount: 100000 }
    ],
    groupId: 'group1',
    category: 'utilities',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'expense2',
    description: 'Groceries',
    amount: 75000,
    currency: 'RWF',
    paidBy: 'user2',
    splitType: 'equal',
    splits: [
      { userId: 'user1', amount: 25000 },
      { userId: 'user2', amount: 25000 },
      { userId: 'user3', amount: 25000 }
    ],
    groupId: 'group1',
    category: 'food',
    createdAt: new Date().toISOString(),
  }
];

interface AppState {
  groups: Group[];
  expenses: Expense[];
  users: User[];
  currentGroup: Group | null;
  balances: Balance[];
}

type AppAction =
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_CURRENT_GROUP'; payload: Group | null }
  | { type: 'SET_BALANCES'; payload: Balance[] }
  | { type: 'RESET_TO_DEMO_DATA' }
  | { type: 'CLEAR_ALL_DATA' };

const initialState: AppState = {
  groups: [],
  expenses: [],
  users: [],
  currentGroup: null,
  balances: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? action.payload : group
        ),
      };
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
        expenses: state.expenses.filter(expense => expense.groupId !== action.payload),
      };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      // Avoid duplicate users
      const userExists = state.users.find(user => user.id === action.payload.id || user.email === action.payload.email);
      if (userExists) {
        return state;
      }
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroup: action.payload };
    case 'SET_BALANCES':
      return { ...state, balances: action.payload };
    case 'RESET_TO_DEMO_DATA':
      return {
        ...state,
        users: defaultUsers,
        groups: defaultGroups,
        expenses: defaultExpenses,
        currentGroup: null,
        balances: [],
      };
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        users: [],
        groups: [],
        expenses: [],
        currentGroup: null,
        balances: [],
      };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  setCurrentGroup: (group: Group | null) => void;
  calculateBalances: (groupId: string) => Balance[];
  simplifyDebts: (groupId: string) => Debt[];
  getGroupExpenses: (groupId: string) => Expense[];
  getExpenseReport: (groupId?: string) => any;
  resetToDemoData: () => void;
  clearAllData: () => void;
  syncAuthUser: (authUser: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // REMOVED: const { user: authUser } = useAuth();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedUsers = localStorage.getItem('momo-splitwise-users');
        const savedGroups = localStorage.getItem('momo-splitwise-groups');
        const savedExpenses = localStorage.getItem('momo-splitwise-expenses');

        if (savedUsers && savedGroups && savedExpenses) {
          dispatch({ type: 'SET_USERS', payload: JSON.parse(savedUsers) });
          dispatch({ type: 'SET_GROUPS', payload: JSON.parse(savedGroups) });
          dispatch({ type: 'SET_EXPENSES', payload: JSON.parse(savedExpenses) });
        } else {
          // Load demo data for first-time users
          dispatch({ type: 'RESET_TO_DEMO_DATA' });
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        dispatch({ type: 'RESET_TO_DEMO_DATA' });
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('momo-splitwise-users', JSON.stringify(state.users));
    localStorage.setItem('momo-splitwise-groups', JSON.stringify(state.groups));
    localStorage.setItem('momo-splitwise-expenses', JSON.stringify(state.expenses));
  }, [state.users, state.groups, state.expenses]);

  // REMOVED: The useEffect that depends on authUser since we can't use useAuth here
  // useEffect(() => {
  //   if (authUser) {
  //     syncAuthUser(authUser);
  //   }
  // }, [authUser]);

  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_GROUP', payload: newGroup });
  };

  const updateGroup = (group: Group) => {
    dispatch({ type: 'UPDATE_GROUP', payload: group });
  };

  const deleteGroup = (groupId: string) => {
    dispatch({ type: 'DELETE_GROUP', payload: groupId });
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = (expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const deleteExpense = (expenseId: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
  };

  const addUser = (user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const setCurrentGroup = (group: Group | null) => {
    dispatch({ type: 'SET_CURRENT_GROUP', payload: group });
  };

  const syncAuthUser = (authUser: User) => {
    const existingUser = state.users.find(user => user.id === authUser.id || user.email === authUser.email);
    if (!existingUser) {
      addUser(authUser);
    }
  };

  const calculateBalances = (groupId: string): Balance[] => {
    const groupExpenses = state.expenses.filter(expense => expense.groupId === groupId);
    const balances: { [userId: string]: number } = {};

    // Initialize balances for all group members
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return [];

    group.members.forEach(memberId => {
      balances[memberId] = 0;
    });

    // Calculate balances
    groupExpenses.forEach(expense => {
      // Add amount paid by the payer
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      
      // Subtract amounts owed by each participant
      expense.splits.forEach(split => {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      });
    });

    // Convert to Balance array
    return Object.entries(balances).map(([userId, balance]) => ({
      userId,
      balance,
      currency: group.currency,
      groupId: group.id, // Added groupId to match Balance interface
    }));
  };

  const simplifyDebts = (groupId: string): Debt[] => {
    const balances = calculateBalances(groupId);
    const creditors: Balance[] = [];
    const debtors: Balance[] = [];

    // Separate creditors and debtors
    balances.forEach(balance => {
      if (balance.balance > 0.01) {
        creditors.push(balance);
      } else if (balance.balance < -0.01) {
        debtors.push({ ...balance, balance: Math.abs(balance.balance) });
      }
    });

    const debts: Debt[] = [];

    // Simple debt simplification algorithm
    creditors.forEach(creditor => {
      debtors.forEach(debtor => {
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

    return debts;
  };

  const getGroupExpenses = (groupId: string): Expense[] => {
    return state.expenses.filter(expense => expense.groupId === groupId);
  };

  const getExpenseReport = (groupId?: string) => {
    let filteredExpenses = state.expenses;
    
    if (groupId) {
      filteredExpenses = state.expenses.filter(expense => expense.groupId === groupId);
    }

    // Generate basic report data
    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyBreakdown = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

    return {
      totalExpenses: filteredExpenses.length,
      totalAmount,
      averageExpense,
      categoryBreakdown,
      monthlyBreakdown,
      expenses: filteredExpenses,
    };
  };

  const resetToDemoData = () => {
    dispatch({ type: 'RESET_TO_DEMO_DATA' });
  };

  const clearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
  };

  const value: AppContextType = {
    ...state,
    addGroup,
    updateGroup,
    deleteGroup,
    addExpense,
    updateExpense,
    deleteExpense,
    addUser,
    updateUser,
    setCurrentGroup,
    calculateBalances,
    simplifyDebts,
    getGroupExpenses,
    getExpenseReport,
    resetToDemoData,
    clearAllData,
    syncAuthUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};