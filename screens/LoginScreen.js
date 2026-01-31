import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ToastAndroid, StatusBar } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import logo from '../assets/chumbaconnect2.png';
import axios from "axios"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNotification } from "../context/NotificationContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';

export default function LoginScreen({ navigation, setUserToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const theme = useTheme();

  const { expoPushToken } = useNotification();

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    // Validate email before making API call
    if (!validateEmail(email)) {
      return;
    }

    if (!password.trim()) {
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Please enter your password',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );

       

      } else {
        Toast.show({
          type: 'error',
          text1: 'Please enter your password'
        });
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/api/users/login`, { 
        Email: email, 
        Password: password,
        ExpoToken: expoPushToken, 
      });

     // console.log('Returned Data', response.data);
      
      if (response.data.success) {
        if (!response.data.twoFactorRequired) {
          // No 2FA required - save tokens and proceed
          const token = response.data.token;
          const refreshToken = response.data.refreshToken;
          
          await AsyncStorage.multiSet([
            ['userToken', token], 
            ['refreshToken', refreshToken]
          ]);

          setIsLoading(false);
          setUserToken(token); // This controls the screen switch
          
          if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity(
              "Login successful",
              ToastAndroid.LONG,
              ToastAndroid.CENTER
            );

            
          } else {
            Toast.show({
              type: 'success',
              text1: 'Login Successful'
            });
          }
        } else {
          // 2FA required - navigate to verification screen
          setIsLoading(false);
          
          if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity(
              response.data.message || "Verification code sent",
              ToastAndroid.LONG,
              ToastAndroid.CENTER
            );
          } else {
            Toast.show({
              type: 'info',
              text1: response.data.message || "Verification code sent"
            });
          }
          
          // Navigate to 2FA verification screen with userId
          navigation.navigate('TwoFactorVerify', {
            userId: response.data.userId,
            email: email // Pass email for display purposes
          });
        }
      } else {
        setIsLoading(false);
        // Handle unsuccessful login without 2FA
        const errorMessage = response.data.message || 'Login failed';
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            errorMessage,
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type: 'error',
            text1: errorMessage
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);

      let errormessage;

      // Network error (no internet, server down, timeout)
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        errormessage = 'Unable to connect. Please check your internet connection or try again later.';
      }
      // Server did not respond (request sent, no response)
      else if (error.request && !error.response) {
        errormessage = 'Server is not responding. Please try again later.';
      }
      // Backend responded with an error
      else if (error.response) {
        errormessage = error.response.data?.message || "Something went wrong on the server.";
      }
      // Unknown error
      else {
        errormessage = 'Something went wrong. Please try again.';
      }

      // Show toast
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          errormessage,
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'error',
          text1: errormessage
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={logo} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to ChumbaConnect</Text>
            <Text style={styles.subtitle}>Find your perfect room without middlemen</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => validateEmail(email)}
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
            />

            {emailError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="close-circle" size={14} color="#e74c3c" />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            ) : null}

            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
              icon="login"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: theme.colors.primary }]}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 5,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: 25,
    fontWeight: '500',
  },
  button: {
    padding: 5,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContent: {
    height: 50,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#7f8c8d',
  },
  registerLink: {
    fontWeight: 'bold',
  },
});