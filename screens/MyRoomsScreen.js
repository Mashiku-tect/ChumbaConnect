import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, Modal, TextInput, Platform, ToastAndroid, StatusBar } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Searchbar, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './Config';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { FlashList } from "@shopify/flash-list"; // Added FlashList import

// Custom hook for reason modal state management
const useReasonModal = () => {
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const showReasonModal = useCallback((room) => {
    setSelectedRoom(room);
    setReasonModalVisible(true);
  }, []);

  const hideReasonModal = useCallback(() => {
    setReasonModalVisible(false);
  }, []);

  const resetReasonModal = useCallback(() => {
    setSelectedRoom(null);
    setSelectedReason('');
    setCustomReason('');
    setReasonModalVisible(false);
  }, []);

  const handleReasonSelection = useCallback((reason) => {
    setSelectedReason(reason);
    if (reason !== 'Other') {
      setCustomReason('');
    }
  }, []);

  return {
    reasonModalVisible,
    selectedRoom,
    selectedReason,
    customReason,
    setCustomReason,
    showReasonModal,
    hideReasonModal,
    handleReasonSelection,
    resetReasonModal
  };
};

// Move modal components outside the main component
const ImageCarouselModal = React.memo(({ 
  imageModalVisible, 
  selectedRoomImages, 
  currentImageIndex, 
  setImageModalVisible, 
  nextImage, 
  prevImage 
}) => (
  <Modal
    visible={imageModalVisible}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setImageModalVisible(false)}
  >
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          Image {currentImageIndex + 1} of {selectedRoomImages.length}
        </Text>
        <IconButton
          icon="close"
          iconColor="#fff"
          size={24}
          onPress={() => setImageModalVisible(false)}
        />
      </View>
      
      <View style={styles.carouselContainer}>
        <TouchableOpacity style={styles.navButton} onPress={prevImage}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        
       <Image
  source={{ uri: selectedRoomImages?.[currentImageIndex] ?? "" }}
  style={styles.modalImage}
  resizeMode="cover"
/>

        
        <TouchableOpacity style={styles.navButton} onPress={nextImage}>
          <Ionicons name="chevron-forward" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      
     <View style={styles.indicatorContainer}>
  {(Array.isArray(selectedRoomImages) ? selectedRoomImages : []).map((_, index) => (
    <View
      key={index}
      style={[
        styles.indicator,
        index === currentImageIndex && styles.indicatorActive
      ]}
    />
  ))}
</View>

    </SafeAreaView>
  </Modal>
));

const ReasonSelectionModal = React.memo(({
  reasonModalVisible,
  selectedReason,
  customReason,
  setCustomReason,
  handleReasonSelection,
  resetReasonModal,
  confirmAvailableStatus
}) => {
  const reasonOptions = React.useMemo(() => [
    'Tenant moved out normally',
    'Contract ended',
    'Evicted',
    'Tenant transferred to another room',
    'Tenant terminated contract early',
    'Other'
  ], []);

  return (
    <Modal
      visible={reasonModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={resetReasonModal}
    >
      <SafeAreaView style={styles.reasonModalContainer}>
        <View style={styles.reasonModalContent}>
          <Text style={styles.reasonModalTitle}>Select Reason</Text>
          <Text style={styles.reasonModalSubtitle}>
            Why are you marking this room as available?
          </Text>

          <ScrollView style={styles.reasonsList}>
  {(Array.isArray(reasonOptions) ? reasonOptions : []).map((reason, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.reasonOption,
        selectedReason === reason && styles.reasonOptionSelected
      ]}
      onPress={() => handleReasonSelection(reason)}
    >
      <View style={styles.reasonRadio}>
        {selectedReason === reason && (
          <View style={styles.reasonRadioSelected} />
        )}
      </View>
      <Text style={styles.reasonText}>{reason}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>


          {selectedReason === 'Other' && (
            <View style={styles.customReasonContainer}>
              <Text style={styles.customReasonLabel}>Please specify:</Text>
              <TextInput
                style={styles.customReasonInput}
                placeholder="Enter reason..."
                value={customReason}
                onChangeText={setCustomReason}
                multiline={true}
                numberOfLines={3}
              />
            </View>
          )}

          <View style={styles.reasonModalActions}>
            <Button
              mode="outlined"
              onPress={resetReasonModal}
              style={styles.reasonCancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmAvailableStatus}
              style={styles.reasonConfirmButton}
              disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
            >
              Confirm
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
});

// Helper function to calculate rent expiration info
const getRentExpirationInfo = (room) => {
  if (!room.latestPayment || !room.latestPayment.DueDate) {
    return null;
  }

  const dueDate = new Date(room.latestPayment.DueDate);
  const now = new Date();
  
  if (room.rentExpired) {
    // Rent has expired - show how long ago it expired
    const timeDiff = now.getTime() - dueDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (daysDiff > 0) {
      return {
        text: `Rent Expired ${daysDiff} day${daysDiff !== 1 ? 's' : ''} ago`,
        color: '#e74c3c',
        icon: 'alert-circle'
      };
    } else {
      return {
        text: `Rent Expired ${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''} ago`,
        color: '#e74c3c',
        icon: 'alert-circle'
      };
    }
  } else {
    // Rent is still active - show when it will expire
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return {
        text: 'Expires today',
        color: '#f39c12',
        icon: 'time'
      };
    } else if (daysDiff === 1) {
      return {
        text: 'Expires tomorrow',
        color: '#f39c12',
        icon: 'time'
      };
    } else if (daysDiff > 1) {
      return {
        text: `Expires in ${daysDiff} days`,
        color: '#2ecc71',
        icon: 'calendar'
      };
    } else {
      // This case shouldn't happen if rentExpired is accurate, but just in case
      return {
        text: 'Payment status unknown',
        color: '#95a5a6',
        icon: 'help-circle'
      };
    }
  }
};

export default function MyRoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedRoomImages, setSelectedRoomImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use the custom hook for reason modal
  const {
    reasonModalVisible,
    selectedRoom,
    selectedReason,
    customReason,
    setCustomReason,
    showReasonModal,
    hideReasonModal,
    handleReasonSelection,
    resetReasonModal
  } = useReasonModal();

  // Fetch user's properties from backend
  const fetchMyProperties = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await api.get(`/api/my-properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
       
      if (response.data && Array.isArray(response.data)) {
        setRooms(response.data);
       // console.log("Fetched properties:", response.data);
      }
    } catch (error) {
      setError('Failed to load your properties. Please try again.');
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

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMyProperties();
  }, []);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchMyProperties();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProperties();
  };

  const performStatusUpdate = useCallback(async (id, newStatus, reason = '') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const updateData = { status: newStatus };
      if (reason) {
        updateData.statusChangeReason = reason;
      }
      
      const response = await api.patch(
        `/api/properties/status/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update local state
        setRooms((prev) =>
          prev.map((room) =>
            room.id === id ? { ...room, status: newStatus } : room
          )
        );
        
        // Show success message
        if(Platform.OS==='android'){
          ToastAndroid.showWithGravity(
            response?.data?.message || 'Room Marked As Available and Tenant Notified',
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Toast.show({
            type:'success',
            text1:'Success',
            text2:response?.data?.message || 'Room Marked As Available and Tenant Notified'
          })
        }
      }
    } catch (err) {
      let errormessage;
      
      // Network error (no internet, server down, timeout)
      if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
        errormessage = 'Unable to connect. Please check your internet connection or try again later.';
      }
      // Server did not respond (request sent, no response)
      else if (err.request && !err.response) {
        errormessage = 'Server is not responding. Please try again later.';
      }
      // Backend responded with an error
      else if (err.response) {
        errormessage =
          err.response.data?.message || // safe access
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
          text1:'Error',
          text2: errormessage
        });
      }
    }
  }, [rooms]);

  const markRoomAsAvailable = useCallback(async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if(!id){
        return;
      }
      
      // Show confirmation prompt for marking as available
      Alert.alert(
        'Confirm Status Change',
        'Are you sure you want to mark this room as available?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => {
  // Show reason selection for marking as available
  const room = Array.isArray(rooms) ? rooms.find(room => room?.id === id) : null;
  if (room) {
    showReasonModal(room);
  }
},

          },
        ]
      );
    } catch (err) {
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          "Failed to update property status",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'error',
          text1:'Error',
          text2:'Failed to update property status'
        })
      }
    }
  }, [rooms, showReasonModal]);

  const confirmAvailableStatus = useCallback(() => {
    if (!selectedReason) {
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          "Please select a reason for marking the room as available",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'info',
          text1:'Information',
          text2:'Please select a reason for marking the room as available'
        })
      }
      return;
    }

    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (selectedReason === 'Other' && !customReason.trim()) {
      if(Platform.OS==='android'){
        ToastAndroid.showWithGravity(
          "Please provide a reason",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type:'info',
          text1:'Information',
          text2:'Please provide a reason'
        })
      }
      return;
    }

    if (selectedRoom && selectedRoom.id) {
      performStatusUpdate(selectedRoom.id, 'available', finalReason);
    }
    resetReasonModal();
  }, [selectedReason, customReason, selectedRoom, performStatusUpdate, resetReasonModal]);

  const deleteProperty = useCallback(async (id, title) => {
    if(!id){
      return;
    }
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
          const response=    await api.delete(`/api/properties/delete/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              // Remove from local state
              setRooms((prev) => prev.filter((room) => room.id !== id));
              
              if(Platform.OS==='android'){
                ToastAndroid.showWithGravity(
                  response?.data?.message,
                  ToastAndroid.LONG,
                  ToastAndroid.CENTER
                );
              } else {
                Toast.show({
                  type:'success',
                  text1:'Success',
                  text2:response?.data?.message
                })
              }
            } catch (err) {
              let errormessage;
              
              // Network error (no internet, server down, timeout)
              if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
                errormessage = 'Unable to connect. Please check your internet connection or try again later.';
              }
              // Server did not respond (request sent, no response)
              else if (err.request && !err.response) {
                errormessage = 'Server is not responding. Please try again later.';
              }
              // Backend responded with an error
              else if (err.response) {
                errormessage =
                  err.response.data?.message || // safe access
                  "Something went wrong .";
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
            }
          },
        },
      ]
    );
  }, []);

  const openImageCarousel = useCallback((room) => {
    if (room.images && room.images.length > 0) {
      setSelectedRoomImages(room.images);
      setCurrentImageIndex(0);
      setImageModalVisible(true);
    } else {
      Alert.alert('No Images', 'This property has no images available.');
    }
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === selectedRoomImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [selectedRoomImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? selectedRoomImages.length - 1 : prevIndex - 1
    );
  }, [selectedRoomImages.length]);

  const handleViewPaymentHistory = useCallback((room) => {
  if (!room) {
    Alert.alert('Error', 'Room data is not available.');
    return;
  }

  if (room.status === 'occupied' && room.tenant) {
    navigation.navigate('PaymentHistory', {
      propertyId: room.id ?? '',
      propertyTitle: room.title ?? '',
      tenant: room.tenant ?? {}
    });
  } else {
    Alert.alert('No Tenant', 'This room is not currently occupied.');
  }
}, [navigation]);


  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

 const filteredRooms = useMemo(() => {
  return (Array.isArray(rooms) ? rooms : []).filter(room => {
    const title = room?.title?.toLowerCase() ?? '';
    const location = room?.location?.toLowerCase() ?? '';
    const search = (searchQuery ?? '').toLowerCase();

    const matchesSearch = title.includes(search) || location.includes(search);
    const matchesFilter = filterStatus === 'all' || room?.status === filterStatus;

    return matchesSearch && matchesFilter;
  });
}, [rooms, searchQuery, filterStatus]);


  const sortedRooms = useMemo(() => {
    return [...filteredRooms].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'price-high') return parseInt(b.price) - parseInt(a.price);
      if (sortBy === 'price-low') return parseInt(a.price) - parseInt(b.price);
      return 0;
    });
  }, [filteredRooms, sortBy]);

  const getStatusColor = useCallback((status) => {
    return status === 'available' ? '#2ecc71' : '#e74c3c';
  }, []);

  const getStatusIcon = useCallback((status) => {
    return status === 'available' ? 'check-circle-outline' : 'close-circle';
  }, []);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price).replace('TZS', 'Tsh');
  }, []);

  const handleInquiriesPress = useCallback(async (room) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await api.get(`/api/inquiries/${room.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const inquiries = response.data;

      navigation.navigate('RentalRequests', { 
        room: room,
        requests: inquiries
      });
    } catch (error) {
      //console.error("Error fetching inquiries:", error.response?.data || error.message);
      Alert.alert("Error", "Could not fetch rental inquiries.");
    }
  }, [navigation]);

  const renderRoom = useCallback(({ item }) => {
    const rentExpirationInfo = getRentExpirationInfo(item);
    
    return (
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => openImageCarousel(item)}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://picsum.photos/300/200?random=1' }} 
              style={styles.image} 
            />
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusChipText}
              icon={getStatusIcon(item?.status ?? 'available')}
            >
              {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
            </Chip>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.viewsText}>{item.views || 0}</Text>
            </View>
            {item.images && item.images.length > 1 && (
              <View style={styles.multipleImagesIndicator}>
                <Ionicons name="images" size={16} color="#fff" />
                <Text style={styles.multipleImagesText}>{item.images.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item?.title ?? 'ChumbaConnect Property'}</Text>
          
          <View style={styles.priceLocation}>
            <Text style={styles.price}>{formatPrice(item?.price ?? 0)} <Text style={styles.perMonth}>/month</Text></Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.location} numberOfLines={1}>{item?.location ?? 'Tanzania'}</Text>
            </View>
          </View>

          {/* Tenant Information - Only show for occupied rooms */}
          {item.status === 'occupied' && item.tenant && (
            <View style={styles.tenantContainer}>
              <Text style={styles.tenantSectionTitle}>Current Tenant</Text>
              <View style={styles.tenantInfo}>
                <View style={styles.tenantRow}>
                  <Ionicons name="person" size={14} color="#666" />
                  <Text style={styles.tenantText}>
                    {item.tenant.FirstName?? 'ChumbaConnect'} {item.tenant.LastName?? 'Tenant'}
                  </Text>
                </View>
                <View style={styles.tenantRow}>
                  <Ionicons name="call" size={14} color="#666" />
                  <Text style={styles.tenantText}>{item.tenant.PhoneNumber?? '06XXXXXXX'}</Text>
                </View>
                <View style={styles.tenantRow}>
                  <Ionicons name="mail" size={14} color="#666" />
                  <Text style={styles.tenantText} numberOfLines={1}>{item.tenant.Email?? 'chumbaconnectuser@mashikutech.co.tz'}</Text>
                </View>
                <View style={styles.tenantRow}>
                  <Ionicons name="calendar" size={14} color="#666" />
                  <Text style={styles.tenantText}>
                    Started: {item?.stayStartDate ? formatDate(item.stayStartDate) : 'N/A'}

                  </Text>
                </View>
                {item.stayDuration && (
                  <View style={styles.tenantRow}>
                    <Ionicons name="time" size={14} color="#666" />
                    <Text style={styles.tenantText}>
                      Duration: {item.stayDuration}
                    </Text>
                  </View>
                )}
                {/* Rent Expiration Information */}
                {rentExpirationInfo && (
                  <View style={styles.tenantRow}>
                    <Ionicons name={rentExpirationInfo.icon} size={14} color={rentExpirationInfo.color} />
                    <Text style={[styles.tenantText, { color: rentExpirationInfo.color, fontWeight: 'bold' }]}>
                      {rentExpirationInfo.text}
                    </Text>
                  </View>
                )}
               
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="eye" size={14} color="#7f8c8d" />
              <Text style={styles.statText}>{item.views || 0} views</Text>
            </View>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => handleInquiriesPress(item)}
            >
              <Ionicons 
                name="chatbubble" 
                size={14} 
                color={(item.inquiries || 0) > 0 ? "#007AFF" : "#7f8c8d"} 
              />
              <Text style={[
                styles.statText, 
                (item.inquiries || 0) > 0 && styles.inquiriesTextActive,
                (item.inquiries || 0) === 0 && styles.inquiriesTextDisabled
              ]}>
                {item.inquiries || 0} inquiries
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          {/* Only show Mark Available button for occupied rooms */}
          {item.status === 'occupied' && (
            <Button
              mode="outlined"
              onPress={() => markRoomAsAvailable(item.id)}
              style={[styles.actionButton, { borderColor: getStatusColor('available') }]}
              labelStyle={{ color: getStatusColor('available') }}
              icon="account-off"
            >
              Mark Available
            </Button>
          )}
          
          {/* Payment History Button - Only show for occupied rooms */}
          {item.status === 'occupied' && (
            <Button
              mode="contained"
              onPress={() => handleViewPaymentHistory(item)}
              style={[styles.actionButton, styles.paymentButton]}
              icon="cash"
              compact
            >
              Payments
            </Button>
          )}
          
          <Button
            mode="contained"
           onPress={() => item && navigation.navigate('EditRoom', { room: item })}

            style={styles.actionButton}
            icon="pencil"
            compact
          >
            Edit
          </Button>
          <IconButton
            icon="delete"
            iconColor="#e74c3c"
            size={20}
            onPress={() => deleteProperty(item.id, item.title)}
            style={styles.deleteButton}
          />
        </Card.Actions>
      </Card>
    );
  }, [
    openImageCarousel, 
    getStatusColor, 
    getStatusIcon, 
    formatPrice, 
    formatDate, 
    handleInquiriesPress, 
    markRoomAsAvailable, 
    handleViewPaymentHistory, 
    navigation, 
    deleteProperty
  ]);

  // Rest of your component remains the same...
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={styles.loadingText}>Loading your properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchMyProperties}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Properties</Text>
          <Text style={styles.headerSubtitle}>Manage your rental properties</Text>
        </View>

        {rooms.length > 0 && (
          <View style={styles.controlsContainer}>
            <Searchbar
              placeholder="Search your properties..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              icon="magnify"
            />
            
            <View style={styles.filterRow}>
              <View style={styles.filterContainer}>
                <Chip
                  selected={filterStatus === 'all'}
                  onPress={() => setFilterStatus('all')}
                  style={styles.filterChip}
                  selectedColor="#fff"
                >
                  All
                </Chip>
                <Chip
                  selected={filterStatus === 'available'}
                  onPress={() => setFilterStatus('available')}
                  style={styles.filterChip}
                  selectedColor="#fff"
                  icon="check-circle"
                >
                  Available
                </Chip>
                <Chip
                  selected={filterStatus === 'occupied'}
                  onPress={() => setFilterStatus('occupied')}
                  style={styles.filterChip}
                  selectedColor="#fff"
                  icon="close-circle"
                >
                  Occupied
                </Chip>
              </View>

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setMenuVisible(true)}
                    style={styles.sortButton}
                    icon="sort"
                  >
                    Sort
                  </Button>
                }
              >
                <Menu.Item onPress={() => { setSortBy('newest'); setMenuVisible(false); }} title="Newest" />
                <Menu.Item onPress={() => { setSortBy('oldest'); setMenuVisible(false); }} title="Oldest" />
                <Menu.Item onPress={() => { setSortBy('price-high'); setMenuVisible(false); }} title="Price: High to Low" />
                <Menu.Item onPress={() => { setSortBy('price-low'); setMenuVisible(false); }} title="Price: Low to High" />
              </Menu>
            </View>
          </View>
        )}

        {sortedRooms.length > 0 ? (
          <FlashList
            data={sortedRooms}
            renderItem={renderRoom}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
              />
            }
            estimatedItemSize={330} // Added estimated item size for better performance
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyStateTitle}>No properties found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You haven\'t added any properties yet'
              }
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("AddRoom")}
              style={styles.addFirstButton}
              icon="plus"
            >
              Add Your First Property
            </Button>
          </View>
        )}

        {sortedRooms.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddRoom")}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        )}

        <ImageCarouselModal 
          imageModalVisible={imageModalVisible}
          selectedRoomImages={selectedRoomImages}
          currentImageIndex={currentImageIndex}
          setImageModalVisible={setImageModalVisible}
          nextImage={nextImage}
          prevImage={prevImage}
        />
        
        <ReasonSelectionModal
          reasonModalVisible={reasonModalVisible}
          selectedReason={selectedReason}
          customReason={customReason}
          setCustomReason={setCustomReason}
          handleReasonSelection={handleReasonSelection}
          resetReasonModal={resetReasonModal}
          confirmAvailableStatus={confirmAvailableStatus}
        />
      </View>
    </SafeAreaView>
  );
}

// Your styles remain exactly the same...
const styles = StyleSheet.create({
  // ... all your existing styles remain unchanged
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    paddingHorizontal: 10 
  },
 header: {
  paddingTop: 10,
  paddingBottom: 15,
  
},
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    textAlign: 'center'
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#7f8c8d', 
    textAlign: 'center',
    marginTop: 5
  },
  controlsContainer: {
    marginBottom: 15,
  },
  searchBar: {
    borderRadius: 10,
    elevation: 2,
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#262d47ff',
  },
  sortButton: {
    borderRadius: 20,
    borderColor: '#007AFF',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: { 
    marginBottom: 20, 
    borderRadius: 16, 
    overflow: 'hidden',
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: { 
    width: '100%', 
    height: 200 
  },
  statusChip: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  statusChipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewsText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  multipleImagesIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  multipleImagesText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 15,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    marginBottom: 8,
  },
  priceLocation: {
    marginBottom: 12,
  },
  price: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#007AFF',
    marginBottom: 5,
  },
  perMonth: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#7f8c8d',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 5,
  },
  tenantContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  tenantSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tenantInfo: {
    gap: 6,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  inquiriesTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  inquiriesTextDisabled: {
    color: '#bdc3c7',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    flexWrap: 'wrap',
  },
  actionButton: {
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  paymentButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    marginLeft: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#800080',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  addFirstButton: {
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: 10, // Reduced from 50 since SafeAreaView handles status bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navButton: {
    padding: 10,
  },
  modalImage: {
    width: '80%',
    height: 400,
    borderRadius: 8,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 12,
  },
  reasonModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  reasonModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  reasonModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  reasonModalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  reasonsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  reasonOptionSelected: {
    backgroundColor: '#f8f9fa',
  },
  reasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  reasonText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  customReasonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  customReasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reasonModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  reasonCancelButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
  },
  reasonConfirmButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 8,
  },
});