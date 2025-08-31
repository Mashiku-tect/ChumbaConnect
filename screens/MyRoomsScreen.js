import React, { useState } from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Searchbar, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function MyRoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([
    {
      id: '1',
      title: 'Single Room at Sinza',
      price: '120,000 Tsh',
      location: 'Sinza, Dar es Salaam',
      status: 'available',
      image: 'https://picsum.photos/300/200?random=1',
      views: 42,
      inquiries: 8,
      dateAdded: '2023-10-15',
      requests: [
        {
          id: '1',
          tenantName: 'Sarah Johnson',
          tenantImage: 'https://i.pravatar.cc/150?img=1',
          moveInDate: '2023-12-01',
          duration: '6 months',
          message: 'I would like to schedule a viewing for tomorrow.',
          status: 'pending',
          timestamp: '2023-11-10'
        },
        {
          id: '2',
          tenantName: 'Michael Smith',
          tenantImage: 'https://i.pravatar.cc/150?img=8',
          moveInDate: '2023-12-15',
          duration: '12 months',
          message: 'Is the apartment still available?',
          status: 'pending',
          timestamp: '2023-11-12'
        }
      ]
    },
    {
      id: '2',
      title: 'Self-Contained at Makumbusho',
      price: '200,000 Tsh',
      location: 'Makumbusho, Dar es Salaam',
      status: 'occupied',
      image: 'https://picsum.photos/300/200?random=2',
      views: 28,
      inquiries: 3,
      dateAdded: '2023-09-22',
      requests: [
        {
          id: '3',
          tenantName: 'Emily Wilson',
          tenantImage: 'https://i.pravatar.cc/150?img=11',
          moveInDate: '2024-01-01',
          duration: '3 months',
          message: 'Could you send me more pictures?',
          status: 'pending',
          timestamp: '2023-11-15'
        }
      ]
    },
    {
      id: '3',
      title: '2 Bedroom Apartment',
      price: '350,000 Tsh',
      location: 'Mbezi Beach, Dar es Salaam',
      status: 'available',
      image: 'https://picsum.photos/300/200?random=3',
      views: 67,
      inquiries: 12,
      dateAdded: '2023-11-05',
      requests: [
        {
          id: '4',
          tenantName: 'David Brown',
          tenantImage: 'https://i.pravatar.cc/150?img=15',
          moveInDate: '2023-11-20',
          duration: '9 months',
          message: 'What are the nearby amenities?',
          status: 'pending',
          timestamp: '2023-11-08'
        },
        {
          id: '5',
          tenantName: 'Lisa Anderson',
          tenantImage: 'https://i.pravatar.cc/150?img=22',
          moveInDate: '2023-12-05',
          duration: '24 months',
          message: 'I am interested in long term rental.',
          status: 'pending',
          timestamp: '2023-11-14'
        }
      ]
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleStatus = (id) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? { ...room, status: room.status === 'available' ? 'occupied' : 'available' }
          : room
      )
    );
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.dateAdded) - new Date(a.dateAdded);
    if (sortBy === 'oldest') return new Date(a.dateAdded) - new Date(b.dateAdded);
    if (sortBy === 'price-high') return parseInt(b.price.replace(/,/g, '')) - parseInt(a.price.replace(/,/g, ''));
    if (sortBy === 'price-low') return parseInt(a.price.replace(/,/g, '')) - parseInt(b.price.replace(/,/g, ''));
    return 0;
  });

  const getStatusColor = (status) => {
    return status === 'available' ? '#2ecc71' : '#e74c3c';
  };

  const getStatusIcon = (status) => {
    return status === 'available' ? 'checkmark-circle' : 'close-circle';
  };

  const handleInquiriesPress = (room) => {
    if (room.inquiries > 0) {
      navigation.navigate('RentalRequests', { 
        room: room,
        requests: room.requests 
      });
    }
  };

  const renderRoom = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Chip
          style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          textStyle={styles.statusChipText}
          icon={getStatusIcon(item.status)}
        >
          {item.status.toUpperCase()}
        </Chip>
        <View style={styles.viewsContainer}>
          <Ionicons name="eye" size={14} color="#fff" />
          <Text style={styles.viewsText}>{item.views}</Text>
        </View>
      </View>
      
      <Card.Content style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.priceLocation}>
          <Text style={styles.price}>{item.price} <Text style={styles.perMonth}>/month</Text></Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="eye" size={14} color="#7f8c8d" />
            <Text style={styles.statText}>{item.views} views</Text>
          </View>
          <TouchableOpacity 
            style={styles.stat}
            onPress={() => handleInquiriesPress(item)}
            disabled={item.inquiries === 0}
          >
            <Ionicons 
              name="chatbubble" 
              size={14} 
              color={item.inquiries > 0 ? "#007AFF" : "#7f8c8d"} 
            />
            <Text style={[
              styles.statText, 
              item.inquiries > 0 && styles.inquiriesTextActive,
              item.inquiries === 0 && styles.inquiriesTextDisabled
            ]}>
              {item.inquiries} inquiries
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
      
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="outlined"
          onPress={() => toggleStatus(item.id)}
          style={[styles.actionButton, { borderColor: getStatusColor(item.status) }]}
          labelStyle={{ color: getStatusColor(item.status) }}
          icon={item.status === 'available' ? 'person-off' : 'person'}
        >
          {item.status === 'available' ? 'Mark Occupied' : 'Mark Available'}
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditRoom', { room: item })}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties 🏘️</Text>
        <Text style={styles.headerSubtitle}>Manage your rental properties</Text>
      </View>

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

      {sortedRooms.length > 0 ? (
        <FlatList
          data={sortedRooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddRoom")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    paddingHorizontal: 10 
  },
  header: {
    paddingTop: 50,
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
});