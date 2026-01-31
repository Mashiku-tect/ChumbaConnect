import * as React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createNavigationContainerRef } from "@react-navigation/native";
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { Appearance } from 'react-native';

//import auth service
import { setLogoutHandler } from './authService/authService';

import { LocationProvider } from './context/LocationContext';
import LocationHandler from './screens/LocationHandler';

//notification provider
import NotificationProvider from './providers/NotificationProvider';


// utils
import { checkOnboarded } from './utils/storage';

// onboarding
import OnboardingScreen from './screens/OnboardingScreen';

//import push notification hook
import usePushNotifications from './hooks/TokenPushNotificationHook';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
 import RoomDetailsScreen from './screens/RoomDetailsScreen';
// import ChatScreen from './screens/ChatScreen';
 import AddRoomScreen from './screens/AddRoomScreen';
// import EditProfileScreen from './screens/EditProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
 import EditRoomScreen from './screens/EditRoomScreen';
 import RentalRequestsScreen from './screens/RentalRequestsScreen';
 import CreateLeaseScreen from './screens/CreateLeaseScreen';
 import RentalRequestRoomDetailsScreen from './screens/RentalRequestSentRoomDetails';
 import PaymentScreen from './screens/PaymentScreen';
 import PrivacySecurityScreen from './screens/PrivacySecurityScreen';
 import ReviewScreen from './screens/ReviewScreen';
 import LandlordReviewsScreen from './screens/LandlordReviews';
 import AboutScreen from './screens/AboutChumbaConnect';
 import PaymentHistoryScreen from './screens/PaymentHistory';
 import WebViewScreen from './screens/WebViewScreen';
 import LocationScreen from './screens/LocationScreen';
 import HelpSupportScreen from './screens/HelpSupportScreen';
 import TwoFactorVerifyScreen from './screens/TwoFactorVerifyScreen';

//token testing screen
import PushTokenScreen from './screens/PushToken';

// Tabs
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userToken, setUserToken] = useState(null);

  const { expoPushToken, notification } = usePushNotifications();

   Appearance.setColorScheme('light');
   //console.log("Token from hook:", expoPushToken);
  //console.log("Latest notification:", notification);

  // DEV ONLY RESET
  // useEffect(() => {
  //   if (__DEV__) {
  //     AsyncStorage.removeItem("hasOnboarded");
  //     AsyncStorage.removeItem("userToken");
  //   }
  // }, []);

  // Check onboarding
  useEffect(() => {
    async function loadOnboarding() {
      const onboarded = await checkOnboarded();
      setHasOnboarded(!!onboarded);
    }
    loadOnboarding();
  }, []);

  // Set logout handler
  useEffect(() => {
  setLogoutHandler(() => {
    setUserToken(null); // 🔥 THIS is the key
  });
}, []);

  // Check JWT token
  useEffect(() => {
    async function loadToken() {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setLoading(false);
    }
    loadToken();
  }, []);

  // Loading indicator
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#800080" />
        <Text style={{ marginTop: 10, color: '#800080', fontSize: 16 }}>
          Connecting You to Your Next Room
        </Text>
      </View>
    );
  }

  return (
    <PaperProvider>
    <SafeAreaProvider>
      <NotificationProvider navigation={navigationRef}>
      <LocationProvider>
        
        {/* ✅ Only run location handler when user is logged in */}
        {userToken && <LocationHandler userToken={userToken} />}

        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* Onboarding First */}
            {!hasOnboarded ? (
              <Stack.Screen name="Onboarding">
                {(props) => (
                  <OnboardingScreen {...props} setHasOnboarded={setHasOnboarded} />
                )}
              </Stack.Screen>
            )
            : !userToken ? (
              <>
                <Stack.Screen name="Login">
                  {(props) => (
                    <LoginScreen {...props} setUserToken={setUserToken} />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="TwoFactorVerify">
  {props => <TwoFactorVerifyScreen {...props} setUserToken={setUserToken} />}
</Stack.Screen>
              </>
            )
            : (
              <>
                {/* Main application after login */}
                <Stack.Screen name="Main">
                  {() => <MainTabs setUserToken={setUserToken} />}
                </Stack.Screen>

                 {/* All other screens */}

                 <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
                  <Stack.Screen name="AddRoom" component={AddRoomScreen} />
                    <Stack.Screen name="EditRoom" component={EditRoomScreen} />
                     <Stack.Screen name="RentalRequests" component={RentalRequestsScreen} />
                      <Stack.Screen name="CreateLease" component={CreateLeaseScreen} />
                       <Stack.Screen name="RentalRequestRoomDetails" component={RentalRequestRoomDetailsScreen} />
                        <Stack.Screen name="Payment" component={PaymentScreen} />
                         <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                          <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
                          <Stack.Screen name="LandlordReviews" component={LandlordReviewsScreen} />
                          <Stack.Screen name="About" component={AboutScreen} />
                           <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
                              <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
                                <Stack.Screen name="LocationScreen" component={LocationScreen} />
                                 <Stack.Screen name="PushTokenScreen" component={PushTokenScreen} /> 
                                  <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                                 


               
                {/*
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />

              
               */}
                
              </>
            )}

          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </LocationProvider>
      </NotificationProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
