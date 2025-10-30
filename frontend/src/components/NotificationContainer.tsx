import React from "react";
import Notification from "./Notification";

interface NotificationItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  removeNotification: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  removeNotification,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <div className="flex flex-col items-end space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
