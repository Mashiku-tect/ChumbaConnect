import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function AddReviewScreen({ navigation, route }) {
  const { propertyId, propertyName, userId } = route.params;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      alert('Please complete all fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Review submitted successfully!');
      navigation.goBack();
    }, 1500);
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

  return (
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
          <Text style={styles.propertyName}>Reviewing: {propertyName || 'Property Name'}</Text>
          
          {renderStars()}

          <TextInput
            label="Review Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
            placeholder="Summarize your experience"
          />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  card: {
    margin: 15,
    borderRadius: 12,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  commentInput: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
});