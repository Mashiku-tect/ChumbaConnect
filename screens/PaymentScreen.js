import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  TouchableRipple,
  Card,
  Button,
  RadioButton,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import axios from "axios";
import BASE_URL from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../api/api';

const MOBILE_MONEY_FEES = [
   { min: 0, max: 100, fee: 0 },
  { min: 100, max: 999, fee: 52 },
  { min: 1000, max: 1999, fee: 72 },
  { min: 2000, max: 2999, fee: 104 },
  { min: 3000, max: 3999, fee: 116 },
  { min: 4000, max: 4999, fee: 168 },
  { min: 5000, max: 6999, fee: 234 },
  { min: 7000, max: 7999, fee: 360 },
  { min: 8000, max: 9999, fee: 430 },
  { min: 10000, max: 14999, fee: 642 },
  { min: 15000, max: 19999, fee: 680 },
  { min: 20000, max: 29999, fee: 700 },
  { min: 30000, max: 39999, fee: 980 },
  { min: 40000, max: 49999, fee: 1038 },
  { min: 50000, max: 99999, fee: 1460 },
  { min: 100000, max: 199999, fee: 1868 },
  { min: 200000, max: 299999, fee: 2220 },
  { min: 300000, max: 399999, fee: 3180 },
  { min: 400000, max: 499999, fee: 3764 },
  { min: 500000, max: 599999, fee: 4672 },
  { min: 600000, max: 699999, fee: 5712 },
  { min: 700000, max: 799999, fee: 6560 },
  { min: 800000, max: 899999, fee: 7800 },
  { min: 900000, max: 1000000, fee: 8508 },
  { min: 1000001, max: 3000000, fee: 9346 },
  { min: 3000001, max: 5000000, fee: 9890 }
];

const PaymentScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading payment details....');
  const roomData = route.params?.roomData || null;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMonths, setSelectedMonths] = useState(roomData?.minMonths || 3);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize and fetch additional data if needed
  useEffect(() => {
    const initializePaymentScreen = async () => {
      try {
        setIsLoading(true);
        
        // Check if roomData exists
        if (!roomData) {
          setLoadingMessage('No room data found');
          // Optional: You could fetch room data here if you have an ID
          // await fetchRoomData(route.params?.roomId);
          return;
        }
        
        // Simulate loading for better UX (optional)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If you need to fetch additional payment methods or user data:
        // await fetchPaymentMethods();
        // await fetchUserProfile();
        
      } catch (error) {
        console.error('Error initializing payment screen:', error);
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            'Failed to load payment details',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load payment details'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePaymentScreen();
  }, [roomData]);

  // Calculate processing fee based on mobile money fees array
  const getProcessingFee = (amount) => {
    const feeStructure = MOBILE_MONEY_FEES.find(
      feeRange => amount >= feeRange.min && amount <= feeRange.max
    );
    return feeStructure ? feeStructure.fee : 0;
  };

  // Calculate amounts
  const monthlyRent = roomData?.price || 0;
  const totalRent = monthlyRent * selectedMonths;
  const processingFee = getProcessingFee(totalRent);
  const totalAmount = totalRent + processingFee;

  // Purple color theme
  const PURPLE_COLOR = '#8B5CF6';

  const paymentMethods = [
    { id: 'halopesa', name: 'Halopesa', color: PURPLE_COLOR },
    { id: 'airtel', name: 'Airtel Money', color: PURPLE_COLOR },
    { id: 'mixx', name: 'Mixx by YAS', color: '#00A859' },
  ];

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^255\d{9}$/;
    return phoneRegex.test(number);
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          "Please enter a valid phone number in format 255XXXXXXXXX",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'error',
          text1:'Error',
          text2:'Please enter a valid phone number in format 255XXXXXXXXX'
        })
      }
      return;
    }

    if (!selectedPaymentMethod) {
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          "Please select a payment method",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'success',
          text1:'Success',
          text2:'Please select a payment method'
        })
      }
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        phoneNumber: phoneNumber,
        amount: totalAmount,
        propertyid: roomData.id,
        durationMonths: selectedMonths,
      };

      const token = await AsyncStorage.getItem('userToken');
      const res = await api.post(`/api/payments/initiate`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      navigation.goBack();
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
          "Something went wrong on the server.";
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
          text1:'Error',
          text2: errormessage
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMonthOptions = () => {
    if (!roomData?.minMonths) return [];
    const options = [];
    const maxMonths = roomData.minMonths * 4;
    for (let i = roomData.minMonths; i <= maxMonths; i += roomData.minMonths) {
      options.push(i);
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Loading Screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContent}>
          <ActivityIndicator 
            size="small" 
            color={PURPLE_COLOR}
            animating={true}
          />
          <Text variant="titleMedium" style={styles.loadingText}>
            {loadingMessage}
          </Text>
          <Text variant="bodyMedium" style={styles.loadingSubtext}>
            Preparing your payment details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!roomData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text variant="titleLarge">No room data provided</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: PURPLE_COLOR }]}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Complete Payment
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Secure payment processing
            </Text>
          </View>

          {/* Property Summary */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Property Details
              </Text>
              {roomData.images?.[0] && (
                <Image 
                  source={{ uri: roomData?.images?.[0] ?? 'data:image/jpeg;base64,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' }} 
                  style={styles.propertyImage} 
                />
              )}
              <Text variant="titleMedium" style={styles.propertyTitle}>
                {roomData?.title ?? 'ChumbaConnect Property'}
              </Text>
              <Text variant="bodyMedium" style={styles.propertyLocation}>
                {roomData?.location ?? 'Tanzania'}
              </Text>
              <Text variant="bodyMedium" style={styles.propertyType}>
                {roomData?.roomType ?? 'Unknown'}
              </Text>
              <Text variant="titleSmall" style={[styles.monthlyRent, { color: PURPLE_COLOR }]}>
                TZS {(monthlyRent ?? 0).toLocaleString()} / month
              </Text>
            </Card.Content>
          </Card>

          {/* Duration Selection */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Rental Duration
              </Text>
              <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                Minimum stay: {roomData?.minMonths ?? 0} months (multiples only)
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.monthsScroll}
              >
                {monthOptions.map((months) => (
                  <TouchableRipple
                    key={months}
                    onPress={() => setSelectedMonths(months)}
                    style={[
                      styles.monthOption,
                      selectedMonths === months && [styles.monthOptionSelected, { backgroundColor: PURPLE_COLOR, borderColor: PURPLE_COLOR }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthOptionText,
                        selectedMonths === months && styles.monthOptionTextSelected,
                      ]}
                    >
                      {months} {months === 1 ? 'Month' : 'Months'}
                    </Text>
                  </TouchableRipple>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Payment Method Selection */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Payment Method
              </Text>
              <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                We accept Halopesa, Airtel Money, and Mixx by YAS only
              </Text>
              <RadioButton.Group
                onValueChange={setSelectedPaymentMethod}
                value={selectedPaymentMethod}
              >
                <View style={styles.paymentMethods}>
                  {paymentMethods.map((method) => (
                    <TouchableRipple
                      key={method.id}
                      onPress={() => setSelectedPaymentMethod(method.id)}
                      style={styles.paymentMethodItem}
                    >
                      <View style={styles.paymentMethodContent}>
                        <RadioButton.Android
                          value={method.id}
                          color={method.color}
                          uncheckedColor="#666"
                        />
                        <Text variant="bodyLarge" style={styles.paymentMethodText}>
                          {method.name}
                        </Text>
                      </View>
                    </TouchableRipple>
                  ))}
                </View>
              </RadioButton.Group>
            </Card.Content>
          </Card>

          {/* Phone Number Input */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Phone Number
              </Text>
              <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                Format: 255XXXXXXXXX
              </Text>
              <TextInput
                mode="outlined"
                placeholder="255XXXXXXXXX"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={12}
                style={styles.phoneInput}
                outlineColor="#e0e0e0"
                activeOutlineColor={PURPLE_COLOR}
              />
            </Card.Content>
          </Card>

          {/* Amount Breakdown */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Amount Breakdown
              </Text>
              <View style={styles.amountRow}>
                <Text variant="bodyMedium">Rent ({selectedMonths} months)</Text>
                <Text variant="bodyMedium" style={styles.amountValue}>
                  TZS {(totalRent ?? 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text variant="bodyMedium">Processing Fee</Text>
                <Text variant="bodyMedium" style={styles.amountValue}>
                  TZS {(processingFee ?? 0).toLocaleString()}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.amountRow}>
                <Text variant="titleMedium" style={styles.totalLabel}>
                  Total Amount
                </Text>
                <Text variant="titleMedium" style={[styles.totalValue, { color: PURPLE_COLOR }]}>
                  TZS {(totalAmount ?? 0).toLocaleString()}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.feeNote}>
                * Processing fee based on mobile money provider rates
              </Text>
            </Card.Content>
          </Card>

          {/* Payment Button */}
          <Button
            mode="contained"
            onPress={handlePayment}
            disabled={!validatePhoneNumber(phoneNumber) || !selectedPaymentMethod || isProcessing}
            loading={isProcessing}
            style={[
              styles.payButton,
              { backgroundColor: PURPLE_COLOR },
              (!validatePhoneNumber(phoneNumber) || !selectedPaymentMethod || isProcessing) &&
                styles.payButtonDisabled,
            ]}
            labelStyle={styles.payButtonText}
          >
            {isProcessing ? 'Processing...' : `Pay TZS ${totalAmount.toLocaleString()}`}
          </Button>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#666',
    textAlign: 'center',
    maxWidth: 250,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS==='ios' ? 0:StatusBar.currentHeight,
  },
  headerTitle: {
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  propertyImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  propertyTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  propertyLocation: {
    color: '#666',
    marginBottom: 2,
  },
  propertyType: {
    color: '#666',
    marginBottom: 8,
  },
  monthlyRent: {
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#666',
    marginBottom: 12,
  },
  monthsScroll: {
    flexDirection: 'row',
  },
  monthOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  monthOptionSelected: {
    borderColor: '#8B5CF6',
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  monthOptionTextSelected: {
    color: 'white',
  },
  paymentMethods: {
    gap: 8,
  },
  paymentMethodItem: {
    borderRadius: 8,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentMethodText: {
    marginLeft: 8,
  },
  phoneInput: {
    backgroundColor: 'white',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountValue: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  feeNote: {
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  payButton: {
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityCard: {
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  securityText: {
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginTop: 16,
  },
});

export default PaymentScreen;