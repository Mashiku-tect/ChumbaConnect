import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { navigationRef } from "../App"; // <-- global navigation ref

// --------------------
// GLOBAL NOTIFICATION HANDLER (foreground)
// --------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  }),
});

// --------------------
// HOOK
// --------------------
export default function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // 1️⃣ Register token
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token || null))
      .catch(e => console.log("Push registration error:", e));

    // 2️⃣ Foreground notifications
    const receivedListener = Notifications.addNotificationReceivedListener(n => {
      setNotification(n);
    });

    // 3️⃣ Background/quit notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationTap(response);
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);

  // --------------------
  // Handler for tapping notifications
  // --------------------
  const handleNotificationTap = (response) => {
    const data = response?.notification?.request?.content?.data;

    if (!data?.screen) return;

    if (navigationRef.isReady()) {
      // ✅ Navigate to a nested screen inside MainTabs
      navigationRef.navigate("Main", { screen: data.screen, params: data });
    } else {
      console.log("Navigation not ready yet, cannot navigate");
    }
  };

  return { expoPushToken, notification, handleNotificationTap };
}

// --------------------
// REGISTER FOR PUSH NOTIFICATIONS
// --------------------
async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    Alert.alert("Error", "Must use physical device for push notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Permission required", "Push notification permission was denied.");
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  if (!projectId) {
    Alert.alert("Error", "Project ID not found. Add it to your app.json.");
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
   // console.log("Expo Push Token:", token);
    return token;
  } catch (error) {
    Alert.alert("Token Error", String(error));
    return null;
  }
}
