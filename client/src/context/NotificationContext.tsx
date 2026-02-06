import { createContext, useContext, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

interface NotificationContextType {
  notifications: string[];
  addNotification: (msg: string) => void;
  clearNotifications: () => void;   
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (msg: string) => {
    // ✅ Show toast popup
    toast.success(msg);

    // ✅ Add to persistent bell notifications
    setNotifications((prev) => [msg, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast("Notifications cleared"); // optional toast feedback
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};
