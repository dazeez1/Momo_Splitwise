import type { User, Group, Expense } from '../types';

export const sampleUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phoneNumber: '+254712345678',
    password: 'password123',
  },
  {
    id: '2', 
    name: 'Bob Smith',
    email: 'bob@example.com',
    phoneNumber: '+254723456789',
    password: 'password123',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com', 
    phoneNumber: '+254734567890',
    password: 'password123',
  },
];

export const sampleGroups: Group[] = [
  {
    id: '1',
    name: 'Roommates',
    description: 'Shared apartment expenses',
    members: ['1', '2', '3'],
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    currency: 'KES',
  },
  {
    id: '2',
    name: 'Weekend Trip',
    description: 'Mombasa weekend getaway', 
    members: ['1', '2'],
    createdBy: '2',
    createdAt: new Date('2024-02-01'),
    currency: 'KES',
  },
];

export const sampleExpenses: Expense[] = [
  {
    id: '1',
    description: 'January Rent',
    amount: 45000,
    currency: 'KES',
    paidBy: '1',
    splitType: 'equal',
    splits: [
      { userId: '1', amount: 15000 },
      { userId: '2', amount: 15000 },
      { userId: '3', amount: 15000 },
    ],
    createdAt: new Date('2024-01-05'),
    groupId: '1',
    category: 'utilities',
  },
  {
    id: '2',
    description: 'Groceries',
    amount: 7500,
    currency: 'KES', 
    paidBy: '2',
    splitType: 'equal',
    splits: [
      { userId: '1', amount: 2500 },
      { userId: '2', amount: 2500 },
      { userId: '3', amount: 2500 },
    ],
    createdAt: new Date('2024-01-12'),
    groupId: '1',
    category: 'food',
  },
];

export const initializeSampleData = () => {
  if (!localStorage.getItem('momo_splitwise_users')) {
    localStorage.setItem('momo_splitwise_users', JSON.stringify(sampleUsers));
  }
  if (!localStorage.getItem('momo_splitwise_groups')) {
    localStorage.setItem('momo_splitwise_groups', JSON.stringify(sampleGroups));
  }
  if (!localStorage.getItem('momo_splitwise_expenses')) {
    localStorage.setItem('momo_splitwise_expenses', JSON.stringify(sampleExpenses));
  }
};