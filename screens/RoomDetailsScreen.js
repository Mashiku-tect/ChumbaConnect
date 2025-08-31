import React, { useRef, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, Button, Card, IconButton, Divider, Modal, Portal, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function RoomDetailsScreen({ route, navigation }) {
  const { room } = route.params;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rentalModalVisible, setRentalModalVisible] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  // Mock landlord data
  const landlord = {
    name: "John Doe",
    phone: "0712345678",
    rating: 4.8,
    reviews: 42,
    verified: true,
    email: "john.doe@example.com"
  };

  // Mock location data
  const region = {
    latitude: -6.7924,
    longitude: 39.2083,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Function to call landlord
  const callLandlord = () => {
    Linking.openURL(`tel:${landlord.phone}`);
  };

  // Function to send rental request
  const sendRentalRequest = () => {
    setRentalModalVisible(true);
  };

  const handleSubmitRequest = () => {
    if (!moveInDate || !duration) {
      Alert.alert('Missing Information', 'Please provide move-in date and duration');
      return;
    }

    setIsSendingRequest(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSendingRequest(false);
      setRentalModalVisible(false);
      
      Alert.alert(
        'Request Sent!',
        'Your rental request has been sent to the landlord. They will contact you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setMoveInDate('');
              setDuration('');
              setMessage('');
            }
          }
        ]
      );
    }, 2000);
  };

  return (
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
            {room.images.map((image, index) => (
              <Image 
                key={index} 
                source={{ uri: image }} 
                style={styles.carouselImage} 
              />
            ))}
          </ScrollView>
          
          <View style={styles.pagination}>
            {room.images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  currentIndex === index && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>
          
          <IconButton
            icon="arrow-left"
            size={24}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
          
          <IconButton
            icon="heart-outline"
            size={24}
            style={styles.favoriteButton}
            onPress={() => console.log("Added to favorites")}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{room.title}</Text>
            <IconButton
              icon="share-variant"
              size={20}
              style={styles.shareButton}
              onPress={() => console.log("Share room")}
            />
          </View>
          
          <View style={styles.priceLocation}>
            <Text style={styles.price}>{room.price} <Text style={styles.perMonth}>/month</Text></Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.location}>{room.location}</Text>
            </View>
          </View>

          {/* Key Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="bed" size={20} color="#007AFF" />
              <Text style={styles.featureText}>2 Bedrooms</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="water" size={20} color="#007AFF" />
              <Text style={styles.featureText}>1 Bathroom</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="square" size={20} color="#007AFF" />
              <Text style={styles.featureText}>45 m²</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{room.description}</Text>

          <Divider style={styles.divider} />

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Location Map */}
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={region}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={region} />
            </MapView>
            <Button 
  mode="outlined" 
  style={styles.directionsButton}
  icon="navigation"
  onPress={() => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${region.latitude},${region.longitude}&travelmode=driving`;
    Linking.openURL(url).catch(err => {
      console.error("Failed to open Google Maps:", err);
      Alert.alert("Error", "Could not open Google Maps.");
    });
  }}
>
  Get Directions
</Button>

          </View>

          <Divider style={styles.divider} />

          {/* Landlord Info */}
          <Text style={styles.sectionTitle}>Landlord Information</Text>
          <Card style={styles.landlordCard}>
            <Card.Content>
              <View style={styles.landlordHeader}>
                <View style={styles.landlordInfo}>
                  <Text style={styles.landlordName}>{landlord.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{landlord.rating} ({landlord.reviews} reviews)</Text>
                  </View>
                </View>
                {landlord.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.contactInfo}>
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={callLandlord}
                >
                  <Ionicons name="call" size={16} color="#007AFF" />
                  <Text style={styles.contactText}>{landlord.phone}</Text>
                </TouchableOpacity>
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={16} color="#007AFF" />
                  <Text style={styles.contactText}>{landlord.email}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
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
            onPress={() => navigation.navigate("Chat", { landlord })}
            style={[styles.contactButton, styles.chatButton]}
            contentStyle={styles.buttonContent}
            icon="message-text"
          >
            Message
          </Button>
          <Button
            mode="contained"
            onPress={sendRentalRequest}
            style={[styles.contactButton, styles.requestButton]}
            contentStyle={styles.buttonContent}
            icon="file-document-edit"
          >
            Request
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
                Send a formal rental request to {landlord.name}
              </Text>
              
              <TextInput
                label="Move-in Date *"
                value={moveInDate}
                onChangeText={setMoveInDate}
                style={styles.modalInput}
                mode="outlined"
                placeholder="e.g., 2023-12-01"
                left={<TextInput.Icon icon="calendar" />}
              />
              
              <TextInput
                label="Duration *"
                value={duration}
                onChangeText={setDuration}
                style={styles.modalInput}
                mode="outlined"
                placeholder="e.g., 6 months"
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  content: { 
    padding: 20,
    paddingBottom: 120, // Increased space for additional button
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
    marginBottom: 20,
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
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 5,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
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
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
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
    borderColor: '#007AFF',
  },
  requestButton: {
    backgroundColor: '#FF9500',
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
});