import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, Card, IconButton, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function EditRoomScreen({ route, navigation }) {
  const { room } = route.params;
  
  const [title, setTitle] = useState(room.title || '');
  const [price, setPrice] = useState(room.price ? room.price.replace(' Tsh', '') : '');
  const [location, setLocation] = useState(room.location || '');
  const [description, setDescription] = useState(room.description || '');
  const [bedrooms, setBedrooms] = useState(room.bedrooms ? room.bedrooms.toString() : '1');
  const [bathrooms, setBathrooms] = useState(room.bathrooms ? room.bathrooms.toString() : '1');
  const [size, setSize] = useState(room.size ? room.size.replace(' m²', '') : '');
  const [images, setImages] = useState(room.images || []);
  const [amenities, setAmenities] = useState(room.amenities || []);
  const [isLoading, setIsLoading] = useState(false);

  const availableAmenities = [
    'Wi-Fi', 'Water 24/7', 'Security', 'Parking', 'Furnished', 
    'Electricity', 'Generator', 'Balcony', 'Garden', 'Swimming Pool'
  ];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Property',
      headerRight: () => (
        <Button
          mode="text"
          onPress={handleDelete}
          textColor="#e74c3c"
          icon="delete"
        >
          Delete
        </Button>
      ),
    });
  }, [navigation]);

  // Pick multiple images from gallery
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    Alert.alert(
      "Remove Image",
      "Are you sure you want to remove this image?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
          }
        }
      ]
    );
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
      const updatedRoom = {
        ...room,
        title,
        price: price + ' Tsh',
        location,
        description,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        size: size ? size + ' m²' : '',
        amenities,
        images,
      };

      console.log("Updated Room:", updatedRoom);
      setIsLoading(false);
      
      Alert.alert(
        'Success!',
        'Property updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // Simulate delete API call
            setTimeout(() => {
              Alert.alert("Success", "Property deleted successfully");
              navigation.goBack();
            }, 1000);
            }
          }
        ]
      );
    };

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                  style={[
                    styles.amenityChip,
                    amenities.includes(amenity) && styles.amenityChipSelected
                  ]}
                  selectedColor="#fff"
                >
                  {/* Text is properly wrapped in Chip component which handles text rendering */}
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
                <Text>Choose Photos</Text>
              </Button>
              <Button
                mode="outlined"
                onPress={takePhoto}
                style={styles.imageButton}
                icon="camera"
              >
                <Text>Take Photo</Text>
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
            contentStyle={styles.buttonContent}
            icon="close"
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.button, styles.saveButton]}
            loading={isLoading}
            disabled={isLoading}
            contentStyle={styles.buttonContent}
            icon="content-save"
          >
            <Text>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
        </View>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginTop: 35,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
    height: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amenityChip: {
    margin: 4,
    backgroundColor: '#262d47ff',
    borderColor: '#007AFF',
  },
  amenityChipSelected: {
    backgroundColor: '#007AFF',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
    borderColor: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  cancelButton: {
    borderColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonContent: {
    height: 50,
  },
});