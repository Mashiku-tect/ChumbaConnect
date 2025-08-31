import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Searchbar, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function RentalRequestsScreen({ route, navigation }) {
  const { room, requests } = route.params;
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [menuVisible, setMenuVisible] = useState(false);

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'clock';
      case 'approved': return 'check-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleStatusChange = (requestId, newStatus) => {
    // In a real app, you would update this in your backend
    console.log(`Changing request ${requestId} to ${newStatus}`);
    
    // Show confirmation for approved/rejected
    if (newStatus === 'approved') {
      // Navigate to create lease agreement
      navigation.navigate('CreateLease', { 
        request: requests.find(req => req.id === requestId),
        room: room
      });
    } else if (newStatus === 'rejected') {
      // Show rejection confirmation
      alert(`Request rejected. The tenant will be notified.`);
    }
  };

  const renderRequest = ({ item }) => (
    <Card style={styles.requestCard}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <View style={styles.tenantInfo}>
            <Image 
              source={{ uri: item.tenantImage }} 
              style={styles.tenantAvatar}
            />
            <View>
              <Text style={styles.tenantName}>{item.tenantName}</Text>
              <Text style={styles.requestDate}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
            icon={getStatusIcon(item.status)}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#7f8c8d" />
            <Text style={styles.detailLabel}>Move-in Date:</Text>
            <Text style={styles.detailValue}>{item.moveInDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#7f8c8d" />
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{item.duration}</Text>
          </View>

          {item.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>"{item.message}"</Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              style={[styles.actionButton, { borderColor: '#e74c3c' }]}
              labelStyle={{ color: '#e74c3c' }}
              icon="close"
              onPress={() => handleStatusChange(item.id, 'rejected')}
            >
              Reject
            </Button>
            <Button
              mode="contained"
              style={styles.actionButton}
              icon="check"
              onPress={() => handleStatusChange(item.id, 'approved')}
            >
              Approve
            </Button>
          </View>
        )}

        {item.status === 'approved' && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              style={styles.actionButton}
              icon="file-document"
              onPress={() => navigation.navigate('CreateLease', { 
                request: item,
                room: room
              })}
            >
              Create Lease
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              icon="chat"
              onPress={() => navigation.navigate('Chat', { 
                landlord: { name: 'You' },
                tenant: { name: item.tenantName, id: item.tenantId }
              })}
            >
              Message
            </Button>
          </View>
        )}

        {item.status === 'rejected' && (
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              style={styles.actionButton}
              icon="chat"
              onPress={() => navigation.navigate('Chat', { 
                landlord: { name: 'You' },
                tenant: { name: item.tenantName, id: item.tenantId }
              })}
            >
              Message Tenant
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
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
          onPress={() => alert('Manage rental requests for this property')}
        />
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.filterContainer}>
          {statusOptions.map((option) => (
            <Chip
              key={option.value}
              selected={filterStatus === option.value}
              onPress={() => setFilterStatus(option.value)}
              style={styles.filterChip}
              selectedColor="#fff"
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
            >
              Sort
            </Button>
          }
        >
          <Menu.Item onPress={() => { setSortBy('newest'); setMenuVisible(false); }} title="Newest First" />
          <Menu.Item onPress={() => { setSortBy('oldest'); setMenuVisible(false); }} title="Oldest First" />
        </Menu>
      </View>

      {sortedRequests.length > 0 ? (
        <FlatList
          data={sortedRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
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
          {requests.length} total requests • {requests.filter(r => r.status === 'pending').length} pending
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
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
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    padding: 15,
    paddingBottom: 70,
  },
  requestCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  requestDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
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
  },
  messageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
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
  },
});