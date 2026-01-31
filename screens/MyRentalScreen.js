import React, { useRef, useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, TouchableOpacity, Linking, Alert, Modal, TouchableWithoutFeedback, Platform, ToastAndroid,  StatusBar, RefreshControl,ScrollView } from 'react-native';
import { Text, Button, Card, IconButton, Divider, Portal, TextInput, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list"; // Added FlashList import

import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './Config';
import Toast from 'react-native-toast-message';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import api from '../api/api';

const { width, height } = Dimensions.get('window');

export default function MyRentalScreen({ navigation, route }) {
  const { targetPropertyId } = route.params || {};
  const listRef = useRef(null);
  const rentalItemRefs = useRef({});
  const [highlightId, setHighlightId] = useState(null);

  const [rentalsData, setRentalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  // useEffect(() => {
  //   fetchApprovedRentals();
  // }, []);

  const fetchApprovedRentals = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please login to view your rentals");
        navigation.goBack();
        return;
      }

      const response = await api.get(`/api/myrental`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRentalsData(response.data.rooms);
     
    } catch (error) {
      if (!toastShown) {
        setToastShown(true);
        
        let errormessage;
        
        if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
          errormessage = 'Unable to connect. Please check your internet connection or try again later.';
        } else if (error.request && !error.response) {
          errormessage = 'Server is not responding. Please try again later.';
        } else if (error.response) {
          errormessage =
            error.response.data?.message ||
            "Something went wrong on the server.";
        } else {
          errormessage = 'Something went wrong. Please try again.';
        }
        
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            errormessage,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type: 'error',
            text1:'Error',
            text2: errormessage
          });
        }

        setTimeout(() => setToastShown(false), 3000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApprovedRentals();
  }, []);

  useEffect(() => {
    if (rentalsData.length > 0 && targetPropertyId) {
      setTimeout(() => {
        const index = rentalsData.findIndex(rental => rental.id === targetPropertyId);
        if (index !== -1) {
          // Scroll to the highlighted item
          listRef.current?.scrollToIndex({
            index: index,
            animated: true,
            viewPosition: 0.1 // Scroll to show the item at 10% from top
          });
          setHighlightId(targetPropertyId);
          setTimeout(() => setHighlightId(null), 3000);
        }
      }, 400);
    }
  }, [rentalsData, targetPropertyId]);

  useFocusEffect(
    useCallback(() => {
      fetchApprovedRentals();
    }, [])
  );

  const renderRentalCard = useCallback(({ item, index }) => {
    return (
      <RentalCard
        key={item.id}
        ref={el => {
          if (el) {
            rentalItemRefs.current[item.id] = el;
          } else {
            delete rentalItemRefs.current[item.id];
          }
        }}
        rental={item}
        navigation={navigation}
        isLast={index === rentalsData.length - 1}
        highlighted={highlightId === item.id}
      />
    );
  }, [rentalsData.length, highlightId, navigation]);

  const ListHeaderComponent = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Rentals</Text>
      <View style={styles.headerRight}>
        <IconButton
          icon="refresh"
          size={20}
          onPress={onRefresh}
          disabled={refreshing}
          iconColor="#6B46C1"
        />
        <Text style={styles.headerSubtitle}>
          You have {(rentalsData?.length ?? 0)} rental{(rentalsData?.length ?? 0) !== 1 ? 's' : ''}

        </Text>
      </View>
    </View>
  ), [rentalsData.length, refreshing, onRefresh]);

  const ListEmptyComponent = useCallback(() => (
    <View style={styles.noDataContainer}>
      <Ionicons name="home-outline" size={64} color="#ccc" />
      <Text style={styles.noDataText}>No approved rentals found</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        buttonColor="#6B46C1"
      >
        Go Back
      </Button>
    </View>
  ), [navigation]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={{ marginTop: 10, color: '#800080', fontSize: 16 }}>
            Loading rental Information..
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <FlashList
        ref={listRef}
        data={rentalsData}
        renderItem={renderRentalCard}
        keyExtractor={(item) => item.id}
        estimatedItemSize={400} // Estimated height of each rental card
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B46C1']}
            tintColor="#6B46C1"
            title="Pull to refresh"
            titleColor="#6B46C1"
          />
        }
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          // Fallback for scroll to index
          listRef.current?.scrollToOffset({
            offset: index * averageItemLength,
            animated: true,
          });
        }}
      />
    </SafeAreaView>
  );
}

// Individual Rental Card Component
const RentalCard = React.forwardRef(({ rental, navigation, isLast, highlighted }, ref) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [rating, setRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const fetchRating = async () => {
      try {
        if (!rental.owner || !rental.owner.id) return;

        const token = await AsyncStorage.getItem("userToken");
        const response = await api.get(
          `/api/rating/${rental.owner.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
      } catch (error) {
        console.log("Error fetching rating:", error);
      }
    };

    fetchRating();
  }, [rental.owner?.id]);

  const getRentalStatus = () => {
    const isActiveRental = rental.isActiveRental === true;
    const isApprovedRequestOnly = rental.isApprovedRequestOnly === true && !isActiveRental;
    
    return {
      isActiveRental,
      isApprovedRequestOnly,
      status: isActiveRental ? 'active' : isApprovedRequestOnly ? 'approved' : 'unknown'
    };
  };

  const rentalStatus = getRentalStatus();

  const standardizePhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '255' + cleaned.substring(1);
    } else if (cleaned.startsWith('255')) {
      return cleaned;
    } else if (cleaned.startsWith('+255')) {
      return cleaned.substring(1);
    } else {
      return cleaned;
    }
  };

  const callLandlord = () => {
    if (!rental.owner?.phone) {
      Alert.alert('Error', 'Landlord phone number not available');
      return;
    }
    
    const standardizedPhone = standardizePhoneNumber(rental.owner.phone);
    if (standardizedPhone) {
      Linking.openURL(`tel:${rental.owner.phone}`);
    } else {
      Alert.alert('Error', 'Invalid phone number format');
    }
  };

  const openWhatsApp = () => {
    if (!rental.owner?.phone) {
      Alert.alert('Error', 'Landlord phone number not available');
      return;
    }

    const standardizedPhone = standardizePhoneNumber(rental.owner.phone);
    if (standardizedPhone) {
      const whatsappUrl = `whatsapp://send?phone=${standardizedPhone}`;
      
      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            const webUrl = `https://wa.me/${standardizedPhone}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch((err) => {
          console.error('Error opening WhatsApp:', err);
          Alert.alert('Error', 'Could not open WhatsApp');
        });
    } else {
      Alert.alert('Error', 'Invalid phone number format');
    }
  };

  const handlePayRent = () => {
    if (rental) {
      navigation.navigate('Payment', { 
        roomData: rental,
        rentalRequestId: rental.id 
      });
    } else {
      Alert.alert('Error', 'Property information not available');
    }
  };

  const openImageModal = (index) => {
    setModalImageIndex(index);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  const handleModalSwipe = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setModalImageIndex(index);
  };

  // const openGoogleMaps = () => {
  //   if (!rental.location) {
  //     Alert.alert('Error', 'Location information not available');
  //     return;
  //   }

  //   const encodedLocation = encodeURIComponent(rental.location);
  //   const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    
  //   Linking.openURL(url).catch(err => {
  //     console.error("Failed to open Google Maps:", err);
  //     Alert.alert("Error", "Could not open Google Maps.");
  //   });
  // };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchPaymentDetails = async (propertyId) => {
    if(!propertyId){
      return;
    }
    try {
      setGeneratingReceipt(true);
      const token = await AsyncStorage.getItem('userToken');
      const url = `/api/payments/property/${propertyId}`;

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        setPaymentDetails(response.data);
        setReceiptModalVisible(true);
      } else {
        Alert.alert("No Payment", "No payment record found for this property.");
      }

    } catch (error) {
     // console.log("Payment fetch error:", error);
      
      if (error.response?.status === 404) {
        Alert.alert("No Payment", "No payment record found for this property.");
      } else {
        Alert.alert("Error", "Failed to load payment details. Please try again.");
      }
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const generateReceiptHTML = (paymentData) => {
    const data = typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #6B46C1;
            border-radius: 10px;
            padding: 20px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #6B46C1;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6B46C1;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .amount {
            font-size: 18px,
            font-weight: bold,
            color: #6B46C1,
          }
          .status-success {
            color: #6B46C1,
            font-weight: bold,
          }
          .footer {
            text-align: center,
            margin-top: 30px,
            padding-top: 15px,
            border-top: 1px solid #eee,
            color: #666,
            font-size: 12px,
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">ChumbaConnect</div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
          </div>
          
          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="row">
              <span class="label">Amount:</span>
              <span class="amount">Tsh ${data.payment?.amount || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Status:</span>
              <span class="status-success">${data.payment?.status || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Payment Channel:</span>
              <span class="value">${data.payment?.channel || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Reference:</span>
              <span class="value">${data.payment?.orderReference || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Payment Date:</span>
              <span class="value">${new Date(data.payment?.createdAt).toLocaleDateString() || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Due Date:</span>
              <span class="value">${data.payment?.dueDate || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Duration:</span>
              <span class="value">${data.payment?.duration || 'N/A'} months</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Property Information</div>
            <div class="row">
              <span class="label">Property Name:</span>
              <span class="value">${data.property?.name || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Location:</span>
              <span class="value">${data.property?.location || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Landlord Information</div>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">${data.landlord?.firstName || 'N/A'} ${data.landlord?.lastName || ''}</span>
            </div>
            <div class="row">
              <span class="label">Phone:</span>
              <span class="value">${data.landlord?.phone || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Tenant Information</div>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">${data.tenant?.firstName || 'N/A'} ${data.tenant?.lastName || ''}</span>
            </div>
            <div class="row">
              <span class="label">Phone:</span>
              <span class="value">${data.tenant?.phone || 'N/A'}</span>
            </div>
          </div>

          <div class="footer">
            <div>Receipt generated on: ${new Date(data.generatedAt).toLocaleString()}</div>
            <div>Thank you for your payment!</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const printReceipt = async () => {
    try {
      const html = generateReceiptHTML(paymentDetails);
      
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Payment Receipt'
        });
      } else {
        Alert.alert("Success", "Receipt generated successfully!");
      }
    } catch (error) {
     // console.error('Error generating receipt:', error);
      Alert.alert("Error", "Failed to generate receipt");
    }
  };

  const getRentalDuration = () => {
    if (rental.minMonths) {
      return `${rental.minMonths} month${rental.minMonths > 1 ? 's' : ''}`;
    }
    return 'Not specified';
  };

  const getMoveInDate = () => {
    return formatDate(new Date().toISOString());
  };

  const ReceiptModal = () => (
    <Modal
      visible={receiptModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setReceiptModalVisible(false)}
    >
      <View style={styles.receiptModalContainer}>
        <View style={styles.receiptModalContent}>
          <View style={styles.receiptModalHeader}>
            <Text style={styles.receiptModalTitle}>Payment Receipt</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setReceiptModalVisible(false)}
            />
          </View>

          {paymentDetails && (
            <ScrollView style={styles.receiptDetails}>
              <View style={styles.receiptSection}>
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount:</Text>
                  <Text style={styles.receiptAmount}>Tsh {paymentDetails.payment?.amount ?? 0}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status:</Text>
                  <Text style={[styles.receiptValue, styles.statusSuccess]}>
                    {paymentDetails.payment?.status?? 'UNKNOWN'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Reference:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.payment?.orderReference}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Date:</Text>
                  <Text style={styles.receiptValue}>
                  {paymentDetails.payment?.createdAt
  ? new Date(paymentDetails.payment.createdAt).toLocaleDateString()
  : 'N/A'}

                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Due Date:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.payment?.dueDate ?? 'N/A'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Duration:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.payment?.duration ?? 'N/A'} months</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Channel:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.payment?.channel?? 'UNKNOWN'}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.sectionTitle}>Property Information</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Property:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.property?.name?? 'ChumbaConnect Property'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Location:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.property?.location ?? 'Tanzania'}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.sectionTitle}>Landlord Information</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Name:</Text>
                  <Text style={styles.receiptValue}>
                    {paymentDetails.landlord?.firstName ?? 'ChumbaConnect'} {paymentDetails.landlord?.lastName ?? 'Landlord'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Phone:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.landlord?.phone ?? '06XXXXXXX'}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.sectionTitle}>Tenant Information</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Name:</Text>
                  <Text style={styles.receiptValue}>
                    {paymentDetails.tenant?.firstName?? 'ChumbaConnect'} {paymentDetails.tenant?.lastName?? 'Landlord'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Phone:</Text>
                  <Text style={styles.receiptValue}>{paymentDetails.tenant?.phone ?? '06XXXXXXX'}</Text>
                </View>
              </View>
            </ScrollView>
          )}

          <View style={styles.receiptActions}>
            <Button
              mode="outlined"
              onPress={() => setReceiptModalVisible(false)}
              style={styles.receiptButton}
              textColor="#6B46C1"
            >
              Close
            </Button>
            <Button
              mode="contained"
              onPress={printReceipt}
              style={styles.receiptButton}
              loading={generatingReceipt}
              buttonColor="#6B46C1"
            >
              Download PDF
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Card 
      ref={ref}
      style={[styles.rentalCard, isLast && styles.lastCard, highlighted && styles.highlightedCard]}
    >
      <Card.Content style={styles.cardContent}>
        {/* Status Banner */}
        <View style={[
          styles.statusBanner,
          rentalStatus.isActiveRental ? styles.activeBanner : styles.approvedRequestBanner
        ]}>
          <Ionicons 
            name={rentalStatus.isActiveRental ? "checkmark-circle" : "time"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.statusText}>
            {rentalStatus.isActiveRental ? 'Active Rental' : 'Approved Request'}
          </Text>
        </View>

        {/* Additional info for approved request only */}
        {rentalStatus.isApprovedRequestOnly && !rentalStatus.isActiveRental && (
          <View style={styles.infoMessage}>
            <Ionicons name="information-circle" size={16} color="#6B46C1" />
            <Text style={styles.infoText}>
              This is an approved rental request. Payment required to activate rental.
            </Text>
          </View>
        )}

        {/* Compact Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={styles.compactCarousel}
          >
           {Array.isArray(rental?.images) && rental.images.slice(0, 3).map(
  (image, index) => 
    typeof image === 'string' && (
      <TouchableOpacity 
        key={index} 
        onPress={() => openImageModal(index)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: image }} 
          style={styles.compactCarouselImage} 
        />
      </TouchableOpacity>
    )
)}

          </ScrollView>
          
         {Array.isArray(rental?.images) && rental.images.length > 0 && (
  <View style={styles.pagination}>
    {rental.images.slice(0, 3).map((_, index) => (
      <View 
        key={index} 
        style={[
          styles.paginationDot, 
          currentIndex === index && styles.paginationDotActive
        ]} 
      />
    ))}
  </View>
)}

        </View>

        {/* Essential Information */}
        <View style={styles.essentialInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>{rental.title || 'No Title'}</Text>
          
          <View style={styles.priceLocation}>
            <Text style={styles.compactPrice}>Tsh: {rental.price || 'N/A'}/month</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={12} color="#666" />
              <Text style={styles.compactLocation} numberOfLines={1}>{rental.location || 'Location not specified'}</Text>
            </View>
          </View>

          {/* Room Type */}
          <View style={styles.roomTypeContainer}>
            <Ionicons name="business" size={12} color="#6B46C1" />
            <Text style={styles.roomTypeText}>{rental.roomType || 'Room'}</Text>
          </View>

          {/* Quick Rental Details */}
          <View style={styles.quickDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={12} color="#6B46C1" />
              <Text style={styles.detailText}>{getMoveInDate()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={12} color="#6B46C1" />
              <Text style={styles.detailText}>{getRentalDuration()}</Text>
            </View>
          </View>

          {/* Amenities Preview */}
          {rental.amenities && rental.amenities.length > 0 && (
            <View style={styles.amenitiesPreview}>
              <Text style={styles.amenitiesLabel}>Amenities: </Text>
              <Text style={styles.amenitiesText} numberOfLines={1}>
                {rental.amenities.slice(0, 3).join(', ')}
                {rental.amenities.length > 3 && '...'}
              </Text>
            </View>
          )}

          {/* Landlord Quick Info */}
          <View style={styles.landlordQuickInfo}>
            <View style={styles.landlordLeft}>
              <Text style={styles.landlordName} numberOfLines={1}>
                {rental.owner?.firstname ?? 'ChumbaConnect'} {rental.owner?.lastname?? 'Landlord'}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{rating || 0.0} ({totalReviews || 0})</Text>
              </View>
            </View>
            {rental.owner?.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#6B46C1" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={callLandlord}
            style={[styles.actionButton, styles.callButton]}
            contentStyle={styles.compactButtonContent}
            compact
            textColor="#6B46C1"
          >
            Call
          </Button>
          <Button
            mode="outlined"
            onPress={openWhatsApp}
            style={[styles.actionButton, styles.chatButton]}
            contentStyle={styles.compactButtonContent}
            compact
            textColor="#6B46C1"
          >
            Chat
          </Button>
          
          <Button
            mode="contained"
            onPress={handlePayRent}
            style={[styles.actionButton, styles.payButton]}
            contentStyle={styles.compactButtonContent}
            compact
            buttonColor="#6B46C1"
          >
            Pay
          </Button>
          
          {rentalStatus.isActiveRental && (
            <Button
              mode="text"
              onPress={() => fetchPaymentDetails(rental.id)}
              style={styles.viewDetailsButton}
              contentStyle={styles.compactButtonContent}
              compact
              loading={generatingReceipt}
              disabled={generatingReceipt}
              textColor="#6B46C1"
            >
              {generatingReceipt ? 'Loading...' : 'Receipt'}
            </Button>
          )}
        </View>
      </Card.Content>

      {/* Full Screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalContainer}>
          <TouchableWithoutFeedback onPress={closeImageModal}>
            <View style={styles.imageModalBackground} />
          </TouchableWithoutFeedback>
          
          <View style={styles.imageModalContent}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleModalSwipe}
              contentOffset={{ x: modalImageIndex * width, y: 0 }}
            >
             {Array.isArray(rental?.images) && rental.images.map(
  (image, index) => 
    typeof image === 'string' && (
      <Image 
        key={index} 
        source={{ uri: image }} 
        style={styles.fullScreenImage} 
        resizeMode="contain"
      />
    )
)}

            </ScrollView>
            
            <View style={styles.imageModalPagination}>
              <Text style={styles.imageCounter}>
                {modalImageIndex + 1} / {rental.images ? rental.images.length : 0}
              </Text>
            </View>
            
            <IconButton
              icon="close"
              size={24}
              style={styles.closeModalButton}
              onPress={closeImageModal}
              color="#fff"
            />
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <ReceiptModal />
    </Card>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    marginTop: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6B46C1',
    
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    marginLeft: 8,
  },
  rentalCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  lastCard: {
    marginBottom: 20,
  },
  cardContent: {
    padding: 0,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  activeBanner: {
    backgroundColor: '#6B46C1',
  },
  approvedRequestBanner: {
    backgroundColor: '#9F7AEA',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD6FE',
  },
  infoText: {
    fontSize: 12,
    color: '#6B46C1',
    marginLeft: 6,
    flex: 1,
  },
  carouselContainer: {
    height: 150,
    position: 'relative',
  },
  compactCarousel: {
    height: 150,
  },
  compactCarouselImage: { 
    width: width - 40, 
    height: 150,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    margin: 2,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
  },
  essentialInfo: {
    padding: 15,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  priceLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  compactLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  roomTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomTypeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  quickDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  amenitiesPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  amenitiesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  amenitiesText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  landlordQuickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landlordLeft: {
    flex: 1,
  },
  landlordName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: '#7f8c8d',
    marginLeft: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#6B46C1',
    marginLeft: 2,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 5,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 2,
    borderColor: '#6B46C1',
  },
  callButton: {
    borderColor: '#6B46C1',
  },
  chatButton: {
    borderColor: '#6B46C1',
  },
  payButton: {
    backgroundColor: '#6B46C1',
  },
  viewDetailsButton: {
    flex: 1,
  },
  compactButtonContent: {
    height: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    minHeight: height * 0.8,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 16,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  imageModalContent: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  imageModalPagination: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  receiptModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    width: '100%',
    maxHeight: '80%',
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  receiptModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  receiptDetails: {
    padding: 16,
  },
  receiptSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#333',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  statusSuccess: {
    color: '#6B46C1',
    fontWeight: 'bold',
  },
  receiptActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  receiptButton: {
    flex: 1,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: "#6B46C1",
    backgroundColor: "#f5e9ff",
  },
});