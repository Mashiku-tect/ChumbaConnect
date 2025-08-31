import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import logo from '../assets/chumbaconnect2.png';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const theme = useTheme();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleResetPassword = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
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
              onChangeText={setEmail}
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading || !email}
              contentStyle={styles.buttonContent}
              icon="email-send"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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
              onPress={handleBackToLogin}
              style={styles.backToLoginButton}
              contentStyle={styles.buttonContent}
              icon="login"
            >
              Back to Login
            </Button>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the email? </Text>
              <TouchableOpacity onPress={() => setIsSubmitted(false)}>
                <Text style={[styles.resendLink, { color: theme.colors.primary }]}>Resend</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
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
    marginBottom: 25,
    backgroundColor: '#fff',
  },
  button: {
    padding: 5,
    borderRadius: 10,
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
    marginBottom: 20,
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
});