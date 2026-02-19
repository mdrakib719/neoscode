import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../../controllers/notification.controller';
import { Notification, NotificationType } from '../../models/types';

const typeIcon: Record<NotificationType, string> = {
  TRANSACTION: '💳',
  LOAN: '🏦',
  ACCOUNT: '📒',
  SECURITY: '🔒',
  GENERAL: '🔔',
};

const typeColor: Record<NotificationType, string> = {
  TRANSACTION: '#3b82f6',
  LOAN: '#8b5cf6',
  ACCOUNT: '#10b981',
  SECURITY: '#ef4444',
  GENERAL: '#6b7280',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

export const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications(filter === 'unread');
  }, [filter]);

  const displayed = notifications;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            🔔 Notifications
          </h1>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginTop: 4,
                display: 'block',
              }}
            >
              {unreadCount} unread
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {/* Filter tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: 8,
              padding: 4,
            }}
          >
            {(['all', 'unread'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 16px',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: filter === tab ? 600 : 400,
                  background: filter === tab ? '#fff' : 'transparent',
                  boxShadow:
                    filter === tab ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                  textTransform: 'capitalize',
                  fontSize: 13,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '6px 14px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {error}
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#b91c1c',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}
        >
          Loading notifications…
        </div>
      )}

      {/* Empty */}
      {!isLoading && displayed.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 0',
            background: '#f9fafb',
            borderRadius: 12,
            color: '#9ca3af',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
            {filter === 'unread'
              ? 'No unread notifications'
              : 'No notifications yet'}
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && displayed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map((notification: Notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={() => markAsRead(notification.id)}
              onDelete={() => deleteNotification(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CardProps {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}

const NotificationCard: React.FC<CardProps> = ({
  notification,
  onMarkRead,
  onDelete,
}) => {
  const color = typeColor[notification.type] ?? '#6b7280';
  const icon = typeIcon[notification.type] ?? '🔔';

  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        background: notification.is_read ? '#fff' : '#eff6ff',
        border: `1px solid ${notification.is_read ? '#e5e7eb' : '#bfdbfe'}`,
        borderRadius: 10,
        padding: '14px 16px',
        transition: 'box-shadow .15s',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: color + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <span
            style={{
              fontWeight: notification.is_read ? 500 : 700,
              fontSize: 15,
            }}
          >
            {notification.title}
          </span>
          <span
            style={{
              fontSize: 12,
              color: '#9ca3af',
              whiteSpace: 'nowrap',
              marginTop: 2,
            }}
          >
            {formatDate(notification.created_at)}
          </span>
        </div>
        <p style={{ margin: '4px 0 8px', color: '#4b5563', fontSize: 14 }}>
          {notification.message}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.04em',
              background: color + '18',
              color,
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {notification.type}
          </span>
          {!notification.is_read && (
            <button
              onClick={onMarkRead}
              style={{
                fontSize: 12,
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0',
                fontWeight: 600,
              }}
            >
              Mark as read
            </button>
          )}
          <button
            onClick={onDelete}
            style={{
              fontSize: 12,
              color: '#ef4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              marginLeft: 'auto',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#2563eb',
            flexShrink: 0,
            marginTop: 6,
          }}
        />
      )}
    </div>
  );
};
