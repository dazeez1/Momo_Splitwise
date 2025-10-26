import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Group, Expense, User, Debt, AppContextType } from '../types';
import { initializeSampleData } from '../data/sampleData';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  useEffect(() => {
    // Initialize sample data
    initializeSampleData();
    
    // Load data from localStorage
    const savedGroups = localStorage.getItem('momo_splitwise_groups');
    const savedExpenses = localStorage.getItem('momo_splitwise_expenses');
    const savedUsers = localStorage.getItem('momo_splitwise_users');

    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedUsers) {
      const usersData = JSON.parse(savedUsers).map((u: any) => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      setUsers(usersData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('momo_splitwise_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('momo_splitwise_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setGroups(prev => [...prev, newGroup]);
    setCurrentGroup(newGroup);
    return newGroup;
  };

  const addUserToGroup = (groupId: string, userId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: [...group.members, userId] }
        : group
    ));
  };

  const getGroupExpenses = (groupId: string): Expense[] => {
    return expenses.filter(expense => expense.groupId === groupId);
  };

  const calculateBalances = (groupId: string): Map<string, number> => {
    const balances = new Map<string, number>();
    const groupExpenses = getGroupExpenses(groupId);

    groupExpenses.forEach(expense => {
      // Add amount to payer
      const payerBalance = balances.get(expense.paidBy) || 0;
      balances.set(expense.paidBy, payerBalance + expense.amount);
      
      // Subtract amounts from participants
      expense.splits.forEach(split => {
        const participantBalance = balances.get(split.userId) || 0;
        balances.set(split.userId, participantBalance - split.amount);
      });
    });

    return balances;
  };

  const simplifyDebts = (groupId: string): Debt[] => {
    const balances = calculateBalances(groupId);
    const debts: Debt[] = [];
    const creditors: [string, number][] = [];
    const debtors: [string, number][] = [];
    
    balances.forEach((balance, userId) => {
      if (balance > 0.01) creditors.push([userId, balance]);
      else if (balance < -0.01) debtors.push([userId, Math.abs(balance)]);
    });
    
    creditors.sort((a, b) => b[1] - a[1]);
    debtors.sort((a, b) => b[1] - a[1]);
    
    while (creditors.length > 0 && debtors.length > 0) {
      const [creditor, creditAmount] = creditors[0];
      const [debtor, debtAmount] = debtors[0];
      
      const settledAmount = Math.min(creditAmount, debtAmount);
      
      if (settledAmount > 0.01) {
        debts.push({
          from: debtor,
          to: creditor,
          amount: parseFloat(settledAmount.toFixed(2))
        });
      }
      
      if (creditAmount > debtAmount) {
        creditors[0] = [creditor, creditAmount - debtAmount];
        debtors.shift();
      } else if (debtAmount > creditAmount) {
        debtors[0] = [debtor, debtAmount - creditAmount];
        creditors.shift();
      } else {
        creditors.shift();
        debtors.shift();
      }
    }
    
    return debts;
  };

  const getExpenseReport = (groupId: string) => {
    const groupExpenses = getGroupExpenses(groupId);
    const report = {
      totalExpenses: groupExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      expenseCount: groupExpenses.length,
      categoryBreakdown: {} as Record<string, number>,
      memberContributions: {} as Record<string, number>,
    };

    groupExpenses.forEach(expense => {
      // Category breakdown
      report.categoryBreakdown[expense.category] = 
        (report.categoryBreakdown[expense.category] || 0) + expense.amount;
      
      // Member contributions (who paid)
      report.memberContributions[expense.paidBy] = 
        (report.memberContributions[expense.paidBy] || 0) + expense.amount;
    });

    return report;
  };

  const value: AppContextType = {
    groups,
    expenses,
    users,
    currentGroup,
    setCurrentGroup,
    addExpense,
    addGroup,
    addUserToGroup,
    getGroupExpenses,
    calculateBalances,
    simplifyDebts,
    getExpenseReport,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};