import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Platform,ToastAndroid,ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Card, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './Config';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';

export default function AddReviewScreen({ navigation, route }) {
  //console.log("Params",route.params)
  const { propertyId, ownerId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [propertyName, setPropertyName] = useState('');
  const [landlordName, setLandlordName] = useState('');

  // Fetch property and landlord data
  useEffect(() => {
  const fetchPropertyAndLandlordData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const propertyResponse = await api.get(
        `/api/getpropertydetails/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const landlordResponse = await api.get(
        `/api/landlord/${ownerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPropertyName(propertyResponse.data.property.PropertyName);
      setLandlordName(landlordResponse.data.landlord.FirstName+landlordResponse.data.landlord.LastName);
    } catch (error) {
      //console.error('Error fetching data:', error);
      const errormessage= error.response?.data?.message || 'Error fetching data';
      //if response status is 404  show toast and go back to previous screen
      if(error.response?.status===404){
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            errormessage,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        }
        else{
          Toast.show({
            type: 'error',
            text1:'Error',
            text2: errormessage,
          });
        }
        navigation.goBack();
        return;
      }
      else{
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            errormessage,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        }
        else{
          Toast.show({
            type: 'error',
            text1:'Error',
            text2: errormessage,
          });
        }
      }
      setPropertyName('Property');
      setLandlordName('Landlord');
    }
    finally{
      setLoading(false);
    }
  };

  fetchPropertyAndLandlordData();
}, [propertyId, ownerId]);

  

 const handleSubmit = async () => {
  if (rating === 0) {
    alert('Please select a rating');
    return;
  }

  if (!comment.trim()) {
    alert('Please write your review');
    return;
  }

  setIsSubmitting(true);

  try {
    const token = await AsyncStorage.getItem("userToken");

    const payload = {
      rating,
      comment,
      OwnerId: ownerId,
      PropertyId: propertyId
    };

   // console.log("Sending review:", payload);

  const response=  await api.post(
      `/api/submitreview`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responsemessage=response.data?.message || "Review submitted successfully";
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        responsemessage,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
    } else {
      Toast.show({
        type: 'success',
        text1:'Success',
        text2: responsemessage,
      });
    }

   // alert("Review submitted successfully!");
    navigation.goBack();
  } catch (error) {
    //console.error("Error submitting review:", error.response?.data || error);
   // alert("Error submitting review.");
   const errormessage= error.response?.data?.message || 'Error submitting review';
   if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        errormessage,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
    else{
      Toast.show({
        type: 'error',
        text1:'Error',
        text2: errormessage,
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.ratingLabel}>Overall Rating</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              icon={star <= rating ? "star" : "star-outline"}
              size={30}
              color={star <= rating ? "#FFD700" : "#bdc3c7"}
              onPress={() => setRating(star)}
            />
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 0 ? 'Select rating' : `${rating}.0 out of 5`}
        </Text>
      </View>
    );
  };

  if(loading){
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar  
          barStyle="dark-content" 
          backgroundColor="#ffffff" 
          translucent={false}
        />
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator size="small" color="#6200ee" />
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
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Write a Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.reviewTitle}>
              Review for {propertyName?? 'ChumbaConnect Property'} owned by {landlordName ?? 'ChumbaConnect Landlord'}
            </Text>
            
            {renderStars()}

            <TextInput
              label="Your Review"
              value={comment}
              onChangeText={setComment}
              style={[styles.input, styles.commentInput]}
              mode="outlined"
              multiline
              numberOfLines={5}
              placeholder="Share details of your experience with this property and landlord..."
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit Review
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 1,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
   
  },
  card: {
    margin: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
    fontWeight: '500',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 5,
    fontWeight: '500',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  commentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 5,
  },
});