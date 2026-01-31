import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, StatusBar, ToastAndroid } from 'react-native';
import { Text, Card, Avatar, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from 'react-native-safe-area-context';
import BASE_URL from './Config';
//import Toast from 'react-native-toast-message';
import api from '../api/api';

export default function LandlordReviewsScreen({ navigation, route }) {
  const { landlordId, landlordName } = route.params || {};
  //console.log("Landlord Id",landlordId)
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");

      const response = await api.get(
        `/api/landlord/reviews/${landlordId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviews(response.data.reviews || []);
      setLoading(false);

    } catch (error) {
     // console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (landlordId) {
      fetchReviews();
    }
  }, [landlordId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color={star <= rating ? "#FFD700" : "#bdc3c7"}
          />
        ))}
      </View>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6200ee" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Reviews for {landlordName || 'ChumbaConnect Landlord'}
          </Text>
          <Text style={styles.reviewCount}>
           {(reviews?.length ?? 0)} review{(reviews?.length ?? 0) !== 1 ? 's' : ''}

          </Text>
        </View>

        {reviews.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No reviews yet</Text>
              <Text style={styles.emptySubtext}>
                Once Reviews are submitted for this landlord, they will appear here.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          reviews.map((review, index) => (
            <Card key={review.id} style={styles.reviewCard}>
              <Card.Content>
                {/* Review Header */}
                <View style={styles.reviewHeader}>
                  <View style={styles.userInfo}>
                    <Avatar.Text 
                      size={40} 
                      label={review.userName.split(' ').map(n => n[0]).join('')}
                      style={styles.avatar}
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{review.userName}</Text>
                      <Text style={styles.userPhone}>{review.userPhone}</Text>
                    </View>
                  </View>
                  <Chip 
                    mode="outlined"
                    textStyle={styles.ratingChipText}
                    style={[styles.ratingChip, { borderColor: getRatingColor(review.rating) }]}
                  >
                    {review.rating}.0
                  </Chip>
                </View>

                {/* Rating Stars */}
                {renderStars(review.rating)}

                {/* Property Name */}
                <Text style={styles.propertyName}>
                  Property: {review.propertyName}
                </Text>

                {/* Review Comment */}
                <Text style={styles.comment}>
                  {review.comment}
                </Text>

                {/* Review Date */}
                <Text style={styles.date}>
                  {formatDate(review.createdAt)}
                </Text>

                {/* Divider (except for last item) */}
                {index < reviews.length - 1 && <Divider style={styles.divider} />}
              </Card.Content>
            </Card>
          ))
        )}
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
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 5,
  },
  reviewCount: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  reviewCard: {
    margin: 15,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
  },
  emptyCard: {
    margin: 20,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
    textAlign: 'center',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  ratingChip: {
    backgroundColor: 'transparent',
  },
  ratingChipText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#800080',
    marginBottom: 10,
  },
  comment: {
    fontSize: 15,
    lineHeight: 20,
    color: '#2c3e50',
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  divider: {
    marginTop: 15,
    marginBottom: 5,
  },
});