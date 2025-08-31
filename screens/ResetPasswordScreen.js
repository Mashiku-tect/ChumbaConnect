import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen({ navigation, route }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const theme = useTheme();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Get email from navigation params (if coming from forgot password screen)
  const email = route.params?.email || '';

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (password) => {
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

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
    navigation.navigate('Login');
  };

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = newPassword.length >= 8 && passwordsMatch;

  const getPasswordStrengthText = () => {
    if (newPassword.length === 0) return '';
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#e74c3c';
    if (passwordStrength === 1) return '#e67e22';
    if (passwordStrength === 2) return '#f1c40f';
    if (passwordStrength === 3) return '#2ecc71';
    return '#27ae60';
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://i.imgur.com/7WkrhlM.png' }} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            {isSubmitted 
              ? "Your password has been reset successfully!" 
              : "Please enter your new password below"
            }
          </Text>
        </View>

        {!isSubmitted ? (
          <View style={styles.formContainer}>
            {email ? (
              <View style={styles.emailContainer}>
                <Text style={styles.emailText}>Resetting password for:</Text>
                <Text style={styles.emailAddress}>{email}</Text>
              </View>
            ) : null}

            <TextInput
              label="New Password"
              mode="outlined"
              value={newPassword}
              onChangeText={handlePasswordChange}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showNewPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />

            {newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBarContainer}>
                  {[1, 2, 3, 4].map((i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.strengthBar, 
                        { backgroundColor: i <= passwordStrength ? getPasswordStrengthColor() : '#ecf0f1' }
                      ]} 
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthText()}
                </Text>
              </View>
            )}

            <TextInput
              label="Confirm New Password"
              mode="outlined"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />

            {confirmPassword.length > 0 && !passwordsMatch && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#e74c3c" />
                <Text style={styles.errorText}>Passwords do not match</Text>
              </View>
            )}

            {passwordsMatch && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                <Text style={styles.successText}>Passwords match</Text>
              </View>
            )}

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={newPassword.length >= 8 ? "#2ecc71" : "#7f8c8d"} 
                />
                <Text style={styles.requirementText}>Be at least 8 characters long</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={/[A-Z]/.test(newPassword) ? "#2ecc71" : "#7f8c8d"} 
                />
                <Text style={styles.requirementText}>Include an uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={/[0-9]/.test(newPassword) ? "#2ecc71" : "#7f8c8d"} 
                />
                <Text style={styles.requirementText}>Include a number</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              loading={isLoading}
              disabled={isLoading || !isFormValid}
              contentStyle={styles.buttonContent}
              icon="lock-reset"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </View>
        ) : (
          <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-done-circle" size={80} color={theme.colors.primary} style={styles.successIcon} />
            <Text style={styles.successText}>
              Your password has been reset successfully!{'\n'}
              You can now login with your new password.
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
  emailContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  emailText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    marginHorizontal: 2,
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#e74c3c',
    marginLeft: 8,
    fontSize: 14,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    color: '#2ecc71',
    marginLeft: 8,
    fontSize: 14,
  },
  passwordRequirements: {
    marginBottom: 25,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    color: '#7f8c8d',
    fontSize: 14,
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
  successIcon: {
    marginBottom: 20,
  },
  backToLoginButton: {
    padding: 5,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
});