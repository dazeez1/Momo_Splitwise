import React from "react";
import {
  X,
  Bell,
  Users,
  DollarSign,
  CreditCard,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import { formatDistanceToNow } from "date-fns";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
  } = useSocket();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "group_invitation":
        return <Users className="h-5 w-5 text-blue-600" />;
      case "expense_added":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-yellow-600" />;
      case "debt_settled":
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "group_invitation":
        return "bg-blue-50 border-blue-200";
      case "expense_added":
        return "bg-green-50 border-green-200";
      case "payment":
        return "bg-yellow-50 border-yellow-200";
      case "debt_settled":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {!isConnected && (
                <Loader2 className="h-3 w-3 animate-spin text-red-500" />
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={clearNotifications}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="h-[calc(100vh-160px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 text-sm">
                You're all caught up! We'll notify you when something new
                happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    notification.read
                      ? "bg-white hover:bg-gray-50"
                      : `bg-white hover:shadow-sm ${getNotificationColor(
                          notification.type
                        )}`
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              notification.read
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;
