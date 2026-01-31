import React from "react";
import { NotificationContext } from "../context/NotificationContext";
import usePushNotifications from "../hooks/TokenPushNotificationHook";

export default function NotificationProvider({ children }) {
  const { expoPushToken, handleNotificationTap, notification } = usePushNotifications();

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, handleNotificationTap }}>
      {children}
    </NotificationContext.Provider>
  );
}
