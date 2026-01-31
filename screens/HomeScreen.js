import React, { useState, useRef, useEffect, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, RefreshControl, Platform, ToastAndroid, StatusBar } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import BASE_URL from './Config';
import Toast from 'react-native-toast-message';
import { LocationContext } from "../context/LocationContext"; 
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { FlashList } from "@shopify/flash-list";

const { width } = Dimensions.get('window');

const locations = ['All Areas', 'Sinza', 'Makumbusho', 'Mbezi', 'Kijitonyama', 'City Center'];
const roomTypes = [
  'Self Contained',
  'Apartment',
  'Single Room',
  'Studio',
  'Bedsitter',
  'Shared Room',
  'Hostel',
];
const priceRanges = [
  { label: 'Any', min: 0, max: 0 },
  { label: 'Under 50k', min: 0, max: 50000 },
  { label: '50k - 100k', min: 50000, max: 100000 },
  { label: '100k - 150k', min: 100000, max: 150000 },
  { label: '150k - 300k', min: 150000, max: 300000 },
  { label: '300k - 500k', min: 300000, max: 500000 },
  { label: '500k+', min: 500000, max: 10000000 },
];

// Enhanced Search validation rules
const SEARCH_RULES = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  ALLOWED_CHARACTERS: /^[a-zA-Z0-9\s\-',.kKmM]+$/,
  BLACKLISTED_WORDS: [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'its', 'our', 'their',
    'this', 'that', 'these', 'those',
    'test', 'asdf', 'qwerty', '123', 'abc', 'xyz'
  ],
  PRICE_PATTERNS: [
    /\b\d+\.?\d*\s*(k|K|thousand)\b/,
    /\b\d+\.?\d*\s*(m|M|million)\b/,
    /\b\d+\s*(shilling|shillings|tsh|Tsh)\b/,
    /\b\d{4,}\b/,
  ],
  LOCATION_KEYWORDS: [
    'sinza', 'makumbusho', 'mbezi', 'kijitonyama', 'city', 'center', 'downtown',
    'area', 'street', 'road', 'avenue', 'place', 'district', 'zone'
  ]
};

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Areas');
  const [selectedRoomType, setSelectedRoomType] = useState('Any');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchSent, setLastSearchSent] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0); // Add this for forcing re-render

  //added new state to fetch more
    const [canFetchMore, setCanFetchMore] = useState(true);
    const [hasMoreInBatch, setHasMoreInBatch] = useState(true);

  

  const { location } = useContext(LocationContext);
  const flashListRef = useRef();

  // Enhanced parseRoomTypeFromQuery function
  const parseRoomTypeFromQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Map common variations to standard room types
    const roomTypeVariations = {
      'self contained': 'Self Contained',
      'selfcontained': 'Self Contained',
      'apartment': 'Apartment',
      'single room': 'Single Room',
      'singleroom': 'Single Room',
      'studio': 'Studio',
      'bedsitter': 'Bedsitter',
      'bed sitter': 'Bedsitter',
      'shared room': 'Shared Room',
      'sharedroom': 'Shared Room',
      'hostel': 'Hostel'
    };
    
    // Check for exact matches first
    for (const [variation, standardType] of Object.entries(roomTypeVariations)) {
      if (lowerQuery.includes(variation)) {
        return standardType;
      }
    }
    
    // Fallback to checking against standard room types
    return roomTypes.find(roomType => 
      lowerQuery.includes(roomType.toLowerCase())
    ) || null;
  };

  // Enhanced search validation with price and room type detection
  const isValidSearch = (query) => {
    const trimmedQuery = query.trim().toLowerCase();
    
    // Check length
    if (trimmedQuery.length < SEARCH_RULES.MIN_LENGTH) {
      return { isValid: false, reason: 'Search too short' };
    }
    
    if (trimmedQuery.length > SEARCH_RULES.MAX_LENGTH) {
      return { isValid: false, reason: 'Search too long' };
    }
    
    // Check for allowed characters
    if (!SEARCH_RULES.ALLOWED_CHARACTERS.test(trimmedQuery)) {
      return { isValid: false, reason: 'Invalid characters' };
    }
    
    // Check if it's a price search
    const isPriceSearch = SEARCH_RULES.PRICE_PATTERNS.some(pattern => 
      pattern.test(trimmedQuery)
    );
    
    // Check if it's a room type search using the enhanced function
    const isRoomTypeSearch = parseRoomTypeFromQuery(trimmedQuery) !== null;
    
    // Check if it's a location search
    const isLocationSearch = SEARCH_RULES.LOCATION_KEYWORDS.some(keyword => 
      trimmedQuery.includes(keyword)
    ) || locations.some(location => 
      trimmedQuery.includes(location.toLowerCase())
    );
    
    // If it's a price search, room type search, or location search, it's valid
    if (isPriceSearch || isRoomTypeSearch || isLocationSearch) {
      return { 
        isValid: true, 
        reason: '',
        searchType: isPriceSearch ? 'price' : 
                   isRoomTypeSearch ? 'room_type' : 
                   isLocationSearch ? 'location' : 'general'
      };
    }
    
    // For general searches, check for meaningful content
    const words = trimmedQuery.split(/\s+/).filter(word => word.length > 1);
    
    if (words.length === 0) {
      return { isValid: false, reason: 'No meaningful search terms' };
    }
    
    // Check if all words are blacklisted
    const hasOnlyBlacklisted = words.every(word => 
      SEARCH_RULES.BLACKLISTED_WORDS.includes(word)
    );
    
    if (hasOnlyBlacklisted) {
      return { isValid: false, reason: 'Meaningless search terms' };
    }
    
    // If we have at least one meaningful word that's not blacklisted, it's valid
    const hasMeaningfulWord = words.some(word => 
      !SEARCH_RULES.BLACKLISTED_WORDS.includes(word)
    );
    
    if (!hasMeaningfulWord) {
      return { isValid: false, reason: 'No meaningful search terms' };
    }
    
    return { 
      isValid: true, 
      reason: '',
      searchType: 'general'
    };
  };

  // Parse price from search query
  const parsePriceFromQuery = (query) => {
    const priceMatch = query.match(/(\d+\.?\d*)\s*(k|K|m|M|thousand|million)?/);
    if (!priceMatch) return null;
    
    let amount = parseFloat(priceMatch[1]);
    const multiplier = priceMatch[2];
    
    if (multiplier) {
      if (multiplier.toLowerCase() === 'k' || multiplier.toLowerCase() === 'thousand') {
        amount *= 1000;
      } else if (multiplier.toLowerCase() === 'm' || multiplier.toLowerCase() === 'million') {
        amount *= 1000000;
      }
    }
    
    return amount;
  };

  // Enhanced search analysis for better recommendations
  const analyzeSearchQuery = (query) => {
    const validation = isValidSearch(query);
    if (!validation.isValid) return null;
    
    const analysis = {
      rawQuery: query.trim(),
      normalizedQuery: query.trim().toLowerCase(),
      timestamp: new Date().toISOString(),
      isValid: true,
      searchType: validation.searchType,
      detectedPrice: null,
      detectedRoomType: null,
      isLocationSearch: false,
      isPriceSearch: false,
      isRoomTypeSearch: false
    };
    
    // Detect price
    const price = parsePriceFromQuery(query);
    if (price) {
      analysis.detectedPrice = price;
      analysis.isPriceSearch = true;
    }
    
    // Detect room type using enhanced function
    const roomType = parseRoomTypeFromQuery(query);
    if (roomType) {
      analysis.detectedRoomType = roomType;
      analysis.isRoomTypeSearch = true;
    }
    
    // Detect location
    const isLocation = SEARCH_RULES.LOCATION_KEYWORDS.some(keyword => 
      analysis.normalizedQuery.includes(keyword)
    ) || locations.some(location => 
      analysis.normalizedQuery.includes(location.toLowerCase())
    );
    
    if (isLocation) {
      analysis.isLocationSearch = true;
    }
    
    return analysis;
  };

  // Send search to backend for storage
  const sendSearchToBackend = async (query) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      
      const searchAnalysis = analyzeSearchQuery(query);
      if (!searchAnalysis) return;
      
      // Avoid sending duplicate searches in quick succession
      if (lastSearchSent === query) return;
      
      await axios.post(`${BASE_URL}/api/store-search`, searchAnalysis, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setLastSearchSent(query);
      
    } catch (error) {
      console.log('Failed to store search (non-critical):', error.message);
    }
  };

  // Fixed search handler
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    
    // If search is cleared, reset filters immediately
    if (!text.trim()) {
      setSelectedLocation('All Areas');
      setSelectedRoomType('Any');
      setSelectedPriceRange(priceRanges[0]);
      // Force re-render by updating the key
      setForceUpdateKey(prev => prev + 1);
      return;
    }
    
    // Debounce sending to backend
    if (text.trim().length >= SEARCH_RULES.MIN_LENGTH) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        sendSearchToBackend(text);
      }, 1000);
    }
  };

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedLocation('All Areas');
    setSelectedRoomType('Any');
    setSelectedPriceRange(priceRanges[0]);
    // Force re-render by updating the key
    setForceUpdateKey(prev => prev + 1);
    
    // Scroll to top
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const searchTimeout = useRef(null);

  // Fetch rooms from backend
const fetchRooms = async (isInitialLoad = false, isRefreshing = false) => {
  try {
    if (loading || loadingMore || (!isInitialLoad && !canFetchMore && !isRefreshing)) return;

    if (isInitialLoad) {
      setLoading(true);
    } else if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    const token = await AsyncStorage.getItem('userToken');

    let url = `/api/getallproperties?limit=10`;

    // Add isRefreshing parameter to the URL
    if (isRefreshing) {
      url += `&isRefreshing=true`;
    }

    // Don't use cursor when refreshing
    if (nextCursor && !isRefreshing) {
      url += `&cursor=${encodeURIComponent(nextCursor)}`;
    }

    // Build parameters
    const params = {};
    
    if (location) {
      params.street = location.street;
      params.district = location.district;
      params.region = location.region;
      params.city = location.city;
    } else {
      params.street = '';
      params.district = '';
      params.region = '';
      params.city = '';
      params.noLocation = true;
    }

    const response = await api.get(url, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data) {
      const recommended = response.data.recommended;
      
      if (isRefreshing) {
        // When refreshing, replace all rooms
        setRooms(recommended);
      } else {
        // When loading more, append new rooms
        setRooms(prev => {
          const ids = new Set(prev.map(r => r.id));
          const unique = recommended.filter(r => !ids.has(r.id));
          return [...prev, ...unique];
        });
      }
      
      setHasMore(response.data.hasMore);
      
      // Reset cursor when refreshing
      if (isRefreshing) {
        setNextCursor(response.data.nextCursor || null);
      } else {
        setNextCursor(response.data.nextCursor);
      }
      
      setCanFetchMore(response.data.canFetchMore);
      setHasMoreInBatch(response.data.hasMoreInBatch);
      
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }
  } catch (err) {
    setError('Failed to load properties. Please try again.');
    let errormessage;
    
    if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
      errormessage = 'Unable to connect. Please check your internet connection or try again later.';
    }
    else if (err.request && !err.response) {
      errormessage = 'Server is not responding. Please try again later.';
    }
    else if (err.response) {
      errormessage =
        err.response.data?.message ||
        "Something went wrong on the server.";
    }
    else {
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
    setLoadingMore(false);
    setRefreshing(false);
  }
};



  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if ( !initialLoadComplete) {
      fetchRooms(true);
    }
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (location) {
  //       fetchRooms(true);
  //     }
  //   }, [location])
  // );

 useEffect(() => {
  let filtered = Array.isArray(rooms) ? rooms : [];

  const safeSearch = (searchQuery ?? "").toString().trim();

  if (safeSearch) {
    const searchAnalysis =
      typeof analyzeSearchQuery === "function"
        ? analyzeSearchQuery(safeSearch)
        : null;

    filtered = filtered.filter(room => {
      const title = typeof room?.title === "string" ? room.title.toLowerCase() : "";
      const location = typeof room?.location === "string" ? room.location.toLowerCase() : "";
      const roomType = typeof room?.roomType === "string" ? room.roomType.toLowerCase() : "";
      const price =
        typeof room?.price === "number"
          ? room.price
          : typeof room?.price === "string"
          ? parseInt(room.price.replace(/,/g, ""), 10) || 0
          : 0;

      const normalizedQuery =
        searchAnalysis?.normalizedQuery?.toLowerCase() ||
        safeSearch.toLowerCase();

      const basicMatch =
        title.includes(normalizedQuery) ||
        location.includes(normalizedQuery) ||
        price.toString().includes(safeSearch) ||
        roomType.includes(normalizedQuery);

      const priceMatch =
        searchAnalysis?.detectedPrice &&
        price >= searchAnalysis.detectedPrice * 0.8 &&
        price <= searchAnalysis.detectedPrice * 1.2;

      const roomTypeMatch =
        searchAnalysis?.detectedRoomType &&
        room?.roomType === searchAnalysis.detectedRoomType;

      return basicMatch || priceMatch || roomTypeMatch;
    });
  }

  if ((selectedLocation ?? "") !== "All Areas") {
    filtered = filtered.filter(room =>
      typeof room?.location === "string" &&
      room.location.toLowerCase().includes((selectedLocation ?? "").toLowerCase())
    );
  }

  if ((selectedRoomType ?? "") !== "Any") {
    filtered = filtered.filter(room =>
      room?.roomType === selectedRoomType
    );
  }

  if ((selectedPriceRange?.min ?? 0) > 0 || (selectedPriceRange?.max ?? 0) > 0) {
    filtered = filtered.filter(room => {
      const price =
        typeof room?.price === "number"
          ? room.price
          : typeof room?.price === "string"
          ? parseInt(room.price.replace(/,/g, ""), 10) || 0
          : 0;

      return (
        price >= (selectedPriceRange?.min ?? 0) &&
        price <= (selectedPriceRange?.max ?? Infinity)
      );
    });
  }

  setFilteredRooms(filtered);
}, [
  searchQuery,
  selectedLocation,
  selectedRoomType,
  selectedPriceRange,
  rooms,
  forceUpdateKey
]);


  // Effect to handle search clearing and UI refresh
  useEffect(() => {
    if (searchQuery === '') {
      // Force UI refresh when search is cleared
      const timer = setTimeout(() => {
        setFilteredRooms([...rooms]);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, rooms]);

  // const onRefresh = () => {
  //   setRefreshing(true);
  //   fetchRooms(true);
  // };

  const onRefresh = () => {
  // Pass true for isRefreshing flag
  fetchRooms(false, true);
};

  const ImageCarousel = ({ images }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: false }
    );
    
    const handleMomentumScrollEnd = (event) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
      setCurrentIndex(index);
    };

   return (
  <View>
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      style={styles.carousel}
    >
      {(Array.isArray(images) ? images : []).map((image, index) => (
        <Image
          key={index}
          source={{ uri: image }}
          style={styles.carouselImage}
        />
      ))}
    </ScrollView>

    <View style={styles.pagination}>
      {(Array.isArray(images) ? images : []).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentIndex === index && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  </View>
);

  };

  const formatPrice = (price) => {
    const priceNumber = typeof price === 'string' 
      ? parseInt(price.replace(/,/g, '')) 
      : price;
    
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(priceNumber).replace('TZS', 'Tsh');
  };

  const renderOccupancyStatus = (isOccupied) => {
    return (
      <View style={[
        styles.occupancyBadge,
        isOccupied ? styles.occupiedBadge : styles.availableBadge
      ]}>
        <Text style={[
          styles.occupancyText,
          isOccupied ? styles.occupiedText : styles.availableText
        ]}>
          {isOccupied ? 'Occupied' : 'Available'}
        </Text>
      </View>
    );
  };

  const renderMinMonthsBadge = (minMonths) => {
    if (!minMonths || minMonths === 1) return null;
    
    return (
      <View style={styles.minMonthsBadge}>
        <Ionicons name="calendar" size={12} color="#fff" />
        <Text style={styles.minMonthsText}>Min. {minMonths} {minMonths === 1 ? 'month' : 'months'}</Text>
      </View>
    );
  };

  const renderRoom = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate("RoomDetails", { room: item })}>
        <View style={styles.imageContainer}>
          <ImageCarousel images={item.images || []} />
          {/* {renderOccupancyStatus(item.occupied)} */}
          {renderOccupancyStatus(!!item?.occupied)}

          {renderMinMonthsBadge(item?.minMonths ?? 0)}
        </View>
        <Card.Content style={styles.cardContent}>
          {/* <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{item?.title ?? 'Chumba Connect Property'}</Text>
          </View> */}
          <View style={styles.priceLocation}>
            <Text style={styles.price}>{formatPrice(item?.price ?? 0)}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.location}>{item?.location?? 'Tanzania'}</Text>
            </View>
          </View>
          
          <View style={styles.roomInfoRow}>
            {item.roomType && (
              <View style={styles.roomTypeContainer}>
                <Ionicons name="home" size={14} color="#666" />
                <Text style={styles.roomType}>{item.roomType}</Text>
              </View>
            )}
            
            {item.minMonths && item.minMonths > 1 && (
              <View style={styles.minMonthsContainer}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.minMonthsInline}>
                  Min. {item.minMonths} {item.minMonths === 1 ? 'month' : 'months'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.amenitiesContainer}
          >
           {Array.isArray(item?.amenities) && item.amenities.map((amenity, index) => (
  <Chip key={index} style={styles.amenityChip} textStyle={styles.amenityText}>
    {amenity}
  </Chip>
))}

          </ScrollView>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => item && navigation.navigate("RoomDetails", { room: item })}

            style={styles.button}
            icon="eye"
          >
            View Details
          </Button>
        </Card.Actions>
      </TouchableOpacity>
    </Card>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={false}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => fetchRooms(true)}
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
    <StatusBar 
      barStyle="dark-content" 
      backgroundColor="#ffffff" 
      translucent={false}
    />
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Perfect Room</Text>
        <Text style={styles.headerSubtitle}>No Dalali, direct connections</Text>
      </View>

      {/* Show loading indicator when refreshing and rooms exist */}
      {refreshing && rooms.length > 0 && (
        <View style={styles.refreshIndicatorContainer}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={styles.refreshText}>Refreshing properties...</Text>
        </View>
      )}

      {!initialLoadComplete && loading ? (
        // 🔹 Initial loading state
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : initialLoadComplete && filteredRooms.length === 0 && rooms.length > 0 && searchQuery ? (
        // 🔹 Search completed but no results
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.noResultsText}>No properties found</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search terms or filters
          </Text>
          <Button
            mode="outlined"
            onPress={clearSearch}
            style={styles.clearSearchButton}
          >
            Clear Search
          </Button>
        </View>
      ) : initialLoadComplete && rooms.length === 0 ? (
        // 🔹 Initial load finished but no properties
        <View style={styles.centerContainer}>
          <Ionicons name="home" size={64} color="#ccc" />
          <Text style={styles.noResultsText}>No properties available</Text>
          <Text style={styles.noResultsSubtext}>
            Check back later 
          </Text>
        </View>
      ) : (
        // 🔹 Properties list with refresh control
        <FlashList
          ref={flashListRef}
          data={filteredRooms}
          renderItem={renderRoom}
          keyExtractor={(item) => String(item._id || item.id)}
          estimatedItemSize={320}
          
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#800080']}
              tintColor="#800080"
              title={refreshing ? "Refreshing..." : "Pull to refresh"}
              titleColor="#800080"
            />
          }
          
          onEndReachedThreshold={0.9}
          onEndReached={() => {
            if (
              !initialLoadComplete ||
              onEndReachedCalledDuringMomentum.current ||
              (!hasMoreInBatch && !canFetchMore) ||
              loadingMore ||
              loading ||
              refreshing
            ) {
              return;
            }

            onEndReachedCalledDuringMomentum.current = true;
            fetchRooms(false, false);
          }}
          
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.bottomSpinnerContainer}>
                <ActivityIndicator size="small" color="#800080" />
              </View>
            ) : !canFetchMore ? (
              <View style={styles.noMoreItemsContainer}>
                <Text style={styles.noMoreItemsText}>No more items to show</Text>
              </View>
            ) : null
          }
          
          // Show refresh indicator at the top of the list
          ListHeaderComponent={
            refreshing && rooms.length > 0 ? null : undefined
          }
        />
      )}
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
    backgroundColor: '#f8f9fa', 
    paddingHorizontal: 10 
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#f8f9fa',
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
  searchBar: {
    marginVertical: 15,
    borderRadius: 10,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterToggle: {
    borderRadius: 20,
    borderColor: '#007AFF',
  },
  filters: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 8,
  },
  chipScroll: {
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#262d47ff',
  },
  listContent: {
    paddingBottom: 20,
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
  carousel: {
    height: 200,
  },
  carouselImage: { 
    width: width - 40, 
    height: 200 
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
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
  occupancyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  },
  occupiedText: {
    color: '#fff',
  },
  availableText: {
    color: '#fff',
  },
  minMonthsBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
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
  cardContent: {
    padding: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    flex: 1,
  },
  priceLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#007AFF' 
  },
  roomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  roomTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  roomType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  minMonthsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minMonthsInline: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 4 
  },
  description: { 
    fontSize: 14, 
    color: '#7f8c8d', 
    marginBottom: 10,
    lineHeight: 20,
  },
  amenitiesContainer: {
    marginBottom: 10,
  },
  amenityChip: {
    height: 28,
    marginRight: 8,
    backgroundColor: '#e8f4f8',
  },
  amenityText: {
    fontSize: 12,
    color: '#007AFF',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  button: {
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#f8f9fa',
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
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
  },
  clearSearchButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  bottomSpinnerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfListContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },

  noMoreItemsContainer: {
    paddingVertical: 20,        // Add some space vertically
    alignItems: 'center',      // Center the text horizontally
    justifyContent: 'center',  // Center the text vertically
  },

  // Text style for the "No more items to show" message
  noMoreItemsText: {
    fontSize: 16,              // Set the font size to a readable size
    color: '#888',             // Set the text color to a subtle gray (you can change this)
    fontWeight: '500',         // Medium weight for better readability
    textAlign: 'center',      
  },

  refreshIndicatorContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  backgroundColor: '#f8f9fa',
  borderBottomWidth: 1,
  borderBottomColor: '#e0e0e0',
},
refreshText: {
  marginLeft: 10,
  fontSize: 14,
  color: '#800080',
  fontWeight: '500',
},
});