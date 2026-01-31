import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,Alert,ToastAndroid ,StatusBar} from 'react-native';
import { TextInput, Button, Text, useTheme, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import logo from '../assets/chumbaconnect2.png';
import axios from 'axios';
import BASE_URL from './Config';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const theme = useTheme();

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^255\d{9}$/;
    return phoneRegex.test(phone);
  };

  const areAllFieldsFilled = () => {
    return firstName.trim() && lastName.trim() && email.trim() && phoneNumber.trim() && password.trim();
  };

// check firstname if has only letters and spaces
const isValidFirstName = (name) => {
  const nameRegex = /^[A-Za-z ]+$/;
  return nameRegex.test(name);
};

// check lastname if has only letters and spaces
const isValidLastName = (name) => {
  const nameRegex = /^[A-Za-z ]+$/;
  return nameRegex.test(name);
};


  // Validate form whenever any field changes
  useEffect(() => {
    const validateForm = () => {
      const fieldsFilled = areAllFieldsFilled();
      const emailValid = isValidEmail(email);
      const phoneValid = isValidPhoneNumber(phoneNumber);
      const passwordValid = password.length >= 8;
      const firstnameValid=isValidFirstName(firstName);
      const lastnameValid=isValidLastName(lastName);

      setIsFormValid(fieldsFilled && emailValid && phoneValid && passwordValid && firstnameValid && lastnameValid);
    };

    validateForm();
  }, [firstName, lastName, email, phoneNumber, password]);

  const handleRegister = async () => {
    if (!areAllFieldsFilled()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!isValidFirstName(firstName)) {
      Alert.alert('Error', 'First name can only contain letters');
      return;
    }
    
    if (!isValidLastName(lastName)) {
      Alert.alert('Error', 'Last name can only contain letters');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Phone number must be in format: 255XXXXXXXXX (12 digits starting with 255)');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(`/api/users/register`, {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PhoneNumber: phoneNumber,
        Password: password
      });

      setIsLoading(false);
      if (response.data.success) {
       // Alert.alert('Success', 'Account created successfully');
        const responsemessage=response.data.message;

            if(Platform.OS==='android'){
          ToastAndroid.showWithGravity(
                responsemessage,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
              );
                }
                else{
                  Toast.show({
                    type:'success',
                    text1:'Success',
                    text2:responsemessage
                  })
                }

        navigation.replace('Login');
      } 
    } catch (error) {
      setIsLoading(false);
      //Alert.alert('Error', error.response?.data?.message || error.message || 'Something went wrong');
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
          errormessage =
            error.response.data?.message || // safe access
            "Something went wrong";
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
              placeholder='Enter Your First Name'
              mode="outlined"
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, styles.nameInput]}
              left={<TextInput.Icon icon="account" />}
              autoCapitalize="words"
              error={firstName && !isValidFirstName(firstName)}
            />
            <TextInput
              label="Last Name"
              placeholder='Enter Your Last Name'
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, styles.nameInput]}
              autoCapitalize="words"
              error={lastName && !isValidLastName(lastName)}
            />
          </View>

          <TextInput
            label="Email"
            placeholder="Enter your email address"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            keyboardType="email-address"
            autoCapitalize="none"
            error={email && !isValidEmail(email)}
          />

          <TextInput
            label="Phone Number"
            placeholder="255XXXXXXXXX"
            mode="outlined"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            keyboardType="phone-pad"
            error={phoneNumber && !isValidPhoneNumber(phoneNumber)}
          />

          <TextInput
            label="Password"
            placeholder='Enter Your Password'
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

          {/* Validation Messages */}
          <View style={styles.validationContainer}>
            {firstName && !isValidFirstName(firstName) && (
              <View style={styles.validationItem}>
                <Ionicons name="close-circle" size={14} color="#e74c3c" />
                <Text style={[styles.validationText, styles.errorText]}>First name can only contain letters</Text>
              </View>
            )}
            
            {lastName && !isValidLastName(lastName) && (
              <View style={styles.validationItem}>
                <Ionicons name="close-circle" size={14} color="#e74c3c" />
                <Text style={[styles.validationText, styles.errorText]}>Last name can only contain letters</Text>
              </View>
            )}
            
            {email && !isValidEmail(email) && (
              <View style={styles.validationItem}>
                <Ionicons name="close-circle" size={14} color="#e74c3c" />
                <Text style={[styles.validationText, styles.errorText]}>Please enter a valid email address</Text>
              </View>
            )}
            
            {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
              <View style={styles.validationItem}>
                <Ionicons name="close-circle" size={14} color="#e74c3c" />
                <Text style={[styles.validationText, styles.errorText]}>Phone number must be: 255XXXXXXXXX (12 digits)</Text>
              </View>
            )}
            
            {!areAllFieldsFilled() && (
              <View style={styles.validationItem}>
                <Ionicons name="information-circle" size={14} color="#f39c12" />
                <Text style={[styles.validationText, styles.warningText]}>All fields are required</Text>
              </View>
            )}
            
            {isFormValid && (
              <View style={styles.validationItem}>
                <Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
                <Text style={[styles.validationText, styles.successText]}>All fields are valid!</Text>
              </View>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={[styles.button, !isFormValid && styles.disabledButton]}
            loading={isLoading}
            disabled={!isFormValid || isLoading}
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
    top: Platform.OS === 'ios' ? 4 : 4,
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
  passwordRequirements: {
    marginBottom: 15,
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
  validationContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  validationText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
  },
  warningText: {
    color: '#f39c12',
  },
  successText: {
    color: '#2ecc71',
  },
  button: {
    padding: 5,
    borderRadius: 10,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
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