import React, { useState } from 'react';
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
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, Card, Chip, IconButton, Switch, Divider, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import BASE_URL from './Config';
import Toast from 'react-native-toast-message';
import api from '../api/api';

export default function AddRoomScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [minMonths, setMinMonths] = useState('1');
  const [roomType, setRoomType] = useState('');
  const [images, setImages] = useState([]);
  const [videoWalkthrough, setVideoWalkthrough] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [amenities, setAmenities] = useState([]);
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
    'Self Contained',
    'Apartment',
    'Single Room',
    'Studio',
    'Bedsitter',
    'Shared Room',
    'Hostel',
    'Other'
  ];

  const availableAmenities = [
    'Wi-Fi', 'Water 24/7', 'Security', 'Parking', 'Furnished', 
    'Electricity', 'Generator', 'Balcony', 'Garden', 'Swimming Pool'
  ];

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

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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

  // Generate thumbnail for video
  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000,
      });
      return uri;
    } catch (e) {
      if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                'Failed to generate thumbnail',
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'info',
                text1: 'Information',
                text2:'Failed to generate thumbnail'
              });
            }

      return null;
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
      if (video.fileSize > 50 * 1024 * 1024) {
        if (Platform.OS === 'android') {
               ToastAndroid.showWithGravity(
                 'File too large,Please select a video smaller than 50MB',
                 ToastAndroid.LONG,
                 ToastAndroid.CENTER
               );
             } else {
               Toast.show({
                 type: 'info',
                 text1: 'Information',
                 text2:'File too large,Please select a video smaller than 50MB'
               });
             }
        return;
      }
      
      setVideoWalkthrough(video.uri);
      
      // Generate and set thumbnail
      const thumbnailUri = await generateThumbnail(video.uri);
      setVideoThumbnail(thumbnailUri);
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
      setVideoWalkthrough(video.uri);
      
      // Generate and set thumbnail
      const thumbnailUri = await generateThumbnail(video.uri);
      setVideoThumbnail(thumbnailUri);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const removeVideo = () => {
    setVideoWalkthrough(null);
    setVideoThumbnail(null);
  };

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
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
          text1: 'Information',
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
          text1: 'Information',
          text2: 'Amenity name can only contain letters and spaces'
        });
      }
      return;
    }

    // Check if amenity already exists (case insensitive)
    const amenityExists = [...availableAmenities, ...amenities].some(
      amenity => amenity.toLowerCase() === newAmenity.trim().toLowerCase()
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
          text1: 'Information',
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
        text1: 'Success',
        text2: 'Amenity added successfully',
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

    if (!title || !price || !location || !roomType || !isPriceValid || !isMinMonthsValid || !isTitleValid || !isLocationValid || !isDescriptionValid|| isNaN(minMonthsNum) || isNaN(priceNum)) {
      if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                'Please fill all fields and ensure there is no errors',
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'info',
                text1: 'Information',
                text2: 'Please fill all fields and ensure there is no errors',
              });
            }
      return;
    }

    if (images.length === 0) {
     if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                'Please add at least one image of the room.',
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'info',
                text1: 'Information',
                text2: 'Please add at least one image of the room.',
              });
            }

      return;
    }

    if (images.length > 8) {
       if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                'Too Many Images,At most 8 images are allowed',
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'info',
                text1: 'Information',
                text2: 'Too Many Images,At most 8 images are allowed',
              });
            }
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", priceNum);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("minMonths", minMonthsNum);
      formData.append("roomType", roomType);
      formData.append("amenities", JSON.stringify(amenities));

      // Append images
      images.forEach((uri, index) => {
        formData.append("images", {
          uri,
          name: `room_${index}.jpg`,
          type: "image/jpeg",
        });
      });

      // Append video if exists
      if (videoWalkthrough) {
        // Extract file extension from URI
        const fileExtension = videoWalkthrough.split('.').pop();
        const mimeType = `video/${fileExtension === 'mp4' ? 'mp4' : 'quicktime'}`;
        
        formData.append("videoWalkthrough", {
          uri: videoWalkthrough,
          name: `walkthrough_${Date.now()}.${fileExtension}`,
          type: mimeType,
        });
      }

      const token = await AsyncStorage.getItem('userToken');
      const response = await api.post(`/api/properties/add`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });

      setIsLoading(false);
      Alert.alert("Success!", "Room added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsLoading(false);
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
                text1: errormessage
              });
            }
    }
  };

  

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
                <View style={[styles.halfInput, { marginHorizontal: 5 }]}>
                <TextInput
                  label="Property Title *"
                  value={title}
                  onChangeText={handleTitleChange}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="home" />}
                  returnKeyType="next"
                  onBlur={()=>validatePropertyTitle(title)}
                  blurOnSubmit={false}
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
                      label="Price Per Month (Tsh) *"
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
                  onBlur={()=>validateLocation(location)}
                  blurOnSubmit={false}
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
                  onBlur={()=>validateDescription(description)}
                  blurOnSubmit={true}
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
                  Add a short video tour (max 2 minutes) to showcase your property
                </Text>

                {videoWalkthrough ? (
                  <View style={styles.videoPreviewContainer}>
                    <View style={styles.videoPreview}>
                      {videoThumbnail ? (
                        <Image 
                          source={{ uri: videoThumbnail }} 
                          style={styles.videoThumbnail}
                        />
                      ) : (
                        <Ionicons name="videocam" size={48} color="#007AFF" />
                      )}
                      <Text style={styles.videoPreviewText}>Video Selected</Text>
                      <Text style={styles.videoPreviewSubtext}>Ready to upload</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeVideoButton}
                      onPress={removeVideo}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                      <Text style={styles.removeVideoText}>Remove</Text>
                    </TouchableOpacity>
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
                      style={styles.amenityChip}
                      selectedColor="#fff"
                      icon={amenities.includes(amenity) ? "check" : "plus"}
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
                        icon="check"
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
              disabled={isLoading }
              contentStyle={styles.buttonContent}
              icon="content-save"
            >
              {/* disable a button if any error exists */}
              {propertyTitleError || locationError || descriptionError || minMonthsError || priceError? (
                
                <Text style={styles.disabledButtonText}>Please fix all errors</Text>
              ) : isLoading ? (
                'Saving...'
              ) : (
                'Save Property'
              )}
            </Button>
          </View>
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
    paddingBottom: 100, // Extra padding to ensure content is scrollable above footer
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  disabledButtonText:{
    color: '#bdc3c7',
    fontSize: 16,
    fontWeight: '600',

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
    marginBottom: 20,
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
  removeVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  removeVideoText: {
    fontSize: 14,
    color: '#e74c3c',
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
    zIndex: 2,
  },
  saveButton: {
    borderRadius: 10,
  },
  buttonContent: {
    height: 50,
  },
  menu: {
    marginTop: 50,
    width: '70%',
  },
});