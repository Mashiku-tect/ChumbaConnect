import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Avatar, Text, IconButton, Switch, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [phone, setPhone] = useState("+255 700 123 456");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pick profile image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (password && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar.Image 
              size={120} 
              source={image ? { uri: image } : { uri: 'https://i.pravatar.cc/300' }} 
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageButtons}>
            <Button
              mode="outlined"
              onPress={pickImage}
              style={styles.imageButton}
              icon="image"
            >
              Choose Photo
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
        </View>

        <Divider style={styles.divider} />

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TextInput
          label="Full Name"
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
          label="Email Address"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Phone Number"
          mode="outlined"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
          left={<TextInput.Icon icon="phone" />}
        />

        <Divider style={styles.divider} />

        {/* Password Change */}
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>
        
        <TextInput
          label="New Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <TextInput
          label="Confirm New Password"
          mode="outlined"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          left={<TextInput.Icon icon="lock-check" />}
          right={
            <TextInput.Icon 
              icon={showConfirmPassword ? "eye-off" : "eye"} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
        />

        {password && password !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        {password && password.length > 0 && password.length < 6 && (
          <Text style={styles.errorText}>Password must be at least 6 characters</Text>
        )}

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password must include:</Text>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
              size={14} 
              color={password.length >= 6 ? "#2ecc71" : "#7f8c8d"} 
            />
            <Text style={styles.requirementText}>At least 6 characters</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isLoading}
            disabled={isLoading}
            contentStyle={styles.buttonContent}
            icon="content-save"
          >
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            icon="close"
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 5,
  },
  passwordRequirements: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    marginLeft: 8,
    color: '#7f8c8d',
    fontSize: 12,
  },
  actions: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    borderRadius: 10,
    marginBottom: 15,
  },
  cancelButton: {
    borderRadius: 10,
    borderColor: '#95a5a6',
  },
  buttonContent: {
    height: 50,
  },
});