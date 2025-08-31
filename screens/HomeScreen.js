import React, { useState, useRef } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const rooms = [
  {
    id: '1',
    title: 'Single Room at Sinza',
    price: '120,000 Tsh',
    location: 'Sinza, Dar es Salaam',
    description: 'Cozy single room with shared bathroom and kitchen. Perfect for students.',
    amenities: ['Wi-Fi', 'Water 24/7', 'Security'],
    images: [
      'https://picsum.photos/300/200?random=1',
      'https://picsum.photos/300/200?random=10',
      'https://picsum.photos/300/200?random=11'
    ],
  },
  {
    id: '2',
    title: 'Self-Contained at Makumbusho',
    price: '200,000 Tsh',
    location: 'Makumbusho, Dar es Salaam',
    description: 'Fully furnished self-contained room with private bathroom and kitchenette.',
    amenities: ['Wi-Fi', 'Parking', 'Water 24/7', 'Security', 'Furnished'],
    images: [
      'https://picsum.photos/300/200?random=2',
      'https://picsum.photos/300/200?random=12',
      'https://picsum.photos/300/200?random=13'
    ],
  },
  {
    id: '3',
    title: '2 Bedroom Apartment',
    price: '350,000 Tsh',
    location: 'Mbezi Beach, Dar es Salaam',
    description: 'Spacious 2 bedroom apartment with balcony and beautiful sea view.',
    amenities: ['Wi-Fi', 'Parking', 'Water 24/7', 'Security', 'Furnished', 'Balcony'],
    images: [
      'https://picsum.photos/300/200?random=3',
      'https://picsum.photos/300/200?random=14',
      'https://picsum.photos/300/200?random=15'
    ],
  },
  {
    id: '4',
    title: 'Studio Apartment at Kijitonyama',
    price: '250,000 Tsh',
    location: 'Kijitonyama, Dar es Salaam',
    description: 'Modern studio apartment with open plan living and sleeping area.',
    amenities: ['Wi-Fi', 'Parking', 'Water 24/7', 'Security', 'Furnished'],
    images: [
      'https://picsum.photos/300/200?random=4',
      'https://picsum.photos/300/200?random=16',
      'https://picsum.photos/300/200?random=17'
    ],
  },
];

const locations = ['All Areas', 'Sinza', 'Makumbusho', 'Mbezi', 'Kijitonyama', 'City Center'];
const roomTypes = ['Any', 'Single Room', 'Self-Contained', 'Apartment', 'Studio'];
const priceRanges = [
  { label: 'Any', min: 0, max: 0 },
  { label: 'Under 150k', min: 0, max: 150000 },
  { label: '150k - 300k', min: 150000, max: 300000 },
  { label: '300k - 500k', min: 300000, max: 500000 },
  { label: '500k+', min: 500000, max: 10000000 },
];

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Areas');
  const [selectedRoomType, setSelectedRoomType] = useState('Any');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [showFilters, setShowFilters] = useState(false);

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
          {images.map((image, index) => (
            <Image 
              key={index} 
              source={{ uri: image }} 
              style={styles.carouselImage} 
            />
          ))}
        </ScrollView>
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot, 
                currentIndex === index && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
      </View>
    );
  };

  const renderRoom = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate("RoomDetails", { room: item })}>
        <ImageCarousel images={item.images} />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.priceLocation}>
            <Text style={styles.price}>{item.price}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.amenitiesContainer}
          >
            {item.amenities.map((amenity, index) => (
              <Chip key={index} style={styles.amenityChip} textStyle={styles.amenityText}>
                {amenity}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("RentalRequestRoomDetails", { room: item })}
            style={styles.button}
            icon="eye"
          >
            View Details
          </Button>
          <IconButton
            icon="heart-outline"
            size={20}
            onPress={() => console.log("Saved")}
            style={styles.saveButton}
          />
        </Card.Actions>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Perfect Room 🏠</Text>
        <Text style={styles.headerSubtitle}>No middlemen, direct connections</Text>
      </View>

      <Searchbar
        placeholder="Search by location, price, or room type..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        icon="magnify"
      />

      <View style={styles.filterContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
          icon={showFilters ? "chevron-up" : "filter"}
        >
          Filters
        </Button>

        {showFilters && (
          <View style={styles.filters}>
            <Text style={styles.filterTitle}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {locations.map((location) => (
                <Chip
                  key={location}
                  selected={selectedLocation === location}
                  onPress={() => setSelectedLocation(location)}
                  style={styles.chip}
                  selectedColor="#fff"
                >
                  {location}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Room Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {roomTypes.map((type) => (
                <Chip
                  key={type}
                  selected={selectedRoomType === type}
                  onPress={() => setSelectedRoomType(type)}
                  style={styles.chip}
                  selectedColor="#fff"
                >
                  {type}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Price Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {priceRanges.map((range, index) => (
                <Chip
                  key={index}
                  selected={selectedPriceRange.label === range.label}
                  onPress={() => setSelectedPriceRange(range)}
                  style={styles.chip}
                  selectedColor="#fff"
                >
                  {range.label}
                </Chip>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  cardContent: {
    padding: 15,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    marginBottom: 5,
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
});