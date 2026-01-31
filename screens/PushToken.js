import { useState, useEffect } from 'react';
import { Text, View, Button, Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true, // JS alternative to shouldShowBanner
  }),
});

// ------------------- SEND PUSH -------------------
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Expo Push Notification',
    body: 'This is a test notification sent from the app!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// ------------------- ERROR HANDLER -------------------
function handleRegistrationError(errorMessage) {
  Alert.alert('Error', errorMessage);
  throw new Error(errorMessage);
}

// ------------------- REGISTER FOR PUSH -------------------
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token!');
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log('Expo Push Token:', tokenData.data);
      return tokenData.data;
    } catch (e) {
      handleRegistrationError(String(e));
    }
  } else {
    handleRegistrationError('Must use a physical device for push notifications');
  }
}

// ------------------- APP COMPONENT -------------------
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token || ''))
      .catch(err => setExpoPushToken(String(err)));

    const notificationListener = Notifications.addNotificationReceivedListener(n => {
      setNotification(n);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingTop: 60 }}>
      <Text>Your Expo push token:</Text>
      <Text selectable>{expoPushToken}</Text>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification ? notification.request.content.title : ''}</Text>
        <Text>Body: {notification ? notification.request.content.body : ''}</Text>
        <Text>
          Data: {notification ? JSON.stringify(notification.request.content.data) : ''}
        </Text>
      </View>

      <Button
        title="Press to Send Notification"
        onPress={async () => {
          if (!expoPushToken) {
            Alert.alert('Error', 'No Expo push token available');
            return;
          }
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}
