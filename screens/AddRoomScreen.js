import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Chip, IconButton, Switch, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AddRoomScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [size, setSize] = useState('');
  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const availableAmenities = [
    'Wi-Fi', 'Water 24/7', 'Security', 'Parking', 'Furnished', 
    'Electricity', 'Generator', 'Balcony', 'Garden', 'Swimming Pool'
  ];

  // Pick multiple images from gallery
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSave = async () => {
    if (!title || !price || !location) {
      Alert.alert('Missing Information', 'Please fill all required fields!');
      return;
    }

    if (images.length === 0) {
      Alert.alert('No Images', 'Please add at least one image of the room.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newRoom = {
        id: Date.now().toString(),
        title,
        price: price + ' Tsh',
        location,
        description,
        bedrooms,
        bathrooms,
        size: size ? size + ' m²' : '',
        amenities,
        status: 'available',
        images,
        views: 0,
        inquiries: 0,
        dateAdded: new Date().toISOString().split('T')[0],
      };

      console.log("New Room:", newRoom);
      setIsLoading(false);
      
      Alert.alert(
        'Success!',
        'Room added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Add New Property</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="Property Title *"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="home" />}
            />

            <View style={styles.row}>
              <TextInput
                label="Price (Tsh) *"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                left={<TextInput.Icon icon="cash" />}
              />
              <TextInput
                label="Size (m²)"
                value={size}
                onChangeText={setSize}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                left={<TextInput.Icon icon="square" />}
              />
            </View>

            <TextInput
              label="Location *"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="map-marker" />}
            />

            <View style={styles.row}>
              <TextInput
                label="Bedrooms"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                left={<TextInput.Icon icon="bed" />}
              />
              <TextInput
                label="Bathrooms"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                left={<TextInput.Icon icon="shower" />}
              />
            </View>

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              left={<TextInput.Icon icon="text" />}
            />

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {availableAmenities.map((amenity, index) => (
                <Chip
                  key={index}
                  selected={amenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                  style={styles.amenityChip}
                  selectedColor="#fff"
                  icon={amenities.includes(amenity) ? "check" : "plus"}
                >
                  {amenity}
                </Chip>
              ))}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Photos ({images.length}/8)</Text>
            <Text style={styles.sectionSubtitle}>Add clear photos to attract more tenants</Text>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesPreview}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.imageButtons}>
              <Button
                mode="outlined"
                onPress={pickImages}
                style={styles.imageButton}
                icon="image-multiple"
              >
                Choose Photos
              </Button>
              <Button
                mode="outlined"
                onPress={takePhoto}
                style={styles.imageButton}
                icon="camera"
              >
                Take Photo
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={isLoading}
          disabled={isLoading}
          contentStyle={styles.buttonContent}
          icon="content-save"
        >
          {isLoading ? 'Saving...' : 'Save Property'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 80,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amenityChip: {
    margin: 4,
    backgroundColor: '#262d47ff',
  },
  imagesPreview: {
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
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
  saveButton: {
    borderRadius: 10,
  },
  buttonContent: {
    height: 50,
  },
});