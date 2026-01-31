import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  ToastAndroid, 
  RefreshControl,
  StatusBar,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Divider, Provider as PaperProvider, Modal, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from './Config';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../api/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();

  const NOTIFICATIONS_PER_PAGE = 8;

  // Load notifications from backend
  const fetchNotifications = async (showLoading = true, isLoadMore = false) => {
    try {
      if (showLoading) setLoading(true);
      if (isLoadMore) setLoadingMore(true);
      
      setError(null);
      
      const token = await AsyncStorage.getItem("userToken");
      const response = await api.get(
        `/api/notifications`,
        { 
          headers: { Authorization: `Bearer ${token }` },
          params: isLoadMore ? { page, limit: NOTIFICATIONS_PER_PAGE } : {}
        }
      );
      
      const newNotifications = response.data.notifications;
      
      if (isLoadMore) {
        // For load more, append to existing notifications
        setNotifications(prev => [...prev, ...newNotifications]);
        setDisplayedNotifications(prev => [...prev, ...newNotifications.slice(0, NOTIFICATIONS_PER_PAGE)]);
      } else {
        // For initial load or refresh, replace all notifications
        setNotifications(newNotifications);
        setDisplayedNotifications(newNotifications.slice(0, NOTIFICATIONS_PER_PAGE));
        setPage(1);
        setHasMore(newNotifications.length > NOTIFICATIONS_PER_PAGE);
      }
      
    } catch (error) {
      handleError(error);
    } finally {
      if (showLoading) setLoading(false);
      if (isLoadMore) setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleError = (error) => {
    let errormessage;
                
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      errormessage = 'Unable to connect. Please check your internet connection or try again later.';
    }
  
    else if (error.request && !error.response) {
      errormessage = 'Server is not responding. Please try again later.';
    }
  
    else if (error.response) {
      errormessage =
        error.response.data?.message ||
        "Something went wrong on the server.";
    }
  
    else {
      errormessage = 'Something went wrong. Please try again.';
    }
    
    setError(errormessage);
  
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
  };

  const loadMoreNotifications = () => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = page + 1;
    const startIndex = nextPage * NOTIFICATIONS_PER_PAGE;
    const endIndex = startIndex + NOTIFICATIONS_PER_PAGE;
    
    const moreNotifications = notifications.slice(startIndex, endIndex);
    
    if (moreNotifications.length > 0) {
      setDisplayedNotifications(prev => [...prev, ...moreNotifications]);
      setPage(nextPage);
      setHasMore(notifications.length > endIndex);
    } else {
      setHasMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  //initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

   // Refresh when screen is focused
    useFocusEffect(
      useCallback(() => {
       fetchNotifications();
      }, [])
    );

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await api.put(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(item => 
          item.NotificationId === notificationId 
            ? { ...item, isRead: true }
            : item
        )
      );
      
      setDisplayedNotifications(prev => 
        prev.map(item => 
          item.NotificationId === notificationId 
            ? { ...item, isRead: true }
            : item
        )
      );
      
    } catch (error) {
      //console.log("Error marking notification as read", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await api.delete(
        `/api/notifications/delete/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(item => item.NotificationId !== notificationId)
      );
      
      setDisplayedNotifications(prev => 
        prev.filter(item => item.NotificationId !== notificationId)
      );
      
      // Show success message
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Notification deleted',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'success',
          text1:'Success',
          text2: 'Notification deleted'
        });
      }
      
    } catch (error) {
      handleError(error);
    }
  };

  //handle notification press
const handleNotificationPress = async (item) => {
  try {
    // Mark as read
    if (!item.isRead) {
      await markAsRead(item.NotificationId);
    }

    //  Handle NEW_REQUEST notification
    if (item.type === "NEW_REQUEST") {
      let data = item.data;

      // Parse nested JSON if needed
      try {
        if (typeof data === "string") data = JSON.parse(data);
        if (typeof data === "string") data = JSON.parse(data);
      } catch (err) {
        console.log("JSON Parse Error:", err);
      }

      const { RequestId, PropertyId } = data;

      //  Fetch request details via Axios
      try{
       const response = await api.get(`/api/userrequest/${RequestId}`);

      if (!response.data.success) {
        Alert.alert("Error", "Unable to load request details.");
        return;
      }

      const requests = response.data.data;
      //console.log('Request Feedback',requests)

      //  Extract room data (property info)
      const room = {
        id: requests[0].Property.PropertyId,
        title: requests[0].Property.PropertyName,
      };

      //  Navigate to RentalRequests screen
      return navigation.navigate("RentalRequests", {
        room,
        requests,
        
      });
      }catch(error){
        const errormessage=error.response?.data?.message;
        //console.log("Error fetching request details:", error);
        if(Platform.OS==='android'){
          ToastAndroid.showWithGravity(
                    errormessage,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                  );

        }else{
          Toast.show({
            type: 'error',
            text1:'Error',
          text2: errormessage
          })
        }
      }
    }

    // Existing ROOM_VACATED handler
    if (item.type === "ROOM_VACATED") {
      let data = item.data;
      try {
        if (typeof data === "string") data = JSON.parse(data);
        if (typeof data === "string") data = JSON.parse(data);
      } catch {}

      return navigation.navigate("ReviewScreen", {
        ownerId: data.OwnerId,
        propertyId: data.PropertyId
      });
    }

   
    //  RENTAL_CONFIRMED → go to MyRentals and scroll to the right record
if (item.type === "RENTAL_CONFIRMED" || item.type === "RENTAL_APPROVED" || item.type === "RECURRING_PAYMENT" || item.type === "RENT_DUE_TENANT") {
  let data = item.data;

  // Safe parse
  try {
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data);
    //console.log('Property ID',data.PropertyId)
  } catch (err) {
    //console.log("Error parsing RENTAL_CONFIRMED data:", err);
  }

  return navigation.navigate("My Rental", {
    targetTenantId: data.TenantId,
    targetPropertyId: data.PropertyId,
  });
}


  //  HANDLE PAYMENTS ACTIONS FOR LANDLORDS/OWNERS → go to PAYMENT HISTORY SCREEN
if (item.type === "FIRST_PAYMENT_RECEIVED" || item.type === "RECURRING_PAYMENT_OWNER" || item.type === "RENT_DUE_LANDLORD" ) {
  let data = item.data;

  // Safe parse
  try {
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data);
    //console.log('Property ID',data.PropertyId)
  } catch (err) {
    //console.log("Error parsing RENTAL_CONFIRMED data:", err);
  }

  return navigation.navigate("PaymentHistory", {
    tenantId: data.TenantId,
    propertyId: data.PropertyId,
    propertyTitle:data.PropertyName,
    TenantFullName:data.TenantFullName
  });
}


    // Default: show modal
    setSelectedNotification(item);
    setModalVisible(true);

  } catch (error) {
    //console.log("Notification press error:", error);
    Alert.alert("Error", "Something went wrong handling the notification.");
  }
};



  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderNotificationItem = ({ item }) => (
    <Card 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      mode="elevated"
    >
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleRow}>
            <Text variant="titleMedium" style={styles.notificationTitle}>
              {item.title ?? 'Notification'}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <IconButton
            icon="delete"
            size={18}
            onPress={() => deleteNotification(item.NotificationId)}
            style={styles.deleteButton}
          />
        </View>
        
        <TouchableOpacity onPress={() => handleNotificationPress(item)}>
          <Text variant="bodyMedium" style={styles.notificationMessage}>
            {truncateText(item?.message?? 'New Message')}
          </Text>
          {item.message.length > 100 && (
            <Text style={styles.readMoreText}>Tap to read more</Text>
          )}
        </TouchableOpacity>
        
        <Text variant="bodySmall" style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderLoadMoreButton = () => {
    if (!hasMore || displayedNotifications.length === 0) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <Button
          mode="outlined"
          onPress={loadMoreNotifications}
          loading={loadingMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load More'}
        </Button>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={styles.emptyText}>Loading notifications...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => fetchNotifications()}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      );
    }

    if (displayedNotifications.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>We'll notify you when something new arrives</Text>
          <Button 
            mode="outlined" 
            onPress={() => fetchNotifications()}
            style={styles.retryButton}
          >
            Refresh
          </Button>
        </View>
      );
    }

    return null;
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={false}
        />
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text variant="headlineMedium" style={styles.header}>
              Notifications
            </Text>
            {/* <Button 
              mode="outlined" 
              onPress={() => fetchNotifications(false)}
              compact
              loading={refreshing}
            >
              Refresh
            </Button> */}
          </View>

          <Divider style={styles.divider} />

          <FlatList
            data={displayedNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.NotificationId.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              (loading || error || displayedNotifications.length === 0) && styles.emptyList
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0077cc']}
                tintColor={'#0077cc'}
              />
            }
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderLoadMoreButton}
            onEndReached={loadMoreNotifications}
            onEndReachedThreshold={0.1}
          />
        </View>

        {/* Modal for full notification content */}
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  {selectedNotification?.title?? 'Notification'}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <Text style={styles.modalMessage}>
                {selectedNotification?.message ?? 'New notification'}
              </Text>
              
              <Text style={styles.modalTime}>
               {selectedNotification?.createdAt
  ? new Date(selectedNotification.createdAt).toLocaleString()
  : 'N/A'}

              </Text>

              <Button
                mode="contained"
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                Close
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 16 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8,
   
  },
  header: { 
    fontWeight: 'bold', 
    color: '#800080' 
  },
  divider: { 
    marginBottom: 16 
  },
  listContent: { 
    paddingBottom: 16 
  },
  emptyList: { 
    flexGrow: 1 
  },
  notificationCard: { 
    marginBottom: 12, 
    backgroundColor: '#fff',
    position: 'relative'
  },
  unreadCard: { 
    backgroundColor: '#e3f2fd', 
    borderLeftWidth: 4, 
    borderLeftColor: '#0077cc' 
  },
  notificationHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 8 
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  notificationTitle: { 
    fontWeight: '600', 
    color: '#333',
    marginRight: 8,
    flex: 1
  },
  notificationMessage: { 
    color: '#666', 
    marginBottom: 4,
    lineHeight: 20
  },
  readMoreText: {
    color: '#0077cc',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8
  },
  notificationTime: { 
    color: '#999', 
    fontSize: 12 
  },
  unreadDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#0077cc' 
  },
  deleteButton: {
    margin: -8,
    marginLeft: 0
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  emptyText: { 
    fontSize: 18, 
    color: '#800080', 
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600'
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600'
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20
  },
  retryButton: {
    marginTop: 8
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center'
  },
  modalContainer: {
    margin: 20
  },
  modalCard: {
    padding: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  modalTitle: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    color: '#333'
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16
  },
  modalTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20
  },
  modalButton: {
    marginTop: 8,
    borderRadius: 8
  }
});