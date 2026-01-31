// screens/SearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid
} from 'react-native';
import { 
  Searchbar, 
  Card, 
  Text, 
  Chip,
  FAB,
  IconButton,
  Divider,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Toast from 'react-native-toast-message';

import api from '../api/api';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [popularLocations, setPopularLocations] = useState([
    'Dar es salaam',
    'Tabata',
    'Temeke',
    'Buza',
    'Arusha',
    'Zanzibar',
    'Mwanza',
    'Bukoba',
  ]);

  // Load recent searches on component mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      //console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (location) => {
    try {
      const updatedSearches = [
        location,
        ...recentSearches.filter(item => item !== location).slice(0, 4)
      ];
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      //console.error('Error saving recent search:', error);
    }
  };

  const searchPropertiesByLocation = async (location, cursor = null) => {
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    // If it's a new search (not pagination), reset states
    if (!cursor) {
      setLoading(true);
      setIsSearching(true);
      setSearchResults([]);
      setHasMoreData(true);
    } else {
      // For pagination, only show loading if you want a footer loader
      // You can add a separate loading state for pagination if needed
    }

    saveRecentSearch(location);

    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await api.get('/api/properties/search', {
        params: {
          location,
          cursor,
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const newResults = response.data.formattedResponse || [];
      const nextCursor = response.data.nextCursor;

      //console.log('Search results:', newResults);
      console.log('Next cursor:', nextCursor);

      if (cursor) {
        // Append new results for pagination
        setSearchResults((prevResults) => [...prevResults, ...newResults]);
      } else {
        // First time search
        setSearchResults(newResults);
      }

      setNextCursor(nextCursor);
      setHasMoreData(!!nextCursor); // Set to true if there's a nextCursor, false otherwise

    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to search properties'
      );
      
      // Reset states on error
      if (!cursor) {
        setSearchResults([]);
        setIsSearching(false);
      }
    } finally {
      setLoading(false);
      // Note: We don't set setIsSearching(false) here because we want to keep showing results
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchPropertiesByLocation(searchQuery.trim());
    }
  };

  const handleLocationPress = (location) => {
    setSearchQuery(location);
    searchPropertiesByLocation(location);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setNextCursor(null);
    setHasMoreData(true);
  };

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetails', { room });
  };

  const formatPrice = (price) => {
    return ` TZS ${price.toLocaleString()}/month`;
  };

  const renderRoomCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleRoomPress(item)}
      activeOpacity={0.8}
    >
      <Card style={styles.roomCard} mode="elevated">
        <Card.Content>
          <View style={styles.roomHeader}>
            <View style={styles.roomInfo}>
              <Text variant="titleMedium" style={styles.roomTitle}>
                {item?.title ?? 'ChumbaConnect Property'}
              </Text>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={16} 
                  color="#666" 
                />
                <Text variant="bodyMedium" style={styles.roomLocation}>
                  {item?.location ?? 'Location not specified'}
                </Text>
              </View>
            </View>
            <Badge 
              size={24} 
              style={[
                styles.statusBadge, 
                item.occupied ? styles.occupiedBadge : styles.availableBadge
              ]}
            >
              {item.occupied ? 'Occupied' : 'Available'}
            </Badge>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.roomDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="currency-usd" size={20} color="#0077cc" />
                <Text variant="bodyLarge" style={styles.priceText}>
                  {formatPrice(item?.price?? 0)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="bed-queen" size={20} color="#0077cc" />
                <Text variant="bodyMedium">{item?.roomType ?? 'Room Type Not Specified'}</Text>
              </View>
            </View>
            
            {item.minMonths && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#0077cc" />
                <Text variant="bodyMedium">Min. {item?.minMonths?? 0} months</Text>
              </View>
            )}
            
            {item.rating > 0 && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                <Text variant="bodyMedium">{item.rating?.toFixed(1) || '0.0'}</Text>
              </View>
            )}
          </View>
          
          {item.amenities && item.amenities.length > 0 && (
            <View style={styles.amenitiesContainer}>
              <Text variant="bodySmall" style={styles.amenitiesTitle}>
                Amenities:
              </Text>
             <View style={styles.amenitiesList}>
  {(item?.amenities && Array.isArray(item.amenities)) ? (
    <>
      {item.amenities.slice(0, 3).map((amenity, index) => (
        <Chip 
          key={index}
          style={styles.amenityChip}
          textStyle={styles.amenityChipText}
        >
          {amenity}
        </Chip>
      ))}
      {item.amenities.length > 3 && (
        <Chip style={styles.moreChip}>
          +{item.amenities.length - 3} more
        </Chip>
      )}
    </>
  ) : (
    // Fallback in case item.amenities is null/undefined or not an array
    <Text>No amenities available</Text>
  )}
</View>

            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderPopularLocation = (location, index) => (
    <Chip
      key={index}
      mode="outlined"
      style={styles.locationChip}
      onPress={() => handleLocationPress(location)}
      icon="map-marker"
    >
      {location?? 'Unknown Location'}
    </Chip>
  );

  const renderRecentSearch = (search, index) => (
    <Chip
      key={index}
      mode="flat"
      style={styles.recentChip}
      onPress={() => handleLocationPress(search)}
      avatar={<MaterialCommunityIcons name="history" size={16} />}
    >
      {search}
    </Chip>
  );

  // Add a footer loader for pagination
  const renderFooter = () => {
    if (!loading || searchResults.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0077cc" />
        <Text style={styles.footerText}>Loading more properties...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Searchbar
          placeholder="Search by location (e.g., Tabata, Sinza)"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="magnify"
          onIconPress={handleSearch}
          clearIcon="close"
          onClearIconPress={handleClearSearch}
          loading={loading}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && searchResults.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0077cc" />
            <Text style={styles.loadingText}>Searching properties...</Text>
          </View>
        ) : isSearching || searchResults.length > 0 ? (
          searchResults.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <Text variant="titleLarge" style={styles.resultsTitle}>
                  {searchResults.length} properties found in "{searchQuery}"
                </Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={handleClearSearch}
                />
              </View>
              <FlashList
                data={searchResults}
                renderItem={renderRoomCard}
                keyExtractor={(item) => item.id.toString()}
                estimatedItemSize={200}
                contentContainerStyle={styles.resultsList}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                onEndReached={() => {
                  if (!loading && hasMoreData && nextCursor && searchQuery) {
                    searchPropertiesByLocation(searchQuery, nextCursor);
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="map-search" size={80} color="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No properties found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Try searching in a different location
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleClearSearch}
              >
                <Text style={styles.retryButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.initialView}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Recent Searches
                </Text>
                <View style={styles.chipsContainer}>
                  {recentSearches.map(renderRecentSearch)}
                </View>
              </View>
            )}

            {/* Popular Locations */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Popular Locations
              </Text>
              <View style={styles.chipsContainer}>
                {popularLocations.map(renderPopularLocation)}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Floating Action Button for quick search */}
      {!isSearching && searchResults.length === 0 && (
        <FAB
          icon="map-search"
          style={styles.fab}
          onPress={() => {
            Alert.alert('Advanced Search', 'Advanced search features coming soon!');
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  resultsTitle: {
    flex: 1,
    fontWeight: '600',
  },
  resultsList: {
    paddingBottom: 20,
  },
  roomCard: {
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomLocation: {
    marginLeft: 4,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
  },
  occupiedBadge: {
    backgroundColor: '#F44336',
  },
  divider: {
    marginVertical: 12,
  },
  roomDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontWeight: '700',
    color: '#0077cc',
    fontSize: 18,
  },
  amenitiesContainer: {
    marginTop: 8,
  },
  amenitiesTitle: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#666',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    backgroundColor: '#e8f4ff',
  },
  amenityChipText: {
    fontSize: 12,
  },
  moreChip: {
    backgroundColor: '#f0f0f0',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0077cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  initialView: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: {
    backgroundColor: '#fff',
    borderColor: '#0077cc',
  },
  recentChip: {
    backgroundColor: '#e8f4ff',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0077cc',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default SearchScreen;