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
import RentalRequestsScreen from './screens/RentalRequestsScreen';
import CreateLeaseScreen from './screens/CreateLeaseScreen';
import RentalRequestRoomDetailsScreen from './screens/RentalRequestSentRoomDetails';

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
          <Stack.Screen name="RentalRequests" component={RentalRequestsScreen} options={{ title: 'Rental Requests' }} />
          <Stack.Screen name="CreateLease" component={CreateLeaseScreen} options={{ title: 'Create Lease' }} />
          <Stack.Screen name="RentalRequestRoomDetails" component={RentalRequestRoomDetailsScreen} options={{ title: 'Request Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
