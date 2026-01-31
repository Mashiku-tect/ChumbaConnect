import React, { useEffect, useState } from 'react';
import axios from "axios";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import MyRoomsScreen from './screens/MyRoomsScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyRentalScreen from './screens/MyRentalScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SearchScreen from './screens/SearchScreen'; // Add this import
import AsyncStorage from '@react-native-async-storage/async-storage';
import SOCKET_URL from './screens/Config';

import api from './api/api';

const Tab = createBottomTabNavigator();

export default function MainTabs({ setUserToken }) {
  const insets = useSafeAreaInsets(); // ✅ Get device safe area insets
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  // ---------------- SOCKET SETUP ---------------- //
  const socket = io('https://chumbaconnect.mashikutech.co.tz', {
    path: '/chumbaconnect/socket.io',
    transports: ['websocket'],
    withCredentials: true,
  });

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const response = await api.get(`/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!mounted) return;

        setUnreadCount(response.data.unreadCount);
        setUserId(response.data.userId);

        socket.emit('join', response.data.userId);

        socket.on('notification_update', ({ type, delta }) => {
          if (type === 'insert') setUnreadCount(prev => prev + delta);
          if (type === 'read') setUnreadCount(prev => Math.max(prev - delta, 0));
        });

        if (__DEV__) {
          socket.on('connect_error', (err) =>
            console.log('Socket connect error:', err)
          );
          socket.on('disconnect', () =>
            console.log('Socket disconnected')
          );
        }

      } catch (err) {
        //console.log("Init error:", err);
      }
    };

    init();

    return () => {
      mounted = false;
      socket.off('notification_update');
      socket.disconnect();
    };
  }, []);

  // ---------------- TAB NAVIGATOR ---------------- //
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          height: 60 + insets.bottom, // ✅ Add safe area bottom inset
          paddingBottom: insets.bottom, // ✅ Prevent nav bar from overlapping tabs
        },
        tabBarActiveTintColor: '#0077cc',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Explore"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen} // Add Search tab
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRooms"
        component={MyRoomsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="office-building" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="My Rental"
        component={MyRentalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} setUserToken={setUserToken} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}