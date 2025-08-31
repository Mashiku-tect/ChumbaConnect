import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Avatar, IconButton, Switch, Divider, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const userData = {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    phone: '+255 712 345 678',
    role: 'Landlord',
    joinedDate: 'October 2023',
    propertiesListed: 3,
    totalViews: 137,
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/300',
  };

  const menuItems = [
    { icon: 'shield-account', label: 'Privacy & Security', onPress: () => console.log('Privacy pressed') },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => console.log('Help pressed') },
    { icon: 'information', label: 'About ChumbaConnect', onPress: () => console.log('About pressed') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header with background */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Profile</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  />
                }
              >
                <Menu.Item onPress={() => { setMenuVisible(false); console.log('Share profile') }} title="Share Profile" />
                <Menu.Item onPress={() => { setMenuVisible(false); console.log('Report issue') }} title="Report Issue" />
              </Menu>
            </View>

            <View style={styles.profileSection}>
              <Avatar.Image 
                size={100} 
                source={{ uri: userData.avatar }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
              </View>
              
              <Text style={styles.name}>{userData.name}</Text>
              <Text style={styles.email}>{userData.email}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.propertiesListed}</Text>
                  <Text style={styles.statLabel}>Properties</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.totalViews}</Text>
                  <Text style={styles.statLabel}>Views</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color="#007AFF" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{userData.phone}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="briefcase" size={20} color="#007AFF" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{userData.role}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color="#007AFF" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{userData.joinedDate}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="notifications" size={20} color="#007AFF" style={styles.preferenceIcon} />
                <View>
                  <Text style={styles.preferenceLabel}>Notifications</Text>
                  <Text style={styles.preferenceDescription}>Receive alerts and updates</Text>
                </View>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                color="#007AFF"
              />
            </View>

            <Divider style={styles.preferenceDivider} />

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="moon" size={20} color="#007AFF" style={styles.preferenceIcon} />
                <View>
                  <Text style={styles.preferenceLabel}>Dark Mode</Text>
                  <Text style={styles.preferenceDescription}>Switch to dark theme</Text>
                </View>
              </View>
              <Switch
                value={isDarkModeEnabled}
                onValueChange={() => setIsDarkModeEnabled(!isDarkModeEnabled)}
                color="#007AFF"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Additional Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>More Options</Text>
            
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={22} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => navigation.navigate("EditProfile")}
            contentStyle={styles.buttonContent}
            icon="account-edit"
          >
            Edit Profile
          </Button>
          
          <Button
            mode="outlined"
            style={[styles.actionButton, styles.logoutButton]}
            onPress={() => navigation.replace("Login")}
            contentStyle={styles.buttonContent}
            icon="logout"
          >
            Logout
          </Button>
        </View>

        <Text style={styles.versionText}>ChumbaConnect v1.0.0</Text>
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
  },
  headerBackground: {
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
  },
  headerContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    margin: 0,
  },
  profileSection: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    marginRight: 15,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  preferenceDivider: {
    marginVertical: 5,
    backgroundColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  actions: {
    padding: 20,
    paddingBottom: 30,
  },
  actionButton: {
    borderRadius: 10,
    marginBottom: 15,
  },
  logoutButton: {
    borderColor: '#e74c3c',
  },
  buttonContent: {
    height: 50,
  },
  versionText: {
    textAlign: 'center',
    color: '#bdc3c7',
    marginBottom: 20,
    fontSize: 12,
  },
});