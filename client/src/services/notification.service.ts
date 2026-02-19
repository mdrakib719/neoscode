import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Notification } from '../models/types';

export const notificationService = {
  async getAll(unreadOnly = false): Promise<Notification[]> {
    const url = unreadOnly
      ? `${API_ENDPOINTS.NOTIFICATIONS}?unreadOnly=true`
      : API_ENDPOINTS.NOTIFICATIONS;
    return apiClient.get<Notification[]>(url);
  },

  async getUnreadCount(): Promise<number> {
    return apiClient.get<number>(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
  },

  async markAsRead(id: number): Promise<Notification> {
    return apiClient.post<Notification>(
      API_ENDPOINTS.NOTIFICATION_MARK_READ(id),
    );
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.post<void>(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.NOTIFICATION_DELETE(id));
  },
};
