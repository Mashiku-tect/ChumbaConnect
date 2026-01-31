import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Text,
  Divider,
  Provider as PaperProvider,
  IconButton,
  List,
  Avatar,
  useTheme,
  Surface,
  Chip,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const contactSupport = () => {
    Linking.openURL('mailto:mashikuallen@gmail.com?subject=App Support');
  };

  const rateApp = () => {
    if (Platform.OS === 'ios') {
      openLink('https://apps.apple.com/app/idYOUR_APP_ID');
    } else {
      openLink('https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME');
    }
  };

  const teamMembers = [
    {
      name: 'Allen Mashiku',
      role: 'Founder & CEO',
      avatar: '👨‍💼',
      color: '#4A6FA5',
    },
    {
      name: 'Eppie Mawazo',
      role: 'UX Designer',
      avatar: '👩‍🎨',
      color: '#E76F51',
    },
  ];

  const features = [
    { name: 'Find perfect rooms', icon: 'home-search', color: '#4A6FA5' },
    { name: 'Secure booking', icon: 'shield-check', color: '#2A9D8F' },
    { name: 'Real-time notifications', icon: 'bell', color: '#E9C46A' },
    { name: 'Review system', icon: 'star', color: '#F4A261' },
    { name: 'Location search', icon: 'map-marker', color: '#E76F51' },
    { name: 'Secure payments', icon: 'credit-card', color: '#9D4EDD' },
  ];

  const appStats = [
    { label: 'Users', value: '10K+', color: '#4A6FA5' },
    { label: 'Rooms', value: '5K+', color: '#2A9D8F' },
    { label: 'Cities', value: '50+', color: '#E9C46A' },
    { label: 'Rating', value: '4.8', color: '#F4A261' },
  ];

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={['#4A6FA5', '#2A9D8F']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Avatar.Text 
                size={100} 
                label="CC" 
                style={styles.appIcon}
                labelStyle={styles.appIconLabel}
              />
              <Text variant="displaySmall" style={styles.appName}>
                ChumbaConnect
              </Text>
              <Text variant="titleMedium" style={styles.tagline}>
                Connecting People To Their Next Rooms
              </Text>
              <Chip 
                mode="outlined" 
                style={styles.versionChip}
                textStyle={styles.versionText}
              >
                v1.0.0 • {Platform.OS === 'ios' ? 'iOS' : 'Android'}
              </Chip>
            </View>
          </LinearGradient>

          {/* Stats Section */}
          <Surface style={styles.statsSurface} elevation={1}>
            <View style={styles.statsGrid}>
              {appStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text variant="headlineMedium" style={[styles.statValue, { color: stat.color }]}>
                    {stat.value}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>

          {/* Mission Section */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={40} icon="target" style={[styles.sectionIcon, { backgroundColor: '#4A6FA520' }]} color="#4A6FA5" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Our Mission
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.sectionText}>
                ChumbaConnect is committed to making the room-finding experience simple, secure, and stress-free for everyone. We believe that every person deserves a comfortable, safe, and affordable place to call home.
              </Text>
            </Card.Content>
          </Card>

          {/* Features Section */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={40} icon="playlist-play" style={[styles.sectionIcon, { backgroundColor: '#2A9D8F20' }]} color="#2A9D8F" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Key Features
                </Text>
              </View>
              <View style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureCard}>
                    <Avatar.Icon 
                      size={50} 
                      icon={feature.icon} 
                      style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}
                      color={feature.color}
                    />
                    <Text variant="bodyMedium" style={styles.featureText}>
                      {feature.name}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Team Section */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={40} icon="account-group" style={[styles.sectionIcon, { backgroundColor: '#E76F5120' }]} color="#E76F51" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Our Team
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.sectionText}>
                ChumbaConnect is built by a passionate team dedicated to improving room finding processes. Meet the people behind the app:
              </Text>
              
              <View style={styles.teamGrid}>
                {teamMembers.map((member, index) => (
                  <Card key={index} style={styles.memberCard} mode="contained">
                    <Card.Content style={styles.memberContent}>
                      <Avatar.Text 
                        size={80} 
                        label={member.avatar} 
                        style={[styles.memberAvatar, { backgroundColor: member.color }]}
                        labelStyle={styles.memberAvatarLabel}
                      />
                      <Text variant="titleSmall" style={styles.memberName}>
                        {member.name}
                      </Text>
                      <Badge style={[styles.memberBadge, { backgroundColor: member.color }]}>
                        {member.role}
                      </Badge>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Contact & Links Section */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={40} icon="headset" style={[styles.sectionIcon, { backgroundColor: '#9D4EDD20' }]} color="#9D4EDD" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Contact & Support
                </Text>
              </View>
              
              <List.Section>
                <List.Item
                  title="Email Support"
                  description="Get help with any issues"
                  left={props => <List.Icon {...props} icon="email" color="#4A6FA5" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={contactSupport}
                  style={styles.listItem}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                />
                <Divider />
                <List.Item
                  title="Rate Our App"
                  description="Share your experience"
                  left={props => <List.Icon {...props} icon="star" color="#FFB800" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={rateApp}
                  style={styles.listItem}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                />
                <Divider />
                <List.Item
                  title="Privacy Policy"
                  description="How we protect your data"
                  left={props => <List.Icon {...props} icon="shield-check" color="#2A9D8F" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => openLink('https://chumbaconnect.com/privacy')}
                  style={styles.listItem}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                />
                <Divider />
                <List.Item
                  title="Terms of Service"
                  description="App usage guidelines"
                  left={props => <List.Icon {...props} icon="file-document" color="#E76F51" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => openLink('https://chumbaconnect.com/terms')}
                  style={styles.listItem}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                />
              </List.Section>
            </Card.Content>
          </Card>

          {/* Social Links */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={40} icon="share-variant" style={[styles.sectionIcon, { backgroundColor: '#1DA1F220' }]} color="#1DA1F2" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Follow Us
                </Text>
              </View>
              <View style={styles.socialLinks}>
                {[
                  { icon: 'facebook', color: '#1877F2', link: 'https://www.facebook.com/Mashiku-Tech' },
                  { icon: 'twitter', color: '#1DA1F2', link: 'https://x.com/MashikuAllen' },
                  { icon: 'instagram', color: '#E4405F', link: 'https://www.instagram.com/__michael__mark/?hl=en' },
                  { icon: 'linkedin', color: '#0A66C2', link: 'https://www.linkedin.com/in/allen-mashiku-9b65592b3/' },
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    icon={social.icon}
                    iconColor="#fff"
                    size={28}
                    onPress={() => openLink(social.link)}
                    style={[styles.socialButton, { backgroundColor: social.color }]}
                  />
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* App Info */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={40} icon="information" style={[styles.sectionIcon, { backgroundColor: '#66666620' }]} color="#666" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  App Information
                </Text>
              </View>
              <View style={styles.infoGrid}>
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Build Number', value: '1001001' },
                  { label: 'Last Updated', value: `${month} ${year}` },
                  { label: 'Storage', value: '45 MB' },
                  { label: 'Developer', value: 'Mashiku Tech' },
                  { label: 'Min. OS', value: Platform.OS === 'ios' ? 'iOS 13+' : 'Android 8+' },
                ].map((info, index) => (
                  <View key={index} style={styles.infoRow}>
                    <Text variant="bodyMedium" style={styles.infoLabel}>
                      {info.label}
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {info.value}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Footer */}
          <Surface style={styles.footer} elevation={0}>
            <Avatar.Icon 
              size={60} 
              icon="heart" 
              style={[styles.heartIcon, { backgroundColor: '#E76F5120' }]}
              color="#E76F51"
            />
            <Text variant="bodyLarge" style={styles.madeWith}>
              Made with ❤️ for everyone
            </Text>
            <Text variant="bodySmall" style={styles.copyright}>
              © {new Date().getFullYear()} ChumbaConnect. All rights reserved.
            </Text>
          </Surface>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A6FA5', // Header gradient color for status bar area
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50, // Extra padding for status bar
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appIconLabel: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  appName: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  versionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  versionText: {
    color: '#fff',
    fontSize: 12,
  },
  statsSurface: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sectionText: {
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    marginBottom: 10,
    borderRadius: 15,
  },
  featureText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  teamGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  memberCard: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  memberContent: {
    alignItems: 'center',
    padding: 16,
  },
  memberAvatar: {
    marginBottom: 12,
  },
  memberAvatarLabel: {
    fontSize: 32,
  },
  memberName: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  memberBadge: {
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#fff',
  },
  listItem: {
    paddingLeft: 0,
    paddingVertical: 12,
  },
  listTitle: {
    fontWeight: '600',
    color: '#333',
  },
  listDescription: {
    color: '#666',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    marginHorizontal: 8,
    borderRadius: 12,
  },
  infoGrid: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 50,
  },
  heartIcon: {
    backgroundColor: 'rgba(231, 111, 81, 0.1)',
    marginBottom: 16,
  },
  madeWith: {
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  copyright: {
    color: '#999',
    textAlign: 'center',
  },
});