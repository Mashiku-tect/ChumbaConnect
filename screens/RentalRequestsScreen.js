import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, Chip, IconButton, Searchbar, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import placeholderImage from '../assets/avatar.jpg';
import BASE_URL from './Config';
import api from '../api/api';

export default function RentalRequestsScreen({ route, navigation }) {
  
  const { room, requests } = route.params;
 // console.log("Request Details", requests);
  //console.log('room in rental requests', room);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState({});
  const [updatedRequests, setUpdatedRequests] = useState(requests);

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Done', value: 'done' },
  ];

  // Filter and sort requests
  const filteredRequests = updatedRequests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.Status.toLowerCase() === filterStatus.toLowerCase();
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'approved': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      case 'done': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'clock';
      case 'approved': return 'check-circle';
      case 'rejected': return 'close-circle';
      case 'done': return 'check-all';
      default: return 'help-circle';
    }
  };

  // Safe user name getter
  const getUserName = (user) => {
    if (!user) return 'Unknown User';
    const firstName = user.FirstName?.trim() || '';
    const lastName = user.LastName?.trim() || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  // Safe phone number getter
  const getPhoneNumber = (user) => {
    return user?.PhoneNumber || 'No phone number';
  };

  const handleApproveRequest = async (requestId) => {
    setLoadingRequests(prev => ({ ...prev, [requestId]: true }));
    
    try {
      const response = await api.post(`/api/rental-requests/approve/${requestId}`);

      if (response.status === 200) {
        setUpdatedRequests(prevRequests => 
          prevRequests.map(request => 
            request.RentalRequestId === requestId 
              ? { ...request, Status: 'approved' }
              : request
          )
        );
        Alert.alert('Success', 'Request has been approved successfully.');
      } else {
        throw new Error('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request. Please try again.');
    } finally {
      setLoadingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoadingRequests(prev => ({ ...prev, [requestId]: true }));
    
    try {
      const response = await api.post(`/api/rental-requests/reject/${requestId}`);

      if (response.status === 200) {
        setUpdatedRequests(prevRequests => 
          prevRequests.map(request => 
            request.RentalRequestId === requestId 
              ? { ...request, Status: 'rejected' }
              : request
          )
        );
        Alert.alert('Success', 'Request has been rejected successfully.');
      } else {
        throw new Error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request. Please try again.');
    } finally {
      setLoadingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleStatusToggle = (requestId, currentStatus) => {
    const status = currentStatus?.toLowerCase();
    
    if (status === 'pending') {
      Alert.alert(
        'Approve Request',
        'Are you sure you want to approve this rental request?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Approve', 
            onPress: () => handleApproveRequest(requestId)
          }
        ]
      );
    } else if (status === 'approved') {
      Alert.alert(
        'Reject Request',
        'Are you sure you want to reject this approved request?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reject', 
            style: 'destructive',
            onPress: () => handleRejectRequest(requestId)
          }
        ]
      );
    } else if (status === 'rejected') {
      Alert.alert(
        'Approve Request',
        'Are you sure you want to approve this rejected request?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Approve', 
            onPress: () => handleApproveRequest(requestId)
          }
        ]
      );
    } else if (status === 'done') {
      Alert.alert(
        'Request Completed',
        'This request has been completed and cannot be modified.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCreateLease = (request) => {
    // Check if user exists before creating lease
    if (!request.User) {
      Alert.alert('Error', 'Cannot create lease for request without user information.');
      return;
    }

    Alert.alert(
      'Create Lease',
      'Proceed to create lease agreement?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Lease', 
          onPress: () => navigation.navigate('CreateLease', { 
            request: request,
            room: room
          })
        }
      ]
    );
  };

  const handleDeleteRequest = async (requestId) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoadingRequests(prev => ({ ...prev, [requestId]: true }));
            
            try {
              const response = await api.delete(`/api/rental-requests/delete/${requestId}`);

              if (response.status === 200) {
                setUpdatedRequests(prevRequests => 
                  prevRequests.filter(request => request.RentalRequestId !== requestId)
                );
                Alert.alert('Success', 'Request has been deleted successfully.');
              } else {
                throw new Error('Failed to delete request');
              }
            } catch (error) {
              console.error('Error deleting request:', error);
              Alert.alert('Error', 'Failed to delete request. Please try again.');
            } finally {
              setLoadingRequests(prev => ({ ...prev, [requestId]: false }));
            }
          }
        }
      ]
    );
  };

  const getToggleButtonConfig = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'pending':
        return { 
          label: 'Approve', 
          color: '#2ecc71', 
          icon: 'check',
          mode: 'contained',
          enabled: true
        };
      case 'approved':
        return { 
          label: 'Reject', 
          color: '#e74c3c', 
          icon: 'close',
          mode: 'outlined',
          enabled: true
        };
      case 'rejected':
        return { 
          label: 'Approve', 
          color: '#2ecc71', 
          icon: 'check',
          mode: 'contained',
          enabled: true
        };
      case 'done':
        return { 
          label: 'Completed', 
          color: '#95a5a6', 
          icon: 'check-all',
          mode: 'outlined',
          enabled: false
        };
      default:
        return { 
          label: 'Approve', 
          color: '#2ecc71', 
          icon: 'check',
          mode: 'contained',
          enabled: true
        };
    }
  };

  const renderRequest = ({ item }) => {
    const toggleConfig = getToggleButtonConfig(item.Status);
    const userName = getUserName(item.User);
    const phoneNumber = getPhoneNumber(item.User);
    
    return (
      <Card style={styles.requestCard}>
        <Card.Content>
          <View style={styles.requestHeader}>
            <View style={styles.tenantInfo}>
              <Image
                source={
                  item.tenantImage
                    ? { uri: item.tenantImage }
                    : placeholderImage
                }
                style={styles.tenantAvatar}
              />

              <View style={styles.tenantDetails}>
                <Text style={styles.tenantName}>
                  {userName}
                </Text>
                <Text style={styles.phoneNumber}>
                  {phoneNumber}
                </Text>
                <Text style={styles.requestDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.Status) + '20' }]}
              textStyle={[styles.statusText, { color: getStatusColor(item.Status) }]}
              icon={getStatusIcon(item.Status)}
            >
              {item.Status?.toUpperCase() || 'UNKNOWN'}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.requestDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#7f8c8d" />
              <Text style={styles.detailLabel}>Move-in Date:</Text>
              <Text style={styles.detailValue}>
                {item.MoveInDate ? new Date(item.MoveInDate).toLocaleDateString() : 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color="#7f8c8d" />
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>
                {item.Duration ? `${item.Duration} Months` : 'Not specified'}
              </Text>
            </View>

            {item.Message && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Message:</Text>
                <Text style={styles.messageText}>"{item.Message}"</Text>
              </View>
            )}

            {!item.User && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#f39c12" />
                <Text style={styles.warningText}>User information not available</Text>
              </View>
            )}
          </View>

          {loadingRequests[item.RentalRequestId] ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <Button
                mode={toggleConfig.mode}
                style={[styles.toggleButton, { 
                  borderColor: toggleConfig.color,
                  backgroundColor: toggleConfig.mode === 'contained' ? toggleConfig.color : 'transparent'
                }]}
                labelStyle={{ 
                  color: toggleConfig.mode === 'contained' ? '#fff' : toggleConfig.color 
                }}
                icon={toggleConfig.icon}
                onPress={() => toggleConfig.enabled && handleStatusToggle(item.RentalRequestId, item.Status)}
                disabled={!toggleConfig.enabled}
              >
                {toggleConfig.label}
              </Button>
              
              {item.Status?.toLowerCase() === 'approved' && item.User && (
                <Button
                  mode="contained"
                  style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                  labelStyle={{ color: '#fff' }}
                  icon="file-document"
                  onPress={() => handleCreateLease(item)}
                >
                  Create Lease
                </Button>
              )}
              
              <Button
                mode="outlined"
                style={[styles.deleteButton, { borderColor: '#e74c3c' }]}
                labelStyle={{ color: '#e74c3c' }}
                icon="delete"
                onPress={() => handleDeleteRequest(item.RentalRequestId)}
              >
                Delete
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffffff" 
        translucent={false}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Rental Requests</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{room.title}</Text>
          </View>
          <IconButton
            icon="information"
            size={24}
            onPress={() => Alert.alert(
              'Rental Requests',
              'Manage all rental requests for this property. Approve, reject, or create lease agreements.'
            )}
          />
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.filterContainer}>
            {statusOptions.map((option) => (
              <Chip
                key={option.value}
                selected={filterStatus === option.value}
                onPress={() => setFilterStatus(option.value)}
                style={[
                  styles.filterChip,
                  filterStatus === option.value && styles.filterChipSelected
                ]}
                textStyle={filterStatus === option.value ? styles.filterChipTextSelected : styles.filterChipText}
              >
                {option.label}
              </Chip>
            ))}
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
                contentStyle={styles.sortButtonContent}
              >
                {sortBy === 'newest' ? 'Newest' : 'Oldest'}
              </Button>
            }
          >
            <Menu.Item 
              onPress={() => { setSortBy('newest'); setMenuVisible(false); }} 
              title="Newest First" 
            />
            <Menu.Item 
              onPress={() => { setSortBy('oldest'); setMenuVisible(false); }} 
              title="Oldest First" 
            />
          </Menu>
        </View>

        {sortedRequests.length > 0 ? (
          <FlatList
            data={sortedRequests}
            renderItem={renderRequest}
            keyExtractor={(item) => item.RentalRequestId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyStateTitle}>
              {filterStatus === 'all' ? 'No rental requests yet' : `No ${filterStatus} requests`}
            </Text>
            <Text style={styles.emptyStateText}>
              {filterStatus === 'all' 
                ? 'Tenants will appear here when they send rental requests' 
                : `Try changing your filters to see other requests`
              }
            </Text>
          </View>
        )}

        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>
            {updatedRequests.length} total • {' '}
            {updatedRequests.filter(r => r.Status?.toLowerCase() === 'pending').length} pending • {' '}
            {updatedRequests.filter(r => r.Status?.toLowerCase() === 'approved').length} approved
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: 10,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipSelected: {
    backgroundColor: '#262d47ff',
    borderColor: '#262d47ff',
  },
  filterChipText: {
    color: '#2c3e50',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  sortButton: {
    borderRadius: 20,
    borderColor: '#007AFF',
    minWidth: 100,
  },
  sortButtonContent: {
    flexDirection: 'row-reverse',
  },
  listContent: {
    padding: 15,
    paddingBottom: 70,
  },
  requestCard: {
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  tenantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
  },
  requestDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    marginRight: 5,
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  messageContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  messageLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
});