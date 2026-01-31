import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated, Modal, StatusBar } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import logo from '../assets/chumbaconnect2.png';
//import BASE_URL from './Config';
import axios from "axios";
import api from '../api/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const theme = useTheme();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError('');
  };

  const handleResetPassword = async () => {
    // Validate email before making the request
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/api/password/password-reset`, {
        Email: email
      });

      setIsLoading(false);
      
      // Show success modal instead of alert
      setSuccessModalVisible(true);
      setIsSubmitted(true);
      
      // Optional: Trigger fade animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      setIsLoading(false);
      alert(error.response?.data?.message || "Error sending reset link");
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    handleBackToLogin();
  };

  const handleResend = () => {
    setSuccessModalVisible(false);
    setIsSubmitted(false);
    setEmail('');
  };

  // Check if button should be disabled
  const isButtonDisabled = isLoading || !email || !validateEmail(email);

  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image 
              source={logo} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {isSubmitted 
                ? "Check your email for instructions" 
                : "Enter your email to reset your password"
              }
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={handleEmailChange}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!emailError}
              />
              
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <Button
                mode="contained"
                onPress={handleResetPassword}
                style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
                loading={isLoading}
                disabled={isButtonDisabled}
                contentStyle={styles.buttonContent}
                icon={isLoading ? null : "email"}
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </View>
          ) : (
            <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
              <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} style={styles.successIcon} />
              <Text style={styles.successText}>
                We've sent a password reset link to {'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
              
              <Button
                mode="contained"
                onPress={() => setSuccessModalVisible(true)}
                style={styles.backToLoginButton}
                contentStyle={styles.buttonContent}
                icon="login"
              >
                Back to Login
              </Button>
              
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the email? </Text>
                <TouchableOpacity onPress={handleResend}>
                  <Text style={[styles.resendLink, { color: theme.colors.primary }]}>Resend</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={successModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseSuccessModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Ionicons name="checkmark-circle" size={60} color="#2ecc71" />
                <Text style={styles.modalTitle}>Reset Link Sent!</Text>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  We've sent a password reset link to:
                </Text>
                <Text style={styles.modalEmail}>{email}</Text>
                <Text style={styles.modalSubtext}>
                  Please check your email and follow the instructions to reset your password.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={handleResend}
                  style={styles.modalButton}
                  contentStyle={styles.modalButtonContent}
                >
                  Resend Link
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCloseSuccessModal}
                  style={styles.modalButton}
                  contentStyle={styles.modalButtonContent}
                >
                  Back to Login
                </Button>
              </View>
            </View>
          </View>
        </Modal>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 15 : 15,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
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
    lineHeight: 22,
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
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    marginLeft: 5,
  },
  button: {
    padding: 5,
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonContent: {
    height: 50,
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  backToLoginButton: {
    padding: 5,
    borderRadius: 10,
    width: '100%',
     marginTop:30
   
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#7f8c8d',
  },
  resendLink: {
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 10,
    textAlign: 'center',
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
  },
  modalButtonContent: {
    height: 45,
  },
});