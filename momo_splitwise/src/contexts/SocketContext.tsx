import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useApp } from "./AppContext";

interface Notification {
  id: string;
  type:
    | "group_invitation"
    | "expense_added"
    | "payment"
    | "payment_sent"
    | "payment_received"
    | "payment_completed"
    | "debt_settled";
  title: string;
  message: string;
  groupId?: string;
  expenseId?: string;
  timestamp: Date;
  read: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { loadExpenses, loadPayments, loadGroups } = useApp();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Use refs to store the latest functions to avoid reconnections
  const loadExpensesRef = useRef(loadExpenses);
  const loadPaymentsRef = useRef(loadPayments);
  const loadGroupsRef = useRef(loadGroups);

  // Update refs when functions change
  useEffect(() => {
    loadExpensesRef.current = loadExpenses;
    loadPaymentsRef.current = loadPayments;
    loadGroupsRef.current = loadGroups;
  }, [loadExpenses, loadPayments, loadGroups]);

  useEffect(() => {
    if (!user?.id) return;

    // Initialize Socket.io connection
    // Use environment variable for Socket URL, fallback to localhost for development
    const socketURL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5001";
    const newSocket = io(socketURL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.io server");
      setIsConnected(true);

      // Join user-specific room for notifications
      newSocket.emit("join", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.io server");
      setIsConnected(false);
    });

    // Listen for group invitations
    newSocket.on("group_invitation", (data: any) => {
      console.log("📬 Group invitation received:", data);
      addNotification({
        type: "group_invitation",
        title: "Group Invitation",
        message:
          data.message ||
          `You've been invited to join ${data.groupName || "a group"}`,
        groupId: data.groupId,
      });
    });

    // Listen for expense notifications
    newSocket.on("expense_added", (data: any) => {
      console.log("💰 Expense notification received:", data);
      addNotification({
        type: "expense_added",
        title: "New Expense",
        message:
          data.message ||
          `${data.payerName || "Someone"} added a new expense: ${
            data.description || ""
          }`,
        groupId: data.groupId,
        expenseId: data.expenseId,
      });
    });

    // Listen for payment sent notifications
    newSocket.on("payment_sent", (data: any) => {
      console.log("📤 Payment sent notification received:", data);
      addNotification({
        type: "payment_sent",
        title: data.title || "Payment Sent",
        message:
          data.message ||
          "A payment has been sent. Please confirm when you receive it.",
        groupId: data.groupId,
      });
      loadPaymentsRef.current();
    });

    // Listen for payment received notifications
    newSocket.on("payment_received", (data: any) => {
      console.log("📥 Payment received notification received:", data);
      addNotification({
        type: "payment_received",
        title: data.title || "Payment Received",
        message: data.message || "A payment has been confirmed as received.",
        groupId: data.groupId,
      });
      loadPaymentsRef.current();
    });

    // Listen for payment completed notifications
    newSocket.on("payment_completed", (data: any) => {
      console.log("✅ Payment completed notification received:", data);
      addNotification({
        type: "payment_completed",
        title: data.title || "Payment Completed",
        message: data.message || "Payment completed and balances updated",
        groupId: data.groupId,
      });
      // Reload all data to update balances and reflect in expenses/groups using refs
      loadExpensesRef.current();
      loadPaymentsRef.current();
      loadGroupsRef.current();
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user?.id]); // Only depend on user.id, not the functions

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Keep only the last 50 notifications
    setNotifications((prev) => prev.slice(0, 50));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
