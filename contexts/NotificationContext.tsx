import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

export interface NotificationType {
  id: number;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationType[];
  addNotification: (title: string, message: string, duration?: number) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = useCallback((title: string, message: string, duration?: number) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, title, message, duration }]);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};