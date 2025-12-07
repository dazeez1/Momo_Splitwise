import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { Group, Expense, User, Balance, Debt, Payment } from "../types";
import apiService from "../services/apiService";
// REMOVED: import { useAuth } from './AuthContext';

// Simple ID generator function
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Default demo data for first-time users
const defaultUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    phoneNumber: "+250788123456",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    phoneNumber: "+250788654321",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phoneNumber: "+250788789012",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    phoneNumber: "+250788345678",
    createdAt: new Date().toISOString(),
  },
];

const defaultGroups: Group[] = [
  {
    id: "group1",
    name: "Roommates",
    description: "Apartment shared expenses",
    currency: "RWF",
    color: "bg-gradient-to-r from-yellow-600 to-yellow-700",
    members: ["user1", "user2", "user3"],
    createdBy: "user1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "group2",
    name: "Weekend Trip",
    description: "Mountain getaway expenses",
    currency: "RWF",
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    members: ["user1", "user2", "user4"],
    createdBy: "user2",
    createdAt: new Date().toISOString(),
  },
];

const defaultExpenses: Expense[] = [
  {
    id: "expense1",
    description: "Monthly Rent",
    amount: 300000,
    currency: "RWF",
    paidBy: "user1",
    splitType: "equal",
    splits: [
      { userId: "user1", amount: 100000 },
      { userId: "user2", amount: 100000 },
      { userId: "user3", amount: 100000 },
    ],
    groupId: "group1",
    category: "utilities",
    createdAt: new Date().toISOString(),
  },
  {
    id: "expense2",
    description: "Groceries",
    amount: 75000,
    currency: "RWF",
    paidBy: "user2",
    splitType: "equal",
    splits: [
      { userId: "user1", amount: 25000 },
      { userId: "user2", amount: 25000 },
      { userId: "user3", amount: 25000 },
    ],
    groupId: "group1",
    category: "food",
    createdAt: new Date().toISOString(),
  },
];

interface AppState {
  groups: Group[];
  expenses: Expense[];
  payments: Payment[];
  users: User[];
  currentGroup: Group | null;
  balances: Balance[];
}

type AppAction =
  | { type: "SET_GROUPS"; payload: Group[] }
  | { type: "ADD_GROUP"; payload: Group }
  | { type: "UPDATE_GROUP"; payload: Group }
  | { type: "DELETE_GROUP"; payload: string }
  | { type: "SET_EXPENSES"; payload: Expense[] }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "SET_PAYMENTS"; payload: Payment[] }
  | { type: "ADD_PAYMENT"; payload: Payment }
  | { type: "UPDATE_PAYMENT"; payload: Payment }
  | { type: "DELETE_PAYMENT"; payload: string }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "SET_CURRENT_GROUP"; payload: Group | null }
  | { type: "SET_BALANCES"; payload: Balance[] }
  | { type: "RESET_TO_DEMO_DATA" }
  | { type: "CLEAR_ALL_DATA" };

const initialState: AppState = {
  groups: [],
  expenses: [],
  payments: [],
  users: [],
  currentGroup: null,
  balances: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_GROUPS":
      return { ...state, groups: action.payload };
    case "ADD_GROUP":
      return { ...state, groups: [...state.groups, action.payload] };
    case "UPDATE_GROUP":
      return {
        ...state,
        groups: state.groups.map((group) =>
          group.id === action.payload.id ? action.payload : group
        ),
      };
    case "DELETE_GROUP":
      return {
        ...state,
        groups: state.groups.filter((group) => group.id !== action.payload),
        expenses: state.expenses.filter(
          (expense) => expense.groupId !== action.payload
        ),
      };
    case "SET_EXPENSES":
      return { ...state, expenses: action.payload };
    case "ADD_EXPENSE":
      return { ...state, expenses: [...state.expenses, action.payload] };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense.id !== action.payload
        ),
      };
    case "SET_PAYMENTS":
      return { ...state, payments: action.payload };
    case "ADD_PAYMENT":
      return { ...state, payments: [...state.payments, action.payload] };
    case "UPDATE_PAYMENT":
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "DELETE_PAYMENT":
      return {
        ...state,
        payments: state.payments.filter((p) => p.id !== action.payload),
      };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "ADD_USER":
      // Avoid duplicate users
      const userExists = state.users.find(
        (user) =>
          user.id === action.payload.id || user.email === action.payload.email
      );
      if (userExists) {
        return state;
      }
      return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case "SET_CURRENT_GROUP":
      return { ...state, currentGroup: action.payload };
    case "SET_BALANCES":
      return { ...state, balances: action.payload };
    case "RESET_TO_DEMO_DATA":
      return {
        ...state,
        users: defaultUsers,
        groups: defaultGroups,
        expenses: defaultExpenses,
        currentGroup: null,
        balances: [],
      };
    case "CLEAR_ALL_DATA":
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
  addGroup: (
    group: Omit<Group, "id" | "createdAt" | "createdBy"> & { memberEmails?: string[] }
  ) => Promise<Group>;
  updateGroup: (group: Group) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  loadGroups: () => Promise<void>;
  loadExpenses: () => Promise<void>;
  loadPayments: () => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  setCurrentGroup: (group: Group | null) => void;
  calculateBalances: (groupId: string) => Balance[];
  calculateBalancesFromAPI: (groupId: string) => Promise<Balance[]>;
  simplifyDebts: (groupId: string) => Debt[];
  simplifyDebtsFromAPI: (groupId: string) => Promise<Debt[]>;
  getGroupExpenses: (groupId: string) => Expense[];
  getExpenseReport: (groupId?: string) => any;
  isExpenseSettled: (expense: Expense) => boolean;
  resetToDemoData: () => void;
  clearAllData: () => void;
  syncAuthUser: (authUser: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // REMOVED: const { user: authUser } = useAuth();

  // Load groups from API
  const loadGroups = async () => {
    try {
      const response = await apiService.getGroups() as any;

      // Handle both response formats: {data: {groups}} or {groups}
      const groups = response.data?.groups || response.groups || [];

      // Transform MongoDB groups to frontend format
      const transformedGroups: Group[] = groups.map((group: any) => ({
        id: group._id,
        name: group.name,
        description: group.description || "",
        currency: group.currency,
        color: group.color,
        members: group.members ? group.members.map((m: any) => m._id || m) : [],
        createdBy: group.createdBy
          ? group.createdBy._id || group.createdBy
          : "",
        createdAt: group.createdAt,
      }));

      dispatch({ type: "SET_GROUPS", payload: transformedGroups });
    } catch (error) {
      console.error("Error loading groups:", error);
      // Fall back to empty array
      dispatch({ type: "SET_GROUPS", payload: [] });
    }
  };

  // Load users from API
  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers() as any;

      // Handle both response formats: {data: {users}} or {users}
      const users = response.data?.users || response.users || [];

      // Transform MongoDB users to frontend format
      const transformedUsers: User[] = users.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        mobileMoneyNumber: user.mobileMoneyNumber,
        mobileMoneyProvider: user.mobileMoneyProvider,
        createdAt: user.createdAt,
      }));

      dispatch({ type: "SET_USERS", payload: transformedUsers });
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load expenses from API
  const loadExpenses = async () => {
    try {
      const response = await apiService.getExpenses() as any;
      const expenses = response.data?.expenses || response.expenses || [];

      // Transform MongoDB expenses to frontend format
      const transformedExpenses: Expense[] = expenses.map((expense: any) => ({
        id: expense._id,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        paidBy: expense.paidBy?._id || expense.paidBy || "",
        createdBy: expense.createdBy?._id || expense.createdBy,
        splitType: expense.splitType,
        splits: expense.splits.map((split: any) => ({
          userId: split.userId?._id || split.userId,
          amount: split.amount,
          percentage: split.percentage,
        })),
        groupId: expense.groupId?._id || expense.groupId || "",
        category: expense.category,
        createdAt: expense.createdAt,
      }));

      dispatch({ type: "SET_EXPENSES", payload: transformedExpenses });
    } catch (error) {
      console.error("Error loading expenses:", error);
      // Fall back to empty array
      dispatch({ type: "SET_EXPENSES", payload: [] });
    }
  };

  // Load payments from API
  const loadPayments = async () => {
    try {
      const response = await apiService.getPayments() as any;
      const payments = response.data?.payments || response.payments || [];

      // Transform MongoDB payments to frontend format
      const transformedPayments: Payment[] = payments.map((payment: any) => ({
        id: payment._id,
        fromUserId: payment.fromUserId?._id || payment.fromUserId,
        toUserId: payment.toUserId?._id || payment.toUserId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        groupId: payment.groupId?._id || payment.groupId,
        type: payment.type,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        completedAt: payment.completedAt,
        createdAt: payment.createdAt,
      }));

      dispatch({ type: "SET_PAYMENTS", payload: transformedPayments });
    } catch (error) {
      console.error("Error loading payments:", error);
      dispatch({ type: "SET_PAYMENTS", payload: [] });
    }
  };

  // Load data on mount - optimized for fast parallel loading
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load critical data first in parallel for fast initial render
        const loadPromise = Promise.all([loadGroups(), loadUsers()]);

        // Load secondary data after critical data for better perceived performance
        await loadPromise;

        // Load expenses and payments in parallel after groups/users
        await Promise.all([loadExpenses(), loadPayments()]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Expenses are now loaded from API - no localStorage needed

  // REMOVED: The useEffect that depends on authUser since we can't use useAuth here
  // useEffect(() => {
  //   if (authUser) {
  //     syncAuthUser(authUser);
  //   }
  // }, [authUser]);

  const addGroup = async (
    groupData: Omit<Group, "id" | "createdAt" | "createdBy"> & { memberEmails?: string[] }
  ) => {
    try {
      console.log("Sending group data to API:", groupData);
      const response = await apiService.createGroup(groupData) as any;

      // Handle both response formats: {data: {group}} or {group}
      const group = response.data?.group || response.group;

      // Transform MongoDB group to frontend format
      const newGroup: Group = {
        id: group._id,
        name: group.name,
        description: group.description || "",
        currency: group.currency,
        color: group.color,
        members: group.members ? group.members.map((m: any) => m._id || m) : [],
        createdBy: group.createdBy
          ? group.createdBy._id || group.createdBy
          : "",
        createdAt: group.createdAt,
      };

      console.log("Adding group to state:", newGroup);
      dispatch({ type: "ADD_GROUP", payload: newGroup });
      return newGroup;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  const updateGroup = async (group: Group) => {
    try {
      const response = await apiService.updateGroup(group.id, {
        name: group.name,
        description: group.description,
        members: group.members,
        currency: group.currency,
        color: group.color,
      });

      // Transform MongoDB group to frontend format
      const updatedGroup: Group = {
        id: response.group._id,
        name: response.group.name,
        description: response.group.description || "",
        currency: response.group.currency,
        color: response.group.color,
        members: response.group.members.map((m: any) => m._id || m),
        createdBy: response.group.createdBy._id || response.group.createdBy,
        createdAt: response.group.createdAt,
      };

      dispatch({ type: "UPDATE_GROUP", payload: updatedGroup });
      return updatedGroup;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await apiService.deleteGroup(groupId);
      dispatch({ type: "DELETE_GROUP", payload: groupId });
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  };

  const addExpense = async (expenseData: Omit<Expense, "id" | "createdAt">) => {
    try {
      // Transform to API format
      const apiData = {
        description: expenseData.description,
        amount: expenseData.amount,
        currency: expenseData.currency,
        category: expenseData.category,
        groupId: expenseData.groupId,
        splitType: expenseData.splitType,
        splits: expenseData.splits.map((split) => ({
          userId: split.userId,
          amount: split.amount,
          percentage: split.percentage,
        })),
        paidBy: expenseData.paidBy,
      };

      const response = await apiService.createExpense(apiData) as any;
      const expense = response.data?.expense || response.expense;

      if (!expense || !expense._id) {
        throw new Error("Invalid response from server");
      }

      // Transform to frontend format
      const newExpense: Expense = {
        id: expense._id,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        paidBy: expense.paidBy?._id || expense.paidBy,
        createdBy: expense.createdBy?._id || expense.createdBy,
        splitType: expense.splitType,
        splits: expense.splits.map((split: any) => ({
          userId: split.userId?._id || split.userId,
          amount: split.amount,
          percentage: split.percentage,
        })),
        groupId: expense.groupId?._id || expense.groupId,
        category: expense.category,
        createdAt: expense.createdAt,
      };

      dispatch({ type: "ADD_EXPENSE", payload: newExpense });
      return newExpense;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      const apiData = {
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        splitType: expense.splitType,
        splits: expense.splits.map((split) => ({
          userId: split.userId,
          amount: split.amount,
          percentage: split.percentage,
        })),
        paidBy: expense.paidBy,
      };

      const response = await apiService.updateExpense(expense.id, apiData) as any;
      const updatedExpense = response.data?.expense || response.expense;

      if (!updatedExpense || !updatedExpense._id) {
        throw new Error("Invalid response from server");
      }

      // Transform to frontend format
      const transformedExpense: Expense = {
        id: updatedExpense._id,
        description: updatedExpense.description,
        amount: updatedExpense.amount,
        currency: updatedExpense.currency,
        paidBy: updatedExpense.paidBy?._id || updatedExpense.paidBy,
        createdBy: updatedExpense.createdBy?._id || updatedExpense.createdBy,
        splitType: updatedExpense.splitType,
        splits: updatedExpense.splits.map((split: any) => ({
          userId: split.userId?._id || split.userId,
          amount: split.amount,
          percentage: split.percentage,
        })),
        groupId: updatedExpense.groupId?._id || updatedExpense.groupId,
        category: updatedExpense.category,
        createdAt: updatedExpense.createdAt,
      };

      dispatch({ type: "UPDATE_EXPENSE", payload: transformedExpense });
      return transformedExpense;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await apiService.deleteExpense(expenseId);
      dispatch({ type: "DELETE_EXPENSE", payload: expenseId });
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  };

  const addUser = (user: User) => {
    dispatch({ type: "ADD_USER", payload: user });
  };

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  };

  const setCurrentGroup = (group: Group | null) => {
    dispatch({ type: "SET_CURRENT_GROUP", payload: group });
  };

  const syncAuthUser = (authUser: User) => {
    const existingUser = state.users.find(
      (user) => user.id === authUser.id || user.email === authUser.email
    );
    if (!existingUser) {
      addUser(authUser);
    }
  };

  const calculateBalances = (groupId: string): Balance[] => {
    const groupExpenses = state.expenses.filter(
      (expense) => expense.groupId === groupId
    );
    const balances: { [userId: string]: number } = {};

    // Initialize balances for all group members
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return [];

    group.members.forEach((memberId) => {
      balances[memberId] = 0;
    });

    // Calculate balances from expenses
    groupExpenses.forEach((expense) => {
      // Add amount paid by the payer
      balances[expense.paidBy] =
        (balances[expense.paidBy] || 0) + expense.amount;

      // Subtract amounts owed by each participant
      expense.splits.forEach((split) => {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      });
    });

    // Adjust balances based on completed payments
    const completedPayments = state.payments.filter((payment: any) => {
      const paymentGroupId =
        typeof payment.groupId === "string"
          ? payment.groupId
          : (payment.groupId as any)?.id || (payment.groupId as any)?._id || payment.groupId;

      return (
        payment.status === "completed" &&
        (paymentGroupId === groupId ||
          paymentGroupId === "direct" ||
          paymentGroupId === "")
      );
    });

    completedPayments.forEach((payment) => {
      // If payment is from User A to User B, it reduces A's debt to B
      // This means A's balance should increase (less negative, less debt to B)
      // and B's balance should decrease (less positive, less credit from A)

      // Add to payer's balance (reduces their debt)
      balances[payment.fromUserId] =
        (balances[payment.fromUserId] || 0) + payment.amount;

      // Subtract from recipient's balance (reduces their credit)
      balances[payment.toUserId] =
        (balances[payment.toUserId] || 0) - payment.amount;
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
    balances.forEach((balance) => {
      if (balance.balance > 0.01) {
        creditors.push(balance);
      } else if (balance.balance < -0.01) {
        debtors.push({ ...balance, balance: Math.abs(balance.balance) });
      }
    });

    const debts: Debt[] = [];

    // Simple debt simplification algorithm
    creditors.forEach((creditor) => {
      debtors.forEach((debtor) => {
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
    return state.expenses.filter((expense) => expense.groupId === groupId);
  };

  // API-based balance calculation (preferred)
  const calculateBalancesFromAPI = async (
    groupId: string
  ): Promise<Balance[]> => {
    try {
      const response = await apiService.getGroupBalances(groupId);
      return response.balances || [];
    } catch (error) {
      console.error("Error fetching balances from API:", error);
      // Fall back to frontend calculation
      return calculateBalances(groupId);
    }
  };

  // API-based debt simplification (preferred)
  const simplifyDebtsFromAPI = async (groupId: string): Promise<Debt[]> => {
    try {
      const response = await apiService.getSimplifiedDebts(groupId);
      return response.debts || [];
    } catch (error) {
      console.error("Error fetching debts from API:", error);
      // Fall back to frontend calculation
      return simplifyDebts(groupId);
    }
  };

  const isExpenseSettled = (expense: Expense): boolean => {
    // Get balances after accounting for completed payments
    const balances = calculateBalances(expense.groupId);

    // Get the group to get all members
    const group = state.groups.find((g) => g.id === expense.groupId);
    if (!group) return false;

    // Check if all members who should pay for this expense have zero or positive balance
    // This means they've either paid their share or don't owe anything
    const settled = expense.splits.every((split) => {
      const userBalance = balances.find((b) => b.userId === split.userId);

      if (userBalance) {
        // If the user's balance is zero or positive (within tolerance), they've settled
        // Positive balance means they've paid more than they owe
        // Zero balance means they've paid exactly what they owe
        return userBalance.balance >= -0.01;
      }

      return true; // If no balance found, consider settled
    });

    return settled;
  };

  const getExpenseReport = (groupId?: string) => {
    let filteredExpenses = state.expenses;

    if (groupId) {
      filteredExpenses = state.expenses.filter(
        (expense) => expense.groupId === groupId
      );
    }

    // Generate basic report data
    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyBreakdown = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const averageExpense =
      filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

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
    dispatch({ type: "RESET_TO_DEMO_DATA" });
  };

  const clearAllData = () => {
    dispatch({ type: "CLEAR_ALL_DATA" });
  };

  const value: AppContextType = {
    ...state,
    addGroup,
    updateGroup,
    deleteGroup,
    loadGroups,
    addExpense,
    updateExpense,
    deleteExpense,
    loadExpenses,
    loadPayments,
    addUser,
    updateUser,
    setCurrentGroup,
    calculateBalances,
    calculateBalancesFromAPI,
    simplifyDebts,
    simplifyDebtsFromAPI,
    getGroupExpenses,
    getExpenseReport,
    isExpenseSettled,
    resetToDemoData,
    clearAllData,
    syncAuthUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
