import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import logo from '../assets/chumbaconnect2.png';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('tenant');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleRegister = () => {
    setIsLoading(true);
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace("Main");
    }, 1500);
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
            source={logo} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account 🏡</Text>
          <Text style={styles.subtitle}>Join ChumbaConnect today</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.nameContainer}>
            <TextInput
              label="First Name"
              mode="outlined"
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, styles.nameInput]}
              left={<TextInput.Icon icon="account" />}
              autoCapitalize="words"
            />
            <TextInput
              label="Last Name"
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, styles.nameInput]}
              autoCapitalize="words"
            />
          </View>

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

          <TextInput
            label="Phone Number"
            mode="outlined"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            keyboardType="phone-pad"
          />

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption} 
                onPress={() => setRole('tenant')}
              >
                <RadioButton
                  value="tenant"
                  status={role === 'tenant' ? 'checked' : 'unchecked'}
                  onPress={() => setRole('tenant')}
                  color={theme.colors.primary}
                />
                <Text style={styles.radioText}>Tenant</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.radioOption} 
                onPress={() => setRole('landlord')}
              >
                <RadioButton
                  value="landlord"
                  status={role === 'landlord' ? 'checked' : 'unchecked'}
                  onPress={() => setRole('landlord')}
                  color={theme.colors.primary}
                />
                <Text style={styles.radioText}>Landlord</Text>
              </TouchableOpacity>
            </View>
          </View>

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

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password must include:</Text>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                size={14} 
                color={password.length >= 8 ? "#2ecc71" : "#7f8c8d"} 
              />
              <Text style={styles.requirementText}>At least 8 characters</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
            contentStyle={styles.buttonContent}
            icon="account-plus"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: theme.colors.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  roleContainer: {
    marginBottom: 15,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    marginLeft: 8,
    color: '#2c3e50',
  },
  passwordRequirements: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    marginLeft: 8,
    color: '#7f8c8d',
    fontSize: 12,
  },
  button: {
    padding: 5,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonContent: {
    height: 50,
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLink: {
    fontWeight: 'bold',
  },
});