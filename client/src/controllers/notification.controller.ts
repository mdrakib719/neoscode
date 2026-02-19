import { create } from 'zustand';
import { Notification } from '../models/types';
import { notificationService } from '../services/notification.service';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getAll(unreadOnly);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount();
      set({ unreadCount });
    } catch {
      // silently ignore – polling should not disrupt the UI
    }
  },

  markAsRead: async (id: number) => {
    try {
      const updated = await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? updated : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - (updated.is_read ? 1 : 0)),
      }));
      // Re-derive unreadCount from updated list
      const { notifications } = get();
      set({ unreadCount: notifications.filter((n) => !n.is_read).length });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark as read',
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark all as read',
      });
    }
  },

  deleteNotification: async (id: number) => {
    try {
      await notificationService.delete(id);
      set((state) => {
        const updated = state.notifications.filter((n) => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete notification',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
