import { createContext, useContext } from "react";

export const NotificationContext = createContext({
  expoPushToken: null,
  notification: null,
});

export function useNotification() {
  return useContext(NotificationContext);
}
