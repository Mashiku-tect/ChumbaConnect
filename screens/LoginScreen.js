import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import logo from '../assets/chumbaconnect2.png';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login process
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
            onChangeText={setEmail}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            keyboardType="email-address"
            autoCapitalize="none"
          />

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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <Button
              mode="outlined"
              style={styles.socialButton}
              icon="google"
              onPress={() => console.log('Google login')}
            >
              Google
            </Button>
            <Button
              mode="outlined"
              style={styles.socialButton}
              icon="facebook"
              onPress={() => console.log('Facebook login')}
            >
              Facebook
            </Button>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: theme.colors.primary }]}>Register</Text>
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
    marginBottom: 20,
    backgroundColor: '#fff',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dfe6e9',
  },
  dividerText: {
    width: 50,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    borderColor: '#dfe6e9',
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