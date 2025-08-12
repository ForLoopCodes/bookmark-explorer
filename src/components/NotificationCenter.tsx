"use client";

import React, { useState, useEffect } from "react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  duration?: number;
}

const NotificationCenter: React.FC = () => {
  const { isAuthenticated, shouldShowLogin } = useBookmarks();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration (default 5 seconds)
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, notification.duration || 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Show welcome back notification with security explanation
  useEffect(() => {
    if (shouldShowLogin && !isAuthenticated) {
      addNotification({
        type: "info",
        title: "🔒 Security Authentication",
        message:
          "Page refresh detected. Please re-enter your password for security. Navigation within the app won't require re-authentication.",
        duration: 8000,
      });
    }
  }, [shouldShowLogin, isAuthenticated]);

  // Show success notification when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      addNotification({
        type: "success",
        title: "Welcome back!",
        message:
          "Your bookmarks are now accessible. Navigate freely within the app without re-authentication.",
        duration: 500,
      });
    }
  }, [isAuthenticated]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "info":
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getStyles(
            notification.type
          )} animate-in slide-in-from-right-full duration-300`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <p className="text-xs mt-1 opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
