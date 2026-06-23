import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface LowStockItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
}

interface NotificationState {
  notifications: Notification[];
  lowStockItems: LowStockItem[];
  unreadCount: number;

  addNotification: (type: Notification['type'], message: string) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  setLowStockItems: (items: LowStockItem[]) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  lowStockItems: [],
  unreadCount: 0,

  addNotification: (type, message) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
      read: false,
    };

    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));

    // Auto-dismiss after 5 seconds for info/success
    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        get().removeNotification(notification.id);
      }, 5000);
    }
  },

  dismissNotification: (id) => {
    set(state => {
      const notif = state.notifications.find(n => n.id === id);
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.unreadCount - 1,
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  setLowStockItems: (items) => {
    set({ lowStockItems: items });
  },

  removeNotification: (id) => {
    set(state => {
      const notif = state.notifications.find(n => n.id === id);
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },
}));
