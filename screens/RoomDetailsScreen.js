import React, { useRef, useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity, Linking, Alert, Modal, TouchableWithoutFeedback, ActivityIndicator, PanResponder, Platform, ToastAndroid, StatusBar } from 'react-native';
import { Text, Button, Card, IconButton, Divider, Portal, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Import Audio for audio mode configuration
import { Video, AVPlaybackStatus } from 'expo-av'; // expo-av imports

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import api from '../api/api';

const { width, height } = Dimensions.get('window');

// Video Player Component - Updated to use expo-av
const VideoPlayerComponent = ({ videoUri }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);        // in milliseconds
  const [duration, setDuration] = useState(0);        // in milliseconds
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);

  // Set audio mode for video playback
  useEffect(() => {
    const setAudioMode = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };
    setAudioMode();
  }, []);

  const onPlaybackStatusUpdate = (status) => {
    setPlaybackStatus(status);
    
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.error) {
        //console.error('Video playback error:', status.error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const replayVideo = async () => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(0);
      await videoRef.current.playAsync();
    }
  };

  const handleSeek = async (xPosition) => {
    if (duration === 0 || !videoRef.current) return;

    const progressBarWidth = width - 40;
    const seekToMs = (xPosition / progressBarWidth) * duration;
    
    try {
      await videoRef.current.setPositionAsync(seekToMs);
      setPosition(seekToMs);
    } catch (error) {
     // console.error('Seek error:', error);
    }
  };

  const progressBarPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleSeek(evt.nativeEvent.locationX),
    onPanResponderMove: (evt) => handleSeek(evt.nativeEvent.locationX),
    onPanResponderRelease: (evt) => handleSeek(evt.nativeEvent.locationX),
  });

  const formatTime = (millis) => {
    if (!millis || millis === 0) return '0:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleReadyForDisplay = () => {
    setIsLoading(false);
  };

  const handleError = (error) => {
    console.error('Video playback error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Failed to Load Video</Text>
        <Text style={styles.errorSubtext}>The video walkthrough could not be loaded.</Text>
      </View>
    );
  }

  return (
    <View style={styles.videoWrapper}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.videoPlayer}
        resizeMode="contain"
        useNativeControls={false}
        isLooping={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onLoadStart={handleLoadStart}
        onReadyForDisplay={handleReadyForDisplay}
        onError={handleError}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {/* Custom controls */}
      {!isLoading && (
        <>
          <TouchableOpacity
            style={styles.videoOverlay}
            onPress={toggleControls}
            activeOpacity={1}
          />

          {showControls && (
            <View style={styles.controlsOverlay}>
              {/* Replay button when finished */}
              {playbackStatus?.didJustFinish || (position >= duration && duration > 0) ? (
                <TouchableOpacity style={styles.replayButton} onPress={replayVideo}>
                  <Ionicons name="refresh-circle" size={60} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.replayText}>Replay</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={60}
                    color="rgba(255,255,255,0.9)"
                  />
                </TouchableOpacity>
              )}

              {/* Progress bar */}
              {duration > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar} {...progressBarPanResponder.panHandlers}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(position / duration) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>
                    {formatTime(position)} / {formatTime(duration)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default function RoomDetailsScreen({ route, navigation }) {
  const { room } = route.params;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rentalModalVisible, setRentalModalVisible] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const [rating, setRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasApprovedRequest, setHasApprovedRequest] = useState(false);
  
  // Track individual API errors
  const [fetchError, setFetchError] = useState({
    hasError: false,
    ratingError: false,
    requestCheckError: false,
    message: ''
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  // Combined effect to fetch all data
  useEffect(() => {
    fetchAllData();
  }, [room.id, room.owner.id]);

  // Main function to fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    setFetchError({
      hasError: false,
      ratingError: false,
      requestCheckError: false,
      message: ''
    });
    
    try {
      // Track view
      await trackView();
      
      // Fetch rating and check approved request in parallel
      await Promise.all([
        fetchRating(),
        checkApprovedRequest()
      ]);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setFetchError({
        hasError: true,
        ratingError: false,
        requestCheckError: false,
        message: 'Failed to load property details. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const trackView = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await api.post(`/api/properties/view/${room.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // Silently fail for view tracking
    }
  };

  const fetchRating = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await api.get(
        `/api/rating/${room.owner.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setFetchError(prev => ({ ...prev, ratingError: false }));

    } catch (error) {
      console.log("Error fetching rating:", error);
      setFetchError(prev => ({ 
        ...prev, 
        ratingError: true,
        hasError: true 
      }));
      
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          "Error fetching Landlord rating",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'error',
          text1:'Error',
          text2:'Error fetching Landlord rating'
        });
      }
    }
  };

  const checkApprovedRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await api.get(`/api/rental-requests/user/approved`, {
        headers: {  
          Authorization: `Bearer ${token}`
        }
      });
      const approvedRequests = response.data;
      const hasRequest = approvedRequests.some(req => req.PropertyId === room.id);
      setHasApprovedRequest(hasRequest);
      setFetchError(prev => ({ ...prev, requestCheckError: false }));

    } catch (error) {
      const errormessage = error.response?.data?.message || 'Failed to check rental requests';
      console.error("Error checking approved requests:", error);
      setFetchError(prev => ({ 
        ...prev, 
        requestCheckError: true,
        hasError: true 
      }));
      
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          errormessage,
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'error',
          text1:'Error',
          text2: errormessage
        });
      }
    }
  };

  // Function to retry specific failed requests
  const retryFailedRequests = async () => {
    setIsLoading(true);
    setFetchError(prev => ({ ...prev, hasError: false }));
    
    const promises = [];
    
    if (fetchError.ratingError) {
      promises.push(fetchRating());
    }
    
    if (fetchError.requestCheckError) {
      promises.push(checkApprovedRequest());
    }
    
    // If we don't have specific errors, retry all
    if (promises.length === 0) {
      promises.push(fetchRating(), checkApprovedRequest());
    }
    
    try {
      await Promise.all(promises);
      // If all promises resolve without throwing, we're good
      setFetchError({
        hasError: false,
        ratingError: false,
        requestCheckError: false,
        message: ''
      });
    } catch (error) {
      // Error is already handled in individual functions
    } finally {
      setIsLoading(false);
    }
  };

  // Function to standardize phone number format
  const standardizePhoneNumber = (phone) => {
    if (!phone) return null;
    
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Format: 0XXXXXXXXX → 255XXXXXXXXX
      return '255' + cleaned.substring(1);
    } else if (cleaned.startsWith('255')) {
      // Format: 255XXXXXXXXX → keep as is
      return cleaned;
    } else if (cleaned.startsWith('+255')) {
      // Format: +255XXXXXXXXX → 255XXXXXXXXX
      return cleaned.substring(1);
    } else {
      // If it doesn't match any expected format, return as is
      return cleaned;
    }
  };

  // Function to call landlord
  const callLandlord = () => {
    const standardizedPhone = standardizePhoneNumber(room.owner.phone);
    if (standardizedPhone) {
      Linking.openURL(`tel:${room.owner.phone}`);
    } else {
      if(Platform.OS==='android'){
               ToastAndroid.showWithGravity(
                 "Invalid Landlord Phone Number Format",
                 ToastAndroid.LONG,
                 ToastAndroid.CENTER
               );
             } else {
               Toast.show({
                 type:'error',
                 text1:'Error',
                 text2:'Invalid Landlord Phone Number Format'
               })
             }
      return;
    }
  };

  // Check if room is occupied
  const isRoomOccupied = room.occupied === true;

  // Function to open WhatsApp with landlord
  const openWhatsApp = () => {
    const standardizedPhone = standardizePhoneNumber(room.owner.phone);
    if (standardizedPhone) {
      // Create WhatsApp URL
      const whatsappUrl = `whatsapp://send?phone=${standardizedPhone}`;
      
      // Check if WhatsApp is installed
      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            // If WhatsApp is not installed, open in browser
            const webUrl = `https://wa.me/${standardizedPhone}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch((err) => {
          //console.error('Error opening WhatsApp:', err);
          if(Platform.OS==='android'){
                    ToastAndroid.showWithGravity(
                      "Error,Could not open WhatsApp",
                      ToastAndroid.LONG,
                      ToastAndroid.CENTER
                    );
                  } else {
                    Toast.show({
                      type:'error',
                      text1:'Error',
                      text2:'Error,Could not open WhatsApp'
                    })
                  }
        });
    } else {
      Alert.alert('Error', 'Invalid phone number format');
    }
  };

  // Function to show video walkthrough
  const showVideoWalkthrough = () => {
    if (room.videoWalkthrough) {
      setVideoModalVisible(true);
    } else {
      if(Platform.OS==='android'){
               ToastAndroid.showWithGravity(
                 "This property does not have a video walkthrough",
                 ToastAndroid.LONG,
                 ToastAndroid.CENTER
               );
             } else {
               Toast.show({
                 type:'info',
                 text1:'Information',
                 text2:'This property does not have a video walkthrough'
               })
             }
    }
  };

  // Check if user has an approved rental request and redirect to payment screen
  const sendRentalRequest = () => {
    // Check if room is occupied
    if (isRoomOccupied) {
      Alert.alert(
        'Property Occupied',
        'This property is currently occupied and not available for rental requests.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (hasApprovedRequest) {
      Alert.alert(
        'Info',
        'You already have an approved rental request for this property. Proceed to payment.',
        [
          {
            text: 'Go to Payment',
            onPress: () => navigation.navigate('Payment', { roomData: room })
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      setRentalModalVisible(true);
    }
  };

  // Function to handle rental request submission
  const handleSubmitRequest = async () => {
    // Validate required fields
    let errormessage;
    if (!moveInDate || !duration || !message) {
      errormessage='Missing Information,Please provide move-in date, duration and message';
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
      return;
    }

    // Validate that move-in date is not in the past
    const selectedDate = new Date(moveInDate);
    const today = new Date();
    
    // Reset time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errormessage='Invalid Date,Move-in date cannot be in the past. Please select a future date.';
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
      return;
    }

    // Validate that duration is a positive integer
    const durationNumber = parseInt(duration);
    if (isNaN(durationNumber) || !Number.isInteger(durationNumber) || durationNumber <= 0) {
      errormessage='Invalid Duration,Duration must be a positive whole number (e.g., 3, 6, 12 months).';
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
      return;
    }

    // Optional: Validate that duration is reasonable (e.g., not more than 24 months)
    if (durationNumber > 24) {
      errormessage='Invalid Duration,Duration cannot exceed 24 months. Please enter a shorter duration.';
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
      return;
    }

    setIsSendingRequest(true);

    try {
      const payload = {
        PropertyId: room.id,
        OwnerId: room.owner.id, // assuming owner has "id"
        MoveInDate: moveInDate,
        Duration: durationNumber, // Use the validated integer
        Message: message
      };
      //remove the token for testing
        //await AsyncStorage.removeItem('userToken');
      const token = await AsyncStorage.getItem('userToken');
      const response = await api.post(`/api/rentalrequest`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIsSendingRequest(false);
      setRentalModalVisible(false);
    const  responsemessage=response.data.message;
      
      if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                responsemessage,
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'success',
                text1:'Success',
                text2: responsemessage
              });
            }

      
      // Optional: Reset form fields after successful submission
      setMoveInDate('');
      setDuration('');
      setMessage('');
      
    } catch (error) {
      //console.error("Error sending request:", error.response?.data || error.message);
      
      setIsSendingRequest(false);
      let catcherrormessage;
    
            // Network error (no internet, server down, timeout)
            if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
              catcherrormessage = 'Unable to connect. Please check your internet connection or try again later.';
            }
      
            // Server did not respond (request sent, no response)
            else if (error.request && !error.response) {
              catcherrormessage = 'Server is not responding. Please try again later.';
            }
      
            // Backend responded with an error
            else if (error.response) {
              catcherrormessage =
                error.response.data?.message || // safe access
                "Something went wrong on the server.";
            }
      
            // Unknown error
            else {
              catcherrormessage = 'Something went wrong. Please try again.';
            }
      
            // Show toast
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                catcherrormessage,
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'error',
                text2:'Error',
                text2: catcherrormessage
              });
            }
    }
  };

  // Function to open image in full screen
  const openImageModal = (index) => {
    setModalImageIndex(index);
    setImageModalVisible(true);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  // Handle modal image swipe
  const handleModalSwipe = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setModalImageIndex(index);
  };

  // Function to open Google Maps with location name
  const openGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(room.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    
    Linking.openURL(url).catch(err => {
      //console.error("Failed to open Google Maps:", err);
      Alert.alert("Error", "Could not open Google Maps.");
    });
  };

  // Function to handle date selection
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format date as YYYY-MM-DD for the API
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setMoveInDate(formattedDate);
    }
  };

  // Render occupancy status badge
  const renderOccupancyStatus = () => {
    return (
      <View style={[
        styles.occupancyBadge,
        isRoomOccupied ? styles.occupiedBadge : styles.availableBadge
      ]}>
        <Ionicons 
          name={isRoomOccupied ? "close-circle" : "checkmark-circle"} 
          size={16} 
          color="#fff" 
        />
        <Text style={styles.occupancyText}>
          {isRoomOccupied ? 'Occupied' : 'Available'}
        </Text>
      </View>
    );
  };

  // Render minimum months badge
  const renderMinMonthsBadge = () => {
    if (!room.minMonths || room.minMonths === 1) return null;
    
    return (
      <View style={styles.minMonthsBadge}>
        <Ionicons name="calendar" size={14} color="#fff" />
        <Text style={styles.minMonthsText}>
         Min. {Number(room?.minMonths) || 0}{' '}
          {Number(room?.minMonths) === 1 ? 'month' : 'months'}
        </Text>
      </View>
    );
  };

  // Render error state with retry button
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={64} color="#e74c3c" />
      <Text style={styles.errorText}>Failed to Load Data</Text>
      <Text style={styles.errorSubtext}>
        {fetchError.message || 'There was an error loading property details.'}
      </Text>
      <Button
        mode="contained"
        onPress={retryFailedRequests}
        style={styles.retryButton}
        icon="refresh"
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Retrying...' : 'Retry'}
      </Button>
    </View>
  );

  // Render loading spinner
  const renderLoading = () => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading property details...</Text>
    </View>
  );

  //change text of request button to Pay if user has an approved request
  const requestButtonText = hasApprovedRequest ? 'Pay Rent' : 'Request';

  if (isLoading && !fetchError.hasError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          {renderLoading()}
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError.hasError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          <IconButton
            icon="arrow-left"
            size={24}
            style={[styles.backButton, { top: 10, left: 10 }]}
            onPress={() => navigation.goBack()}
          />
          {renderErrorState()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Image Carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleMomentumScrollEnd}
            >
             {Array.isArray(room?.images) && room.images.length > 0 ? (
  room.images.map((image, index) => {
    if (!image) return null; // skip bad images

    return (
      <TouchableOpacity
        key={index}
        onPress={() => openImageModal(index)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: image }}
          style={styles.carouselImage}
        />
      </TouchableOpacity>
    );
  })
) : (
  <Text style={{ textAlign: 'center', marginVertical: 10 }}>
    No images available
  </Text>
)}

            </ScrollView>
            
            <View style={styles.pagination}>
             {Array.isArray(room?.images) && room.images.length > 0 &&
  room.images.map((_, index) => (
    <View
      key={index}
      style={[
        styles.paginationDot,
        currentIndex === index && styles.paginationDotActive,
      ]}
    />
  ))
}

            </View>
            
            <IconButton
              icon="arrow-left"
              size={24}
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            />

            {/* Occupancy Status Badge */}
            {renderOccupancyStatus()}
            
            {/* Minimum Months Badge */}
            {renderMinMonthsBadge()}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.priceLocation}>
              <Text style={styles.price}>Tsh: {room?.price ?? 0} <Text style={styles.perMonth}>/month</Text></Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.location}>{room?.location?? 'Tanzania'}</Text>
              </View>
            </View>

            {/* Room Type and Minimum Months Info */}
            <View style={styles.propertyInfoRow}>
              {room.roomType && (
                <View style={styles.propertyInfoItem}>
                  <Ionicons name="home" size={16} color="#007AFF" />
                  <Text style={styles.propertyInfoText}>{room.roomType}</Text>
                </View>
              )}
              
              {room.minMonths && room.minMonths > 1 && (
                <View style={styles.propertyInfoItem}>
                  <Ionicons name="calendar" size={16} color="#007AFF" />
                  <Text style={styles.propertyInfoText}>
                    Min. {room.minMonths} {room.minMonths === 1 ? 'month' : 'months'}
                  </Text>
                </View>
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Video Walkthrough Button */}
            <View style={styles.videoSection}>
              <Button
                mode="contained"
                onPress={showVideoWalkthrough}
                style={styles.videoButton}
                contentStyle={styles.videoButtonContent}
                icon="video"
              >
                View Video Walkthrough
              </Button>
              {!room.videoWalkthrough && (
                <Text style={styles.videoNote}>
                  *Video walkthrough is optional and may not be available for all properties
                </Text>
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{room?.description ?? 'No description'}</Text>

            <Divider style={styles.divider} />

            {/* Amenities */}
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
            {Array.isArray(room?.amenities) && room.amenities.map(
  (amenity, index) =>
    typeof amenity === 'string' && (
      <View key={index} style={styles.amenityItem}>
        <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
        <Text style={styles.amenityText}>{amenity}</Text>
      </View>
    )
)}

            </View>

            <Divider style={styles.divider} />

            {/* Location Section - Fixed UI */}
            <Text style={styles.sectionTitle}>Location</Text>
            <Card style={styles.locationCard}>
              <Card.Content>
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={24} color="#007AFF" />
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationAddress}>{room?.location?? 'Tanzania'}</Text>
                    <Text style={styles.locationNote}>
                      Tap the button below to open this location in Google Maps
                    </Text>
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  style={styles.directionsButton}
                  contentStyle={styles.directionsButtonContent}
                  icon="map"
                  onPress={openGoogleMaps}
                >
                  Open in Google Maps
                </Button>
              </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* Landlord Info */}
            <Text style={styles.sectionTitle}>Landlord Information</Text>
            <Card style={styles.landlordCard}>
              <Card.Content>
                <TouchableOpacity 
                  style={styles.landlordHeader}
                  onPress={() => {
  if (room?.owner?.id) {
    navigation.navigate('LandlordReviews', {
      landlordId: room.owner.id,
      landlordName: `${room.owner.firstname ?? ''} ${room.owner.lastname ?? ''}`.trim() || 'Unknown'
    });
  }
}}

                >
                  <View style={styles.landlordInfo}>
                    <Text style={styles.landlordName}>{room?.owner?.firstname?? 'ChumbaConnect' + " " + room?.owner?.lastname ?? 'Landlord'}</Text>
                    <View style={styles.ratingContainer}>
                      {fetchError.ratingError ? (
                        <TouchableOpacity 
                          onPress={() => fetchRating()}
                          style={styles.retrySmallButton}
                        >
                          <Ionicons name="refresh" size={14} color="#e74c3c" />
                          <Text style={styles.retrySmallText}>Retry Rating</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>{rating || 0.0} ({totalReviews || 0} reviews)</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={styles.rightSection}>
                    {room.owner.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color="#7f8c8d" style={styles.chevron} />
                  </View>
                </TouchableOpacity>
                
                <View style={styles.contactInfo}>
                  <TouchableOpacity 
                    style={styles.contactItem}
                    onPress={callLandlord}
                  >
                    <Ionicons name="call" size={16} color="#007AFF" />
                    <Text style={styles.contactText}>{room?.owner?.phone?? '06XXXXXXXX'}</Text>
                  </TouchableOpacity>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={16} color="#007AFF" />
                    <Text style={styles.contactText}>{room?.owner?.email ?? 'chumbaconnectuser@mashikutech.co.tz'}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Rental request status with retry */}
            {fetchError.requestCheckError && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <View style={styles.errorCardContent}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.errorCardText}>
                      Failed to check rental request status
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => checkApprovedRequest()}
                      style={styles.retrySmallButtonCard}
                      compact
                    >
                      Retry
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={callLandlord}
              style={[styles.contactButton, styles.callButton]}
              contentStyle={styles.buttonContent}
              icon="phone"
            >
              Call
            </Button>
            <Button
              mode="outlined"
              onPress={openWhatsApp}
              style={[styles.contactButton, styles.chatButton]}
              contentStyle={styles.buttonContent}
              icon="whatsapp"
            >
              WhatsApp
            </Button>
            <Button
              mode="contained"
              onPress={sendRentalRequest}
              style={[
                styles.contactButton, 
                styles.requestButton,
                isRoomOccupied && styles.disabledButton
              ]}
              contentStyle={styles.buttonContent}
              icon="file-document-edit"
              disabled={isRoomOccupied}
            >
              {requestButtonText}
            </Button>
          </View>
        </View>

        {/* Rental Request Modal */}
        <Portal>
          <Modal visible={rentalModalVisible} onDismiss={() => setRentalModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Card>
              <Card.Title 
                title="Send Rental Request" 
                titleStyle={styles.modalTitle}
                right={(props) => (
                  <IconButton {...props} icon="close" onPress={() => setRentalModalVisible(false)} />
                )}
              />
              <Card.Content>
                <Text style={styles.modalSubtitle}>
                  Send a formal rental request to {room?.owner?.firstname?? 'ChumbaConnect'+" "+room?.owner?.lastname?? 'Landlord'}
                </Text>
                
                {/* Date Picker for Move-in Date */}
                <TouchableOpacity 
                  style={styles.dateInputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View pointerEvents="none">
                    <TextInput
                      label="Move-in Date *"
                      value={moveInDate}
                      style={styles.modalInput}
                      mode="outlined"
                      placeholder="Select a date"
                      left={<TextInput.Icon icon="calendar" />}
                      editable={false}
                    />
                  </View>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={moveInDate ? new Date(moveInDate) : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}
                
                <TextInput
                  label="Duration (Months) *"
                  value={duration}
                  onChangeText={(text) => {
                    // Remove all non-numeric characters
                    const numericText = text.replace(/[^0-9]/g, '');
                    setDuration(numericText);
                  }}
                  style={styles.modalInput}
                  mode="outlined"
                  placeholder="e.g., 6"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="clock" />}
                />
                
                <TextInput
                  label="Message to Landlord"
                  value={message}
                  onChangeText={setMessage}
                  style={[styles.modalInput, styles.messageInput]}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  placeholder="Tell the landlord about yourself and why you're interested in this property..."
                  left={<TextInput.Icon icon="message" />}
                />
                
                <Button
                  mode="contained"
                  onPress={handleSubmitRequest}
                  style={styles.submitButton}
                  loading={isSendingRequest}
                  disabled={isSendingRequest}
                  contentStyle={styles.submitButtonContent}
                  icon="send"
                >
                  {isSendingRequest ? 'Sending...' : 'Send Request'}
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

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
               {Array.isArray(room?.images) && room.images.map(
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
                 {(modalImageIndex ?? 0) + 1} / {room?.images?.length ?? 0}
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

        {/* Video Walkthrough Modal */}
        <Modal
          visible={videoModalVisible}
          transparent={true}
          onRequestClose={() => setVideoModalVisible(false)}
          animationType="slide"
        >
          <View style={styles.videoModalContainer}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle}>Video Walkthrough</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setVideoModalVisible(false)}
                color="#fff"
              />
            </View>
            
            <View style={styles.videoPlayerContainer}>
              {room.videoWalkthrough ? (
                <VideoPlayerComponent 
                  videoUri={`${room.videoWalkthrough}`} 
                />
              ) : (
                <View style={styles.noVideoContainer}>
                  <Ionicons name="videocam-off" size={64} color="#7f8c8d" />
                  <Text style={styles.noVideoText}>No Video Walkthrough Available</Text>
                  <Text style={styles.noVideoSubtext}>
                    This property does not have a video walkthrough.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
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
    backgroundColor: '#f8f9fa' 
  },
  scrollContainer: {
    flex: 1,
  },
  carouselContainer: {
    height: 300,
    position: 'relative',
  },
  carouselImage: { 
    width: width, 
    height: 300 
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    margin: 3,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 16,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  // Occupancy Status Styles
  occupancyBadge: {
    position: 'absolute',
    top: 13,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  occupiedBadge: {
    backgroundColor: '#ff4757',
  },
  availableBadge: {
    backgroundColor: '#2ed573',
  },
  occupancyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  // Minimum Months Badge Styles
  minMonthsBadge: {
    position: 'absolute',
    top: 13,
    left: 60, // Position to the right of back button
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  minMonthsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  content: { 
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  shareButton: {
    margin: 0,
  },
  priceLocation: {
    marginBottom: 15,
  },
  price: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#007AFF',
    marginBottom: 5,
  },
  perMonth: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#7f8c8d',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: { 
    fontSize: 16, 
    color: '#666', 
    marginLeft: 5,
  },
  // Property Info Row (Room Type and Minimum Months)
  propertyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  propertyInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 5,
  },
  propertyInfoText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
  },
  // Video Section Styles
  videoSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  videoButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginBottom: 8,
  },
  videoButtonContent: {
    height: 50,
    paddingHorizontal: 20,
  },
  videoNote: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    marginBottom: 10,
  },
  description: { 
    fontSize: 15, 
    color: '#444', 
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
  },
  // Location Section Styles - Fixed
  locationCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  locationNote: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  directionsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  directionsButtonContent: {
    height: 44,
  },
  landlordCard: { 
    borderRadius: 12,
    elevation: 2,
  },
  landlordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  landlordInfo: {
    flex: 1,
  },
  landlordName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#2ecc71',
    marginLeft: 4,
    fontWeight: '500',
  },
  contactInfo: {
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  callButton: {
    borderColor: '#2ecc71',
  },
  chatButton: {
    borderColor: '#25D366', // WhatsApp green color
  },
  requestButton: {
    backgroundColor: '#FF9500',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonContent: {
    height: 50,
  },
  // Modal styles
  modalContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 100,
  },
  submitButton: {
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#FF9500',
  },
  submitButtonContent: {
    height: 50,
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  // Full screen image modal styles
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
  // Video Modal Styles
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Video Player Styles
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlButton: {
    padding: 20,
  },
  replayButton: {
    alignItems: 'center',
    padding: 20,
  },
  replayText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  // Small retry button styles
  retrySmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  retrySmallText: {
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 4,
  },
  // Error card styles
  errorCard: {
    marginTop: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
    borderColor: 'rgba(231, 76, 60, 0.2)',
    borderWidth: 1,
  },
  errorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorCardText: {
    fontSize: 14,
    color: '#e74c3c',
    flex: 1,
    marginLeft: 10,
  },
  retrySmallButtonCard: {
    marginLeft: 10,
  },
  noVideoContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noVideoText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  noVideoSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  // added styles
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 4,
  },
  // Loading overlay styles
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
});