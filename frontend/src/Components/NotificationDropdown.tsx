import React, { useState, useEffect, useRef } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import SchoolIcon from "@mui/icons-material/School";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  type Notification,
} from "../api/notification";
import { useNavigate } from "react-router-dom";

interface NotificationDropdownProps {
  isSidebarExpanded?: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        getMyNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.lessonId && typeof notification.lessonId === "object") {
      setIsOpen(false);
      navigate("/dashboard");
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "lesson_confirmed":
        return <CheckCircleIcon className="text-green-400" />;
      case "payment_success":
        return <PaymentIcon className="text-green-400" />;
      case "payment_failed":
        return <ErrorIcon className="text-red-400" />;
      case "meeting_starting":
        return <EventIcon className="text-blue-400" />;
      case "new_lesson":
        return <SchoolIcon className="text-yellow-400" />;
      default:
        return <NotificationsIcon className="text-gray-400" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <NotificationsIcon className="text-gray-300 hover:text-white transition-all duration-200 text-lg sm:text-xl lg:text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute -right-2 sm:-right-4 top-10 sm:top-12 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl text-white rounded-xl shadow-2xl border border-[rgba(255,255,255,0.15)] z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-xl">
            <h3 className="text-lg font-semibold font-['IBM_Plex_Sans']">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-all duration-200 font-['IBM_Plex_Sans'] font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-all duration-200"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <NotificationsIcon className="text-gray-600 text-5xl mb-3" />
                <p className="text-gray-400 text-sm font-['IBM_Plex_Sans']">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 border-b border-gray-800 hover:bg-[rgba(255,255,255,0.05)] transition cursor-pointer group ${
                    !notification.isRead ? "bg-[rgba(59,130,246,0.1)]" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold truncate font-['IBM_Plex_Sans']">
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification._id);
                          }}
                          className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 font-['IBM_Plex_Sans']">
                        {notification.message}
                      </p>
                      {notification.lessonId &&
                        typeof notification.lessonId === "object" && (
                          <p className="text-xs text-blue-400 mt-1 font-['IBM_Plex_Sans']">
                            {notification.lessonId.topic} •{" "}
                            {notification.lessonId.date}
                          </p>
                        )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 font-['IBM_Plex_Sans']">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="text-xs text-blue-400 font-semibold font-['IBM_Plex_Sans']">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-700 sticky bottom-0 bg-slate-900/95 backdrop-blur-xl">
              <button
                onClick={handleDeleteAllNotifications}
                className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 font-['IBM_Plex_Sans'] font-medium text-sm"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
