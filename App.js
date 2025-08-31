import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RoomDetailsScreen from './screens/RoomDetailsScreen';
import ChatScreen from './screens/ChatScreen';
import AddRoomScreen from './screens/AddRoomScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import EditRoomScreen from './screens/EditRoomScreen';

// Tab Navigator
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Main App after login (with tabs) */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Extra stack screens accessible from tabs */}
          <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="AddRoom" component={AddRoomScreen} />
          <Stack.Screen  name="EditRoom"  component={EditRoomScreen} options={{ title: 'Edit Property' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
