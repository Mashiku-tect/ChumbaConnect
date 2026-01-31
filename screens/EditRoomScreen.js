import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  Platform,
  ToastAndroid,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator // Added ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, Card, IconButton, Chip, Divider, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import api from '../api/api';

import BASE_URL from './Config';

export default function EditRoomScreen({ route, navigation }) {
  const { room } = route.params;
  //console.log("Editing room:", room);
  
  // Add initial loading state
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [title, setTitle] = useState(room.title || '');
  const [price, setPrice] = useState(room.price ? room.price.toString() : '');
  const [location, setLocation] = useState(room.location || '');
  const [description, setDescription] = useState(room.description || '');
  const [minMonths, setMinMonths] = useState(room.minMonths ? room.minMonths.toString() : '1');
  const [roomType, setRoomType] = useState(room.roomType || '');
  const [images, setImages] = useState(room.images || []);
  const [videoWalkthrough, setVideoWalkthrough] = useState(room.videoWalkthrough || null);
  const [newVideo, setNewVideo] = useState(null); // For newly selected video
  const [videoThumbnail, setVideoThumbnail] = useState(null); // For video thumbnail
  const [amenities, setAmenities] = useState(room.amenities || []);
  const [isLoading, setIsLoading] = useState(false);
  const [roomTypeMenuVisible, setRoomTypeMenuVisible] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [minMonthsError, setMinMonthsError] = useState('');
  const [propertyTitleError, setPropertyTitleError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [showNewAmenityInput, setShowNewAmenityInput] = useState(false);

  const roomTypes = [
    'Single Room',
    'Self Contained',
    'Apartment',
    'Studio',
    'Bedsitter',
    'Master Bedroom',
    'Shared Room',
    'Hostel',
    'Other'
  ];

  const availableAmenities = [
    'Wi-Fi', 'Water 24/7', 'Security', 'Parking', 'Furnished', 
    'Electricity', 'Generator', 'Balcony', 'Garden', 'Swimming Pool'
  ];

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsScreenLoading(false);
    }, 800); // Show loader for 800ms for smooth transition

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

    return () => clearTimeout(timer);
  }, [navigation]);

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Generate thumbnail for video
  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000,
      });
      return uri;
    } catch (e) {
     // console.warn('Failed to generate thumbnail:', e);
      return null;
    }
  };

   //validate property title contains only letters and spaces
  const validatePropertyTitle = (value) => {
    const titleRegex = /^[A-Za-z\s]+$/;
    if (value && !titleRegex.test(value)) {
      setPropertyTitleError('Title can only contain letters and spaces');
      return false;
    }
    setPropertyTitleError('');
    return true;
  };

  //validate location contains only letters, numbers, spaces, commas and hyphens
  const validateLocation = (value) => {
    const locationRegex = /^[A-Za-z0-9\s\-\,]+$/;
    if (value && !locationRegex.test(value)) {
      setLocationError('Location can only contain letters, numbers, spaces, commas and hyphens');
      return false;
    }
    setLocationError('');
    return true;
  };

  //validate description contains only letters, numbers, spaces, commas and hyphens
  const validateDescription = (value) => {
    const descriptionRegex = /^[A-Za-z0-9\s\-\,\.\!\?\(\)]+$/;
    if (value && !descriptionRegex.test(value)) {
      setDescriptionError('Description can only contain letters, numbers, spaces, commas and hyphens');
      return false;
    }
    setDescriptionError('');
    return true;
  };

  // Price validation
  const validatePrice = (value) => {
    if (!value.trim()) {
      setPriceError('Price is required');
      return false;
    }
    
    // Check if it's a valid number (float or integer)
    const priceValue = parseFloat(value);
    if (isNaN(priceValue)) {
      setPriceError('Please enter a valid number');
      return false;
    }
    
    // Check if positive
    if (priceValue <= 0) {
      setPriceError('Price must be greater than 0');
      return false;
    }
    
    // Check for reasonable maximum (e.g., 50,000,000 Tsh)
    if (priceValue > 50000000) {
      setPriceError('Price seems too high. Maximum is 50,000,000 Tsh');
      return false;
    }
    
    // Check for decimal places (max 2)
    const decimalParts = value.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
      setPriceError('Maximum 2 decimal places allowed');
      return false;
    }
    
    setPriceError('');
    return true;
  };

  // Minimum months validation
  const validateMinMonths = (value) => {
    if (!value.trim()) {
      setMinMonthsError('Minimum months is required');
      return false;
    }
    
    // Check if it's a valid integer
    const monthsValue = parseInt(value);
    if (isNaN(monthsValue) || !Number.isInteger(monthsValue)) {
      setMinMonthsError('Please enter a whole number');
      return false;
    }
    
    // Check if positive
    if (monthsValue <= 0) {
      setMinMonthsError('Minimum months must be at least 1');
      return false;
    }
    
    // Check reasonable maximum (24 months)
    if (monthsValue > 24) {
      setMinMonthsError('Maximum allowed is 24 months');
      return false;
    }
    
    setMinMonthsError('');
    return true;
  };

  const handlePriceChange = (text) => {
    // Allow only numbers and one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (cleanedText.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setPrice(cleanedText);
      // Clear error when user starts typing
      if (priceError && cleanedText) {
        validatePrice(cleanedText);
      }
    }
  };

  const handleMinMonthsChange = (text) => {
    // Allow only numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    setMinMonths(cleanedText);
    // Clear error when user starts typing
    if (minMonthsError && cleanedText) {
      validateMinMonths(cleanedText);
    }
  };

    //handle title change
  const handleTitleChange = (text) => {
    setTitle(text);
    // Clear error when user starts typing
    if (propertyTitleError && text) {
      validatePropertyTitle(text);
    }
  };

  //handle location change
  const handleLocationChange = (text) => {
    setLocation(text);
    // Clear error when user starts typing
    if (locationError && text) {
      validateLocation(text);
    }
  };

  //handle description change
  const handleDescriptionChange = (text) => {
    setDescription(text);
    // Clear error when user starts typing
    if (descriptionError && text) {
      validateDescription(text);
    }
  };

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

  // Pick video walkthrough
  const pickVideo = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to select a video.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      videoMaxDuration: 120, // 2 minutes maximum
    });

    if (!result.canceled) {
      const video = result.assets[0];
      // Check file size (max 50MB)
      if (video.fileSize > 100 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select a video smaller than 50MB.');
        return;
      }
      setNewVideo(video.uri);
      
      // Generate and set thumbnail for new video
      const thumbnailUri = await generateThumbnail(video.uri);
      setVideoThumbnail(thumbnailUri);
    }
  };

  // Record video with camera
  const recordVideo = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to record a video.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      videoMaxDuration: 120, // 2 minutes maximum
    });

    if (!result.canceled) {
      const video = result.assets[0];
      setNewVideo(video.uri);
      
      // Generate and set thumbnail for recorded video
      const thumbnailUri = await generateThumbnail(video.uri);
      setVideoThumbnail(thumbnailUri);
    }
  };

  // Remove current video
  const removeVideo = () => {
    Alert.alert(
      "Remove Video Walkthrough",
      "Are you sure you want to remove the video walkthrough?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => {
            setVideoWalkthrough(null);
            setNewVideo(null);
            setVideoThumbnail(null);
          }
        }
      ]
    );
  };

  // Remove new video (before saving)
  const removeNewVideo = () => {
    setNewVideo(null);
    setVideoThumbnail(null);
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
  const currentAmenities = Array.isArray(amenities) ? amenities : [];

  if (currentAmenities.includes(amenity)) {
    setAmenities(currentAmenities.filter(a => a !== amenity));
  } else {
    setAmenities([...currentAmenities, amenity]);
  }
};

  const selectRoomType = (type) => {
    setRoomType(type);
    setRoomTypeMenuVisible(false);
  };

  // Add new custom amenity
  const addCustomAmenity = () => {
    if (newAmenity.trim() === '') {
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Please enter an amenity name',
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'info',
          text1:'Information',
          text2: 'Please enter an amenity name'
        });
      }
      return;
    }

    //check if amenity name is only letters and spaces
    const amenityNameRegex = /^[A-Za-z\s]+$/;
    if (!amenityNameRegex.test(newAmenity.trim())) {
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Amenity name can only contain letters and spaces',
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'info',
          text1:'Information',
          text2: 'Amenity name can only contain letters and spaces'
        });
      }
      return;
    }

    // Check if amenity already exists (case insensitive)
    const amenityExists = [
  ...(Array.isArray(availableAmenities) ? availableAmenities : []),
  ...(Array.isArray(amenities) ? amenities : [])
].some(
  amenity => typeof amenity === 'string' && amenity.toLowerCase() === (newAmenity?.trim() ?? '').toLowerCase()
);

    if (amenityExists) {
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'This amenity already exists',
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Toast.show({
          type: 'info',
          text1:'Information',
          text2: 'This amenity already exists'
        });
      }
      return;
    }

    // Add the new amenity to selected amenities
    setAmenities([...amenities, newAmenity.trim()]);
    setNewAmenity('');
    setShowNewAmenityInput(false);
    
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        'Amenity added successfully',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } else {
      Toast.show({
        type: 'success',
        text1:'Success',
        text2: 'Amenity added successfully'
      });
    }
  };

  const cancelAddAmenity = () => {
    setNewAmenity('');
    setShowNewAmenityInput(false);
    Keyboard.dismiss();
  };

  const handleSave = async () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    // Validate all fields before saving
    const isPriceValid = validatePrice(price);
    const isMinMonthsValid = validateMinMonths(minMonths);
    const isTitleValid = validatePropertyTitle(title);
    const isLocationValid = validateLocation(location);
    const isDescriptionValid = validateDescription(description);
    const minMonthsNum = parseInt(minMonths);
    const priceNum = parseFloat(price);

    if (!title || !price || !location || !roomType || !isPriceValid || !isMinMonthsValid || !isTitleValid || !isLocationValid || !isDescriptionValid || isNaN(minMonthsNum) || isNaN(priceNum)) {
      if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                'Please fix all validation errors before saving',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'error',
                text1:'Error',
                text2: 'Please fix all validation errors before saving'
              });
            }
      return;
    }

    if(images.length === 0){
      if (Platform.OS === 'android') {
             ToastAndroid.showWithGravity(
               'Upload At least One Image Of The Property',
               ToastAndroid.SHORT,
               ToastAndroid.CENTER
             );
           } else {
             Toast.show({
               type: 'info',
               text1:'Information',
               text2: 'Upload At least One Image Of The Property'
             });
           }
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Separate existing vs new images
      const existingImagePaths = (Array.isArray(images) ? images : []).filter(
  img => typeof img === 'string' && !img.startsWith('file://')
);

const newImageURIs = (Array.isArray(images) ? images : []).filter(
  img => typeof img === 'string' && img.startsWith('file://')
);

      formData.append('title', title);
      formData.append('price', priceNum);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('minMonths', minMonthsNum);
      formData.append('roomType', roomType);
      formData.append('amenities', JSON.stringify(amenities));
      formData.append('existingImages', JSON.stringify(existingImagePaths));

      // Handle video walkthrough
      if (newVideo) {
        // User selected a new video - upload it
        const fileExtension = newVideo.split('.').pop();
        const mimeType = `video/${fileExtension === 'mp4' ? 'mp4' : 'quicktime'}`;
        
        formData.append('videoWalkthrough', {
          uri: newVideo,
          name: `walkthrough_${Date.now()}.${fileExtension}`,
          type: mimeType,
        });
        formData.append('videoAction', 'update'); // Indicate we're updating the video
      } else if (videoWalkthrough === null) {
        // User removed the existing video
        formData.append('videoAction', 'remove');
      } else {
        // Keep existing video
        formData.append('videoAction', 'keep');
      }

      // Add new images
      newImageURIs.forEach((uri, index) => {
        formData.append('images', {
          uri,
          name: `newImage-${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      const token = await AsyncStorage.getItem('userToken');
   const response=   await api.put(`/api/properties/update/${room.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

       if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                response?.data?.message,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'success',
                text1:'Success',
                text2: response?.data?.message
              });
            }
      navigation.goBack();
    } catch (error) {
      let errormessage;
      
            // Network error (no internet, server down, timeout)
            if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
              errormessage = 'Unable to connect. Please check your internet connection or try again later.';
            }
      
            // Server did not respond (request sent, no response)
            else if (error.request && !error.response) {
              errormessage = 'Server is not responding. Please try again later.';
            }
      
            // Backend responded with an error
            else if (error.response) {
              errormessage =
                error.response.data?.message || // safe access
                "Something went wrong on the server.";
            }
      
            // Unknown error
            else {
              errormessage = 'Something went wrong. Please try again.';
            }
      
            // Show toast
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                errormessage,
                ToastAndroid.LONG,
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
      setIsLoading(false);
    }
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
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await api.delete(`/api/properties/delete/${room.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert("Success", "Property deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete property');
            }
          }
        }
      ]
    );
  };

  const getCurrentVideoDisplay = () => {
    if (newVideo) {
      return { type: 'new', uri: newVideo, thumbnail: videoThumbnail };
    } else if (videoWalkthrough) {
      return { type: 'existing', uri: `${BASE_URL}/${videoWalkthrough}`, thumbnail: null };
    }
    return null;
  };

  const currentVideo = getCurrentVideoDisplay();

  // Render loading screen
  if (isScreenLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Background touchable layer for dismissing keyboard */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.keyboardDismissArea} />
        </TouchableWithoutFeedback>
        
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={dismissKeyboard}
          >
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <View style={[styles.halfInput, { marginHorizontal: 5 }]}>
                <TextInput
                  label="Property Title *"
                  value={title}
                  onChangeText={handleTitleChange}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="home" />}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onBlur={()=>validatePropertyTitle(title)}
                  error={!!propertyTitleError}
                />
                {propertyTitleError ? (
                                    <View style={styles.errorContainer}>
                                      <Ionicons name="close-circle" size={14} color="#e74c3c" />
                                      <Text style={styles.errorText}>{propertyTitleError}</Text>
                                    </View>
                                  ) : null}
                </View>

                <View style={styles.row}>
                  <View style={[styles.halfInput, { marginHorizontal: 5 }]}>
                    <TextInput
                      label="Price (Tsh) *"
                      value={price}
                      onChangeText={handlePriceChange}
                      keyboardType="numeric"
                      style={styles.input}
                      mode="outlined"
                      error={!!priceError}
                      left={<TextInput.Icon icon="cash" />}
                      onBlur={() => validatePrice(price)}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    {priceError ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="close-circle" size={14} color="#e74c3c" />
                        <Text style={styles.errorText}>{priceError}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={[styles.halfInput, { marginHorizontal: 5 }]}>
                    <TextInput
                      label="Minimum Months *"
                      value={minMonths}
                      onChangeText={handleMinMonthsChange}
                      keyboardType="numeric"
                      style={styles.input}
                      mode="outlined"
                      error={!!minMonthsError}
                      left={<TextInput.Icon icon="calendar" />}
                      onBlur={() => validateMinMonths(minMonths)}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    {minMonthsError ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="close-circle" size={14} color="#e74c3c" />
                        <Text style={styles.errorText}>{minMonthsError}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.row}>
                  <TextInput
                    label="Room Type *"
                    value={roomType}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    editable={false}
                    left={<TextInput.Icon icon="door" />}
                  />
                  <Menu
                    visible={roomTypeMenuVisible}
                    onDismiss={() => setRoomTypeMenuVisible(false)}
                    anchor={
                      <Button 
                        mode="outlined" 
                        onPress={() => setRoomTypeMenuVisible(true)}
                        style={[styles.halfInput, { marginLeft: 5, justifyContent: 'center' }]}
                        icon="menu-down"
                      >
                        Select Type
                      </Button>
                    }
                    style={styles.menu}
                  >
                    {roomTypes.map((type, index) => (
                      <Menu.Item 
                        key={index} 
                        onPress={() => selectRoomType(type)} 
                        title={type}
                      />
                    ))}
                  </Menu>
                </View>

                <View style={[styles.halfInput, { marginHorizontal: 5 }]}>
                <TextInput
                  label="Location *"
                  value={location}
                  onChangeText={handleLocationChange}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="map-marker" />}
                  returnKeyType="next"
                  blurOnSubmit={false}
                   onBlur={()=>validateLocation(location)}
                   error={!!locationError}
                />
                {locationError ? (
                                    <View style={styles.errorContainer}>
                                      <Ionicons name="close-circle" size={14} color="#e74c3c" />
                                      <Text style={styles.errorText}>{locationError}</Text>
                                    </View>
                                  ) : null}
                </View>

<View style={[styles.halfInput, { marginHorizontal: 5 }]}>
                <TextInput
                  label="Description"
                  value={description}
                  onChangeText={handleDescriptionChange}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  left={<TextInput.Icon icon="text" />}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onBlur={()=>validateDescription(description)}
                  error={!!descriptionError}
                />
                 {descriptionError ? (
                                    <View style={styles.errorContainer}>
                                      <Ionicons name="close-circle" size={14} color="#e74c3c" />
                                      <Text style={styles.errorText}>{descriptionError}</Text>
                                    </View>
                                  ) : null}
                </View>

                <Divider style={styles.divider} />

                {/* Video Walkthrough Section */}
                <Text style={styles.sectionTitle}>Video Walkthrough (Optional)</Text>
                <Text style={styles.sectionSubtitle}>
                  {currentVideo ? 
                    "Current video walkthrough. You can replace it or remove it." : 
                    "Add a short video tour (max 2 minutes) to showcase your property"
                  }
                </Text>

                {currentVideo ? (
                  <View style={styles.videoPreviewContainer}>
                    <View style={styles.videoPreview}>
                      {currentVideo.thumbnail ? (
                        <Image 
                          source={{ uri: currentVideo.thumbnail }} 
                          style={styles.videoThumbnail}
                        />
                      ) : (
                        <Ionicons name="videocam" size={48} color="#007AFF" />
                      )}
                      <Text style={styles.videoPreviewText}>
                        {currentVideo.type === 'new' ? 'New Video Selected' : 'Current Video Walkthrough'}
                      </Text>
                      <Text style={styles.videoPreviewSubtext}>
                        {currentVideo.type === 'new' ? 'Ready to upload' : 'Currently active'}
                      </Text>
                    </View>
                    <View style={styles.videoActionButtons}>
                      <TouchableOpacity 
                        style={styles.removeVideoButton}
                        onPress={currentVideo.type === 'new' ? removeNewVideo : removeVideo}
                      >
                        <Ionicons name="close-circle" size={24} color="#e74c3c" />
                        <Text style={styles.removeVideoText}>
                          {currentVideo.type === 'new' ? 'Remove New Video' : 'Remove Video'}
                        </Text>
                      </TouchableOpacity>
                      {currentVideo.type === 'existing' && (
                        <TouchableOpacity 
                          style={styles.replaceVideoButton}
                          onPress={pickVideo}
                        >
                          <Ionicons name="refresh" size={24} color="#007AFF" />
                          <Text style={styles.replaceVideoText}>Replace Video</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.videoButtons}>
                    <Button
                      mode="outlined"
                      onPress={pickVideo}
                      style={styles.videoButton}
                      icon="video"
                      contentStyle={styles.videoButtonContent}
                    >
                      Choose Video
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={recordVideo}
                      style={styles.videoButton}
                      icon="camera"
                      contentStyle={styles.videoButtonContent}
                    >
                      Record Video
                    </Button>
                  </View>
                )}

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Amenities</Text>
                <Text style={styles.sectionSubtitle}>
                  Select from available amenities or add your own
                </Text>

                {/* Custom Amenity Input */}
                {showNewAmenityInput ? (
                  <View style={styles.customAmenityContainer}>
                    <TextInput
                      label="New Amenity"
                      value={newAmenity}
                      onChangeText={setNewAmenity}
                      style={styles.input}
                      mode="outlined"
                      autoFocus
                      left={<TextInput.Icon icon="plus" />}
                      placeholder="Enter custom amenity"
                      returnKeyType="done"
                      onSubmitEditing={addCustomAmenity}
                      blurOnSubmit={true}
                    />
                    <View style={styles.amenityActions}>
                      <Button
                        mode="contained"
                        onPress={addCustomAmenity}
                        style={[styles.amenityActionButton, styles.addButton]}
                        compact
                      >
                        Add
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={cancelAddAmenity}
                        style={[styles.amenityActionButton, styles.cancelButton]}
                        compact
                      >
                        Cancel
                      </Button>
                    </View>
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => setShowNewAmenityInput(true)}
                    style={styles.addCustomButton}
                    icon="plus"
                    contentStyle={styles.addCustomButtonContent}
                  >
                    Add Custom Amenity
                  </Button>
                )}

                {/* Available Amenities */}
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
                      {amenity}
                    </Chip>
                  ))}
                  
                  {/* Custom Amenities (ones not in availableAmenities) */}
                  {amenities
                    .filter(amenity => !availableAmenities.includes(amenity))
                    .map((amenity, index) => (
                      <Chip
                        key={`custom-${index}`}
                        selected={true}
                        onPress={() => toggleAmenity(amenity)}
                        style={[styles.amenityChip, styles.customAmenityChip]}
                        selectedColor="#fff"
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

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={[styles.button, styles.cancelButton]}
                contentStyle={styles.buttonContent}
                icon="close"
              >
                Cancel
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
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardDismissArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  scrollContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
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
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
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
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 5,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  // Video Section Styles
  videoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  videoPreview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginBottom: 10,
    width: '100%',
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoPreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 8,
  },
  videoPreviewSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  videoActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  removeVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 10,
  },
  removeVideoText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 4,
  },
  replaceVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 10,
  },
  replaceVideoText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  videoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  videoButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  videoButtonContent: {
    height: 50,
  },
  // Amenities Section
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
  customAmenityChip: {
    backgroundColor: '#27ae60', // Different color for custom amenities
  },
  customAmenityContainer: {
    marginBottom: 15,
  },
  amenityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  amenityActionButton: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    borderColor: '#95a5a6',
  },
  addCustomButton: {
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#3498db',
  },
  addCustomButtonContent: {
    height: 44,
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
  menu: {
    marginTop: 50,
    width: '70%',
  },
});