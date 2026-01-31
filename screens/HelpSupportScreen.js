import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Linking,
  Alert,
    TouchableOpacity,
    ActivityIndicator
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  List,
  Text,
  Button,
  Divider,
  useTheme,
  Searchbar,
  Chip,
  Avatar,
  IconButton,
  Modal,
  Portal,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const HelpSupportScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleOpenURL = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while opening the link');
    }
  };

  const categories = [
    { id: 'all', label: 'All Topics', icon: 'grid' },
    { id: 'account', label: 'Account', icon: 'account' },
    { id: 'booking', label: 'Booking', icon: 'calendar-check' },
    { id: 'payment', label: 'Payment', icon: 'credit-card' },
    { id: 'safety', label: 'Safety', icon: 'shield-check' },
    { id: 'technical', label: 'Technical', icon: 'tools' },
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I create an account?',
      answer: 'To create an account, tap on the "Sign Up" button on the login screen. You can register using your email address or phone number. You will receive a verification email to complete the registration.',
      category: 'account',
    },
    {
      id: 2,
      question: 'How do I book a room?',
      answer: 'Browse available rooms, select view details button to view more details of that room,On the View Details Screen click request to send a rental request to the landlord,once the landlord approves your request You will get a notification,You can then proceed to create a lease with the landlord and pay for the room to secure it ',
      category: 'booking',
    },
    {
      id: 3,
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including  mobile money (Airtel Money,Halopesa and Mixx By Yas). All payments are processed securely.',
      category: 'payment',
    },
    {
      id: 4,
      question: 'How do I cancel a rental request?',
      answer: 'Once You Make a rental Request You can not cancel it unless the landlord deny it',
      category: 'booking',
    },
    {
      id: 5,
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and secure payment gateways to protect your financial information.',
      category: 'safety',
    },
    {
      id: 6,
      question: 'How do I reset my password?',
      answer: 'Tap "Forgot Password" on the login screen. Enter your email address and follow the instructions sent to your email to reset your password.',
      category: 'account',
    },
    {
      id: 7,
      question: 'What if I have issues with the app?',
      answer: 'Try clearing the app cache first. If issues persist, contact our technical support team. You can also try updating to the latest version of the app.',
      category: 'technical',
    },
    {
      id: 8,
      question: 'How are disputes resolved?',
      answer: 'If you have any issues with a booking/rental request, contact our support team immediately. We mediate disputes between tenants and property owners to ensure fair resolution.',
      category: 'safety',
    },
  ];

  const contactTopics = [
    { id: 'general', label: 'General Inquiry', icon: 'help-circle' },
    { id: 'technical', label: 'Technical Issue', icon: 'bug' },
    { id: 'billing', label: 'Billing Issue', icon: 'currency-usd' },
    { id: 'safety', label: 'Safety Concern', icon: 'shield-alert' },
    { id: 'feedback', label: 'Feedback', icon: 'message-text' },
  ];

  const supportResources = [
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: 'play-circle',
      color: '#4A6FA5',
      onPress: () => handleOpenURL('https://chumbaconnect.com/tutorials'),
    },
    {
      title: 'User Guide',
      description: 'Detailed user manual',
      icon: 'book-open',
      color: '#2A9D8F',
      onPress: () => handleOpenURL('https://chumbaconnect.com/guide'),
    },
    
  ];

  const filteredFaqs = faqs.filter(faq => 
    (activeCategory === 'all' || faq.category === activeCategory) &&
    (searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendMessage = async () => {
    if (!selectedTopic || !message.trim()) {
      Alert.alert('Error', 'Please select a topic and enter your message');
      return;
    }

    try{
      setIsSending(true);
const response=await api.post('/api/support/contact', {
      topic: selectedTopic,
      message: message.trim(),
    });

    const responsemessage=response?.data?.message || 'Message sent successfully! We\'ll respond within 24 hours.';

    setSnackbarMessage(responsemessage);
    setContactModalVisible(false);
    setMessage('');
    setSelectedTopic('');
    setSnackbarVisible(true);
    }
    catch(error){
      const errorMessage=error?.response?.data?.message || 'Failed to send message. Please try again later.';
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);

    }
    finally{
      setIsSending(false);
    }

    

    

    // In a real app, this would send to your backend
   // console.log('Sending message:', { topic: selectedTopic, message });
    
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+255 626 779 507');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:chumbaconnect@mashikutech.co.tz');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={['#4A6FA5', '#2A9D8F']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Icon name="help-circle" size={40} color="#fff" />
            </View>
            <Title style={styles.title}>Help & Support</Title>
            <Paragraph style={styles.subtitle}>
              We're here to help you with any questions
            </Paragraph>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search for help..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={theme.colors.primary}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            elevation={2}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="message-text"
            onPress={() => setContactModalVisible(true)}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            Contact Us
          </Button>
          
          <Button
            mode="outlined"
            icon="phone"
            onPress={handleCallSupport}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            Call Support
          </Button>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Browse by Category
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                icon={category.icon}
                selected={activeCategory === category.id}
                onPress={() => setActiveCategory(category.id)}
                style={[
                  styles.categoryChip,
                  activeCategory === category.id && { backgroundColor: theme.colors.primary }
                ]}
                textStyle={[
                  styles.categoryChipText,
                  activeCategory === category.id && { color: '#fff' }
                ]}
                showSelectedCheck={false}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Frequently Asked Questions
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {filteredFaqs.length} questions found
            </Text>
          </View>
          
          <Card style={styles.card} mode="elevated" elevation={2}>
            <Card.Content style={styles.cardContent}>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <View key={faq.id}>
                    <List.Accordion
                      title={faq.question}
                      titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                      description={`${categories.find(c => c.id === faq.category)?.label}`}
                      descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                      left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
                      expanded={expandedFaq === faq.id}
                      onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      style={styles.faqItem}
                    >
                      <View style={styles.faqAnswer}>
                        <Text style={{ color: theme.colors.onSurface, lineHeight: 22 }}>
                          {faq.answer}
                        </Text>
                      </View>
                    </List.Accordion>
                    {filteredFaqs.indexOf(faq) < filteredFaqs.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="magnify-close" size={60} color={theme.colors.onSurfaceVariant} />
                  <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                    No FAQs found for "{searchQuery}"
                  </Text>
                  <Button 
                    mode="text" 
                    onPress={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    style={styles.emptyStateButton}
                  >
                    Clear Search
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Support Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Support Resources
          </Text>
          <View style={styles.resourcesGrid}>
            {supportResources.map((resource, index) => (
              <Card 
                key={index} 
                style={styles.resourceCard} 
                mode="elevated"
                onPress={resource.onPress}
              >
                <Card.Content style={styles.resourceContent}>
                  <Avatar.Icon 
                    size={50} 
                    icon={resource.icon} 
                    style={[styles.resourceIcon, { backgroundColor: `${resource.color}20` }]}
                    color={resource.color}
                  />
                  <Text style={[styles.resourceTitle, { color: theme.colors.onBackground }]}>
                    {resource.title}
                  </Text>
                  <Text style={[styles.resourceDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {resource.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <Card style={[styles.card, styles.contactCard]} mode="elevated" elevation={2}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground, marginBottom: 16 }]}>
              Contact Information
            </Text>
            
            <List.Item
              title="Email Support"
              description="chumbaconnect@mashikutech.co.tz"
              left={props => <List.Icon {...props} icon="email" color="#4A6FA5" />}
              onPress={handleEmailSupport}
              style={styles.contactItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Phone Support"
              description="+255 626 779 507"
              left={props => <List.Icon {...props} icon="phone" color="#2A9D8F" />}
              onPress={handleCallSupport}
              style={styles.contactItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            <Divider style={styles.divider} />
            
           
          </Card.Content>
        </Card>

        

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            Still need help? Our team is ready to assist you.
          </Text>
          <Button 
            mode="contained" 
            icon="message" 
            onPress={() => setContactModalVisible(true)}
            style={styles.footerButton}
            contentStyle={styles.buttonContent}
          >
            Send us a message
          </Button>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Contact Modal */}
      <Portal>
        <Modal
          visible={contactModalVisible}
          onDismiss={() => {
            setContactModalVisible(false);
            setMessage('');
            setSelectedTopic('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setContactModalVisible(false)}
            />
          </View>
          
          <Divider />
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Select Topic
            </Text>
            
            <View style={styles.topicGrid}>
              {contactTopics.map((topic) => (
                <Chip
                  key={topic.id}
                  icon={topic.icon}
                  selected={selectedTopic === topic.id}
                  onPress={() => setSelectedTopic(topic.id)}
                  style={[
                    styles.topicChip,
                    selectedTopic === topic.id && { backgroundColor: theme.colors.primary }
                  ]}
                  textStyle={[
                    styles.topicChipText,
                    selectedTopic === topic.id && { color: '#fff' }
                  ]}
                  showSelectedCheck={false}
                >
                  {topic.label}
                </Chip>
              ))}
            </View>
            
            <TextInput
              label="Your Message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              style={styles.messageInput}
              mode="outlined"
              placeholder="Describe your issue or question in detail..."
            />
            
           <Button
  mode="contained"
  onPress={handleSendMessage}
  style={styles.sendButton}
  disabled={isSending || !selectedTopic || !message.trim()}
  icon={isSending ? () => <ActivityIndicator color="purple" /> : null}
>
  {isSending ? "Sending..." : "Send Message"}
</Button>

            
            <Button
              mode="text"
              onPress={() => handleEmailSupport()}
              style={styles.emailButton}
              icon="email"
            >
              Or send email instead
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Snackbar for confirmation */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
    paddingTop: 50,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  searchbar: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryChip: {
 

    marginRight: 4,
    height: 40,
    borderRadius: 20,
    paddingTop:3,
  },
  categoryChipText: {
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    paddingVertical: 8,
  },
  faqItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  faqAnswer: {
    paddingLeft: 48,
    paddingRight: 16,
    paddingBottom: 16,
  },
  divider: {
    marginVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 8,
  },
  resourcesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceCard: {
    width: '31%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resourceContent: {
    alignItems: 'center',
    padding: 12,
  },
  resourceIcon: {
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  contactCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  contactItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  hoursGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourItem: {
    alignItems: 'center',
    flex: 1,
  },
  hourDay: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  hourTime: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  footerButton: {
    borderRadius: 10,
    width: '100%',
  },
  bottomSpacer: {
    height: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  topicChip: {
    marginBottom: 8,
  },
  topicChipText: {
    fontSize: 13,
  },
  messageInput: {
    marginBottom: 20,
  },
  sendButton: {
    borderRadius: 8,
    marginBottom: 12,
  },
  emailButton: {
    marginBottom: 8,
  },
  snackbar: {
    marginBottom: 80,
  },
});

export default HelpSupportScreen;