import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ToastAndroid, StatusBar, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';

export default function TwoFactorVerifyScreen({ navigation, route, setUserToken }) {
  const { userId, email } = route.params;
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const theme = useTheme();

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Please enter a valid 6-digit code',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'Information',
          text1:'Information',
          text2: 'Please enter a valid 6-digit code'
        });
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/api/users/verifycode`, {
        userId: userId,
        code: code
      });

     // console.log('Verification Response:', response.data);
      
      if (response.data.success) {
        // Save tokens and proceed
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
            "Verification successful",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type: 'success',
            text1:'Success',
            text2: 'Verification successful'
          });
        }
      } else {
        setIsLoading(false);
        const errorMessage = response.data.message || 'Verification failed';
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            errorMessage,
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type: 'error',
            text1:'Error',
            text2: errorMessage
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);

      let errormessage;

      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        errormessage = 'Unable to connect. Please check your internet connection.';
      } else if (error.request && !error.response) {
        errormessage = 'Server is not responding. Please try again later.';
      } else if (error.response) {
        errormessage = error.response.data?.message || "Verification failed. Please try again.";
      } else {
        errormessage = 'Something went wrong. Please try again.';
      }

      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          errormessage,
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'error',
          text1:'Error',
          text2: errormessage
        });
      }
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setResendLoading(true);
    try {
      // You might need to adjust this endpoint based on your backend
      const response = await api.post(`/api/users/resend-verification`, {
        userId: userId
      });

      if (response.data.success) {
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            "New code sent to your email",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type: 'success',
            text1:'Success',
            text2: 'New code sent to your email'
          });
        }
        
        // Start 60-second countdown
        setResendCountdown(60);
        const interval = setInterval(() => {
          setResendCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          "Failed to resend code. Please try again.",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'error',
          text1:'Error',
          text2: 'Failed to resend code'
        });
      }
    } finally {
      setResendLoading(false);
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
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Two-Factor Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={{ fontWeight: 'bold' }}>{email}</Text>
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Verification Code"
              mode="outlined"
              value={code}
              onChangeText={setCode}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              left={<TextInput.Icon icon="shield-check" />}
            />

            <Button
              mode="contained"
              onPress={handleVerify}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
              icon="check-circle"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResendCode} 
                disabled={resendLoading || resendCountdown > 0}
              >
                <Text 
                  style={[
                    styles.resendLink, 
                    { color: theme.colors.primary },
                    (resendLoading || resendCountdown > 0) && styles.disabledLink
                  ]}
                >
                  {resendLoading 
                    ? 'Sending...' 
                    : resendCountdown > 0 
                      ? `Resend (${resendCountdown}s)` 
                      : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.backContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={[styles.backLink, { color: theme.colors.primary }]}>
                  ← Back to Login
                </Text>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
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
    marginBottom: 25,
    backgroundColor: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    padding: 5,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContent: {
    height: 50,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  resendText: {
    color: '#7f8c8d',
  },
  resendLink: {
    fontWeight: 'bold',
  },
  disabledLink: {
    opacity: 0.5,
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    fontWeight: 'bold',
  },
});