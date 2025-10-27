import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Group, Expense, User, Balance, Debt } from '../types';

// Simple ID generator function
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

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
  | { type: 'SET_CURRENT_GROUP'; payload: Group | null }
  | { type: 'SET_BALANCES'; payload: Balance[] }
  | { type: 'UPDATE_USER'; payload: User };

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
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroup: action.payload };
    case 'SET_BALANCES':
      return { ...state, balances: action.payload };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  addGroup: (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  setCurrentGroup: (group: Group | null) => void;
  getExpenseReport: (groupId?: string, startDate?: Date, endDate?: Date) => any;
  calculateBalances: (groupId: string) => Balance[];
  simplifyDebts: (groupId: string) => Debt[];
  updateUser: (user: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('momo-splitwise-groups');
    const savedExpenses = localStorage.getItem('momo-splitwise-expenses');
    const savedUsers = localStorage.getItem('momo-splitwise-users');

    if (savedGroups) {
      dispatch({ type: 'SET_GROUPS', payload: JSON.parse(savedGroups) });
    }
    if (savedExpenses) {
      dispatch({ type: 'SET_EXPENSES', payload: JSON.parse(savedExpenses) });
    }
    if (savedUsers) {
      dispatch({ type: 'SET_USERS', payload: JSON.parse(savedUsers) });
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('momo-splitwise-groups', JSON.stringify(state.groups));
  }, [state.groups]);

  useEffect(() => {
    localStorage.setItem('momo-splitwise-expenses', JSON.stringify(state.expenses));
  }, [state.expenses]);

  useEffect(() => {
    localStorage.setItem('momo-splitwise-users', JSON.stringify(state.users));
  }, [state.users]);

  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_GROUP', payload: newGroup });
  };

  const updateGroup = (group: Group) => {
    const updatedGroup = {
      ...group,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
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

  const setCurrentGroup = (group: Group | null) => {
    dispatch({ type: 'SET_CURRENT_GROUP', payload: group });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const getExpenseReport = (groupId?: string, startDate?: Date, endDate?: Date) => {
    let filteredExpenses = state.expenses;

    if (groupId) {
      filteredExpenses = filteredExpenses.filter(expense => expense.groupId === groupId);
    }

    if (startDate) {
      filteredExpenses = filteredExpenses.filter(
        expense => new Date(expense.createdAt) >= startDate
      );
    }

    if (endDate) {
      filteredExpenses = filteredExpenses.filter(
        expense => new Date(expense.createdAt) <= endDate
      );
    }

    return {
      totalExpenses: filteredExpenses.length,
      totalAmount: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      averageExpense: filteredExpenses.length > 0 
        ? filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length
        : 0,
      categoryBreakdown: filteredExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>),
      monthlyBreakdown: filteredExpenses.reduce((acc, expense) => {
        const month = new Date(expense.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  const calculateBalances = (groupId: string): Balance[] => {
    const groupExpenses = state.expenses.filter(expense => expense.groupId === groupId);
    const group = state.groups.find(g => g.id === groupId);
    
    if (!group) return [];

    const balances: Record<string, number> = {};
    
    // Initialize balances for all group members
    group.members.forEach(memberId => {
      balances[memberId] = 0;
    });

    // Calculate net balance for each member
    groupExpenses.forEach(expense => {
      // Add the amount paid by the payer
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      
      // Subtract each member's share
      expense.splits.forEach(split => {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      });
    });

    // Convert to Balance array
    return Object.entries(balances).map(([userId, balance]) => ({
      userId,
      groupId,
      balance,
      currency: group.currency,
    }));
  };

  const simplifyDebts = (groupId: string): Debt[] => {
    const balances = calculateBalances(groupId);
    const creditors = balances.filter(b => b.balance > 0.01);
    const debtors = balances.filter(b => b.balance < -0.01);
    
    const debts: Debt[] = [];

    creditors.forEach(creditor => {
      debtors.forEach(debtor => {
        if (Math.abs(creditor.balance) < 0.01 || Math.abs(debtor.balance) < 0.01) return;

        const amount = Math.min(creditor.balance, -debtor.balance);
        if (amount > 0.01) {
          debts.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: parseFloat(amount.toFixed(2)),
            currency: creditor.currency,
            groupId,
          });

          creditor.balance -= amount;
          debtor.balance += amount;
        }
      });
    });

    return debts;
  };

  const value: AppContextType = {
    ...state,
    addGroup,
    updateGroup,
    deleteGroup,
    addExpense,
    updateExpense,
    deleteExpense,
    setCurrentGroup,
    getExpenseReport,
    calculateBalances,
    simplifyDebts,
    updateUser,
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