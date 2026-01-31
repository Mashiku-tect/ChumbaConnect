// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
//import { navigationRef } from '../App'; // Make sure navigationRef is exported from App.js
import BASE_URL from '../screens/Config';
import { logout } from '../authService/authService';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Request interceptor: attach token
api.interceptors.request.use(
  async (config) => {
    //below is the code for production
    const token = await AsyncStorage.getItem('userToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;

     // For development: force invalid token
  // const devToken = __DEV__ ? 'FORCED_INVALID_TOKEN' : token;

  // if (devToken) config.headers.Authorization = `Bearer ${devToken}`;
  // return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Remove token
      await AsyncStorage.removeItem('userToken');

      // Show alert before navigating
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: logout
              
          },
        ],
        { cancelable: false }
      );
    }

    return Promise.reject(error);
  }
);


// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = 'Bearer ' + token;
//           return api(originalRequest);
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshToken = await AsyncStorage.getItem('refreshToken');

//         const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
//           refreshToken,
//         });

//         await AsyncStorage.setItem('token', data.token);

//         api.defaults.headers.Authorization = 'Bearer ' + data.token;
//         processQueue(null, data.token);

//         return api(originalRequest);
//       } catch (err) {
//         processQueue(err, null);
//         await logout(); // your existing logout handler
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
