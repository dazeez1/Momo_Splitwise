import { User, Group, Expense } from "../types";

export const sampleUsers: (User & {
  password: string;
  confirmPassword: string;
})[] = [
  {
    id: "1",
    name: "Daniel Iryivuze",
    email: "alice@example.com",
    phoneNumber: "+250712345678",
    password: "password123",
    confirmPassword: "password123",
    createdAt: "2025-01-01T00:00:00.000Z", // Changed from Date to string
  },
  {
    id: "2",
    name: "Azeez Damilare Gbenga",
    email: "bob@example.com",
    phoneNumber: "+250723456789",
    password: "password123",
    confirmPassword: "password123",
    createdAt: "2025-01-01T00:00:00.000Z", // Changed from Date to string
  },
  {
    id: "3",
    name: "Stella Remember",
    email: "charlie@example.com",
    phoneNumber: "+250734567890",
    password: "password123",
    confirmPassword: "password123",
    createdAt: "2025-01-01T00:00:00.000Z", // Changed from Date to string
  },
];

export const sampleGroups: Group[] = [
  {
    id: "1",
    name: "Roommates",
    description: "Shared apartment expenses",
    members: ["1", "2", "3"],
    createdBy: "1",
    createdAt: "2025-01-15T00:00:00.000Z", // Changed from Date to string
    currency: "RWF",
    color: "bg-linear-to-br  from-yellow-700-400 to-yellow-700-400",
  },
  {
    id: "2",
    name: "Weekend Trip",
    description: "Mombasa weekend getaway",
    members: ["1", "2"],
    createdBy: "2",
    createdAt: "2025-02-01T00:00:00.000Z", // Changed from Date to string
    currency: "RWF",
    color: "bg-linear-to-br  from-gold-400 to-orange-400",
  },
];

export const sampleExpenses: Expense[] = [
  {
    id: "1",
    description: "January Rent",
    amount: 45000,
    currency: "RWF",
    paidBy: "1",
    splitType: "equal",
    splits: [
      { userId: "1", amount: 15000 },
      { userId: "2", amount: 15000 },
      { userId: "3", amount: 15000 },
    ],
    createdAt: "2025-01-05T00:00:00.000Z", // Changed from Date to string
    groupId: "1",
    category: "utilities",
  },
  {
    id: "2",
    description: "Groceries",
    amount: 7500,
    currency: "RWF",
    paidBy: "2",
    splitType: "equal",
    splits: [
      { userId: "1", amount: 2500 },
      { userId: "2", amount: 2500 },
      { userId: "3", amount: 2500 },
    ],
    createdAt: "2025-01-12T00:00:00.000Z", // Changed from Date to string
    groupId: "1",
    category: "food",
  },
];

export const initializeSampleData = () => {
  if (!localStorage.getItem("momo_splitwise_users")) {
    localStorage.setItem("momo_splitwise_users", JSON.stringify(sampleUsers));
  }
  if (!localStorage.getItem("momo_splitwise_groups")) {
    localStorage.setItem("momo_splitwise_groups", JSON.stringify(sampleGroups));
  }
  if (!localStorage.getItem("momo_splitwise_expenses")) {
    localStorage.setItem(
      "momo_splitwise_expenses",
      JSON.stringify(sampleExpenses)
    );
  }
};