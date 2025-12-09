import API from "../api";

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "lesson_confirmed"
    | "payment_success"
    | "payment_failed"
    | "meeting_starting"
    | "new_lesson";
  title: string;
  message: string;
  lessonId?: {
    _id: string;
    topic: string;
    subject: string;
    date: string;
    time: string;
  };
  paymentId?: string;
  roomId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getMyNotifications = async (): Promise<Notification[]> => {
  const res = await API.get("/notifications");
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await API.get("/notifications/unread-count");
  return res.data.count;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  await API.patch(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await API.patch("/notifications/read-all");
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await API.delete(`/notifications/${notificationId}`);
};

export const deleteAllNotifications = async (): Promise<void> => {
  await API.delete("/notifications");
};
