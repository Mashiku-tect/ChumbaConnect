import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  ToastAndroid,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Avatar, IconButton, Switch, Divider, Menu, ActivityIndicator, Portal, Dialog } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from "axios";
import BASE_URL from './Config';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../api/api';

export default function ProfileScreen({ navigation, setUserToken }) {
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userdetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New states for phone number editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state when retrying
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        setUserToken(null);
        return; // exit early if no token
      }

      const response = await api.get(`/api/getuserdetails`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserDetails(response.data.userdetails);
      // Initialize phone number state with current phone number
      if (response.data.userdetails.phoneNumber) {
        setPhoneNumber(response.data.userdetails.phoneNumber);
      }
    } catch (error) {
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

      setError(errormessage); // Set error state

      // Show toast
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          errormessage,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        // Make sure Toast is imported if you're using it on iOS
        Toast.show({
          type: 'error',
          text1:'Error',
          text2: errormessage
        });
      }
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [])
  );

  const menuItems = [
    { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => navigation.navigate('PrivacySecurity') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport') },
    { icon: 'information', label: 'About ChumbaConnect', onPress: () => navigation.navigate('About') },
  ];

const handleLogout = async () => {
  try {
    // Retrieve the token
    const token = await AsyncStorage.getItem('userToken');

    // If there's no token, we might want to handle that case as well
    if (!token) {
      Alert.alert('No token found. You are already logged out.');
      return;
    }

    // Send the logout request with the token
    const response = await api.post('/api/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Remove the token from AsyncStorage
    await AsyncStorage.removeItem('userToken'); // Clear the token

    // Update the state to trigger the login screen
    setUserToken(null); 

    // Optionally, check response status or message here
    // if (response.status === 200) {
    //   Alert.alert('Successfully logged out');
    // } else {
    //   Alert.alert('Logout failed. Please try again.');
    // }

  } catch (error) {
    // Log the error for debugging (consider adding error info for production)
    //console.error('Logout failed:', error);
    Alert.alert('Logout Failed');
  }
};

  // Format phone number to 255XXXXXXXXX
  const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If phone starts with 0, replace with 255
    if (cleaned.startsWith('0')) {
      cleaned = '255' + cleaned.substring(1);
    }
    
    // If phone starts with +255, remove the +
    if (cleaned.startsWith('255')) {
      return cleaned;
    }
    
    // If phone doesn't start with 255, add it
    if (cleaned.length > 0 && !cleaned.startsWith('255')) {
      cleaned = '255' + cleaned;
    }
    
    return cleaned;
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (!cleaned) {
      return 'Phone number is required';
    }
    
    // Format and check if it's 12 digits (255 + 9 digits)
    const formatted = formatPhoneNumber(phone);
    
    if (formatted.length !== 12) {
      return 'Phone number must be 12 digits (including 255 country code)';
    }
    
    if (!formatted.startsWith('255')) {
      return 'Phone number must start with 255 (Tanzania)';
    }
    
    // Check if the remaining 9 digits are valid
    const remainingDigits = formatted.substring(3);
    if (!/^[0-9]{9}$/.test(remainingDigits)) {
      return 'Invalid phone number format';
    }
    
    return '';
  };

  // Handle phone number edit
  const handleEditPhone = () => {
    setPhoneNumber(userdetails.phoneNumber || '');
    setPhoneError('');
    setIsEditingPhone(true);
  };

  // Handle phone number submission
  const handleSubmitPhone = async () => {
    const validationError = validatePhoneNumber(phoneNumber);
    
    if (validationError) {
      setPhoneError(validationError);
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await api.put('/api/updatephonenumber', {
        phoneNumber: formattedPhone
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update local state
      setUserDetails(prev => ({
        ...prev,
        phoneNumber: formattedPhone
      }));
      
      // Show success message
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Phone number updated successfully',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Phone number updated successfully'
        });
      }
      
      setIsEditingPhone(false);
      setPhoneError('');
      
    } catch (error) {
      let errormessage;
      
      if (error.response) {
        errormessage = error.response.data?.message || 'Failed to update phone number';
      } else if (error.message === "Network Error") {
        errormessage = 'Network error. Please check your connection';
      } else {
        errormessage = 'Something went wrong. Please try again.';
      }
      
      setPhoneError(errormessage);
      
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          errormessage,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errormessage
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle phone number input change
  const handlePhoneChange = (text) => {
    setPhoneNumber(text);
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={styles.loadingText}>Loading.....</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state with retry button
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={false}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Unable to Load Profile</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchUserDetails}
            style={styles.retryButton}
            contentStyle={styles.retryButtonContent}
            icon="refresh"
          >
            Try Again
          </Button>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButtonError}
            contentStyle={styles.retryButtonContent}
            icon="logout"
          >
            Logout
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#007AFF" 
        translucent={false}
      />
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with background */}
          <View style={styles.headerBackground}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Profile</Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={24}
                      onPress={() => setMenuVisible(true)}
                      style={styles.menuButton}
                    />
                  }
                >
                  <Menu.Item onPress={() => { setMenuVisible(false); console.log('Report issue') }} title="Report Issue" />
                </Menu>
              </View>

              <View style={styles.profileSection}>
                <Avatar.Image
                  size={100}
                  source={require('../assets/avatar.jpg')}
                  style={styles.avatar}
                />
                <Text style={styles.name}>{userdetails?.firstName?? 'ChumbaConnect'} {userdetails?.lastName ?? 'User'}</Text>
                <Text style={styles.email}>{userdetails?.email ?? 'chumbaconnectuser@mashikutech.co.tz'}</Text>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userdetails.totalProperties || 0}</Text>
                    <Text style={styles.statLabel}>Properties</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userdetails.totalViews || 0}</Text>
                    <Text style={styles.statLabel}>Views</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userdetails.averageRating || 0}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Personal Information */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.infoItem}>
                <Ionicons name="call" size={20} color="#007AFF" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{userdetails.phoneNumber || 'Not provided'}</Text>
                </View>
                <TouchableOpacity onPress={handleEditPhone} style={styles.editIcon}>
                  <Ionicons name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="briefcase" size={20} color="#007AFF" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>{userdetails.role || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color="#007AFF" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {userdetails.memberSince ? new Date(userdetails.memberSince).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : 'Not available'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Additional Options */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>More Options</Text>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon} size={22} color="#007AFF" style={styles.menuIcon} />
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
              contentStyle={styles.buttonContent}
              icon="logout"
            >
              Logout
            </Button>
          </View>

          <Text style={styles.versionText}>ChumbaConnect v1.0.0</Text>
        </ScrollView>
      </View>

      {/* Edit Phone Number Modal */}
      <Portal>
        <Modal
          visible={isEditingPhone}
          onDismiss={() => setIsEditingPhone(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Phone Number</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setIsEditingPhone(false)}
              />
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                Enter your phone number. It will be formatted as 255XXXXXXXXX
              </Text>
              
              <TextInput
                style={[styles.phoneInput, phoneError ? styles.inputError : null]}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                autoFocus={true}
                maxLength={15} // Allow some extra characters for formatting
              />
              
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : (
                <Text style={styles.hintText}>
                  Format: 255XXXXXXXXX or 0XXXXXXXXX or +255XXXXXXXXX
                </Text>
              )}
              
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Will be sent as:</Text>
                <Text style={styles.previewValue}>
                  {phoneNumber ? formatPhoneNumber(phoneNumber) : 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setIsEditingPhone(false)}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmitPhone}
                style={styles.submitButton}
                loading={isSubmitting}
                disabled={isSubmitting || !phoneNumber}
              >
                Update
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    color: '#800080',
    fontSize: 16,
  },
  headerBackground: {
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
  },
  headerContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    margin: 0,
  },
  profileSection: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  editIcon: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  actions: {
    padding: 20,
    paddingBottom: 30,
  },
  actionButton: {
    borderRadius: 10,
    marginBottom: 15,
  },
  logoutButton: {
    borderColor: '#e74c3c',
  },
  buttonContent: {
    height: 50,
  },
  versionText: {
    textAlign: 'center',
    color: '#bdc3c7',
    marginBottom: 30,
    fontSize: 12,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    maxWidth: 200,
  },
  logoutButtonError: {
    borderRadius: 10,
    borderColor: '#e74c3c',
    width: '100%',
    maxWidth: 200,
  },
  retryButtonContent: {
    height: 50,
  },
  // Modal styles
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 20,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 8,
  },
  hintText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  previewContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e4ff',
  },
  previewLabel: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cancelButton: {
    minWidth: 80,
  },
  submitButton: {
    minWidth: 100,
    backgroundColor: '#007AFF',
  },
});