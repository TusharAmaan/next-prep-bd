'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  Trash2,
  BookOpen,
  Clock,
  Loader,
} from 'lucide-react';
import Link from 'next/link';
import { useRealtimeNotifications } from '@/app/hooks/useRealtimeNotifications';

interface NotificationCenterProps {
  userId: string;
  onNotificationClick?: (notification: any) => void;
}

export function NotificationCenter({ userId, onNotificationClick }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    clearAll,
    requestNotificationPermission,
  } = useRealtimeNotifications({
    userId,
    onNewNotification: (notification) => {
      // New notification received - log removed for optimization
    },
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'course_update':
        return <BookOpen className="w-4 h-4" />;
      case 'exam_result':
        return <CheckCircle className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'achievement':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'assignment':
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'course_update':
        return 'bg-blue-50 text-blue-600';
      case 'exam_result':
        return 'bg-green-50 text-green-600';
      case 'message':
        return 'bg-purple-50 text-purple-600';
      case 'achievement':
        return 'bg-yellow-50 text-yellow-600';
      case 'assignment':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full" title={connectionStatus}>
          {connectionStatus === 'connected' && <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />}
          {connectionStatus === 'connecting' && <div className="w-full h-full bg-yellow-500 rounded-full animate-spin" />}
          {connectionStatus === 'disconnected' && <div className="w-full h-full bg-red-500 rounded-full" />}
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="ml-auto px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group`}
                  onClick={() => {
                    markAsRead(notification.id || '');
                    onNotificationClick?.(notification);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${getColorForType(notification.type)}`}>
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      {notification.timestamp && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => requestNotificationPermission()}
                className="flex-1 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => clearAll()}
                className="flex-1 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
