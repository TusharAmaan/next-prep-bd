'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  timestamp?: string;
}

interface UseRealtimeNotificationsOptions {
  userId: string;
  onNewNotification?: (notification: Notification) => void;
  autoMarkAsRead?: boolean;
}

export function useRealtimeNotifications({
  userId,
  onNewNotification,
  autoMarkAsRead = true,
}: UseRealtimeNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  useEffect(() => {
    if (!userId) return;

    setConnectionStatus('connecting');
    const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);

    // Handle incoming messages
    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          const newNotification: Notification = {
            id: data.data.id,
            type: data.data.type,
            title: data.data.title,
            message: data.data.message,
            icon: data.data.icon,
            actionUrl: data.data.actionUrl,
            timestamp: data.data.timestamp,
          };

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          onNewNotification?.(newNotification);

          // Show browser notification if enabled
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: newNotification.icon,
              tag: newNotification.id,
            });
          }
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    eventSource.addEventListener('open', () => {
      setConnectionStatus('connected');
    });

    eventSource.addEventListener('error', () => {
      setConnectionStatus('disconnected');
      eventSource.close();
    });

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [userId, onNewNotification]);

  // Fetch historical notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `/api/notifications/send?userId=${userId}&isRead=false&limit=50`
        );
        const data = await response.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, [userId]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    clearAll,
    requestNotificationPermission,
    isConnected: connectionStatus === 'connected',
  };
}
