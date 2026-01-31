import React,{useEffect} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Linking,
  Alert,
  StatusBar,
  ActivityIndicator
 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  List,
  Switch,
  Text,
  Divider,
  useTheme,
} from 'react-native-paper';
import api from '../api/api';


import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivacySecurityScreen = () => {
  const theme = useTheme();
  const [showPhoneNumber, setShowPhoneNumber] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [marketingEmails, setMarketingEmails] = React.useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [loading,setLoading]=React.useState(true);

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

  const safetyTips = [
    'Always meet in public places first',
    'Verify property ownership before payment',
    'Never share bank details via SMS',
    'Report suspicious behavior immediately',
    'Use secure payment methods only',
    'Check reviews and ratings carefully',
  ];

  const fetchTwoAuthMarketingEMail= async ()=>{
  const token=await AsyncStorage.getItem('userToken');
  try{
  const response=await api.get('/api/gettwoauthstatus',{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })

  //console.log('returned data',response.data)
  setMarketingEmails(response.data.marketingemailsenabled)
  setTwoFactorEnabled(response.data.twofactorauthenabled)
  }
  catch(error){
   console.log('Error',error)
  }
  finally{
    setLoading(false)
  }
  }

  useEffect(()=>{
  fetchTwoAuthMarketingEMail();
  },[])

  const toggleTwoFactorAuth = () => {
  Alert.alert(
    'Two-Factor Authentication',
    twoFactorEnabled
      ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
      : 'Enabling two-factor authentication adds an extra layer of security to your account. You will need to verify your identity via email when logging in.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: twoFactorEnabled ? 'Disable' : 'Enable',
        onPress: async () => {
          const newValue = !twoFactorEnabled;

          try {
            await api.post('/api/settings', {
             twoFactorAuthEnabled: newValue,
            });

            setTwoFactorEnabled(newValue);
          } catch (error) {
            Alert.alert(
              'Error',
              'Unable to update two-factor authentication. Please try again.'
            );
            console.error(error);
          }
        },
      },
    ]
  );
};


 const toggleMarketingEmails = async () => {
  const newValue = !marketingEmails;

  try {
    await api.post('/api/settings', {
      ReceiveMarketingEmails: newValue,
    });

    setMarketingEmails(newValue);
  } catch (error) {
    Alert.alert(
      'Error',
      'Unable to update email preferences. Please try again.'
    );
    console.error(error);
  }
};

if (loading ) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#800080" />
          <Text style={{ marginTop: 10, color: '#800080', fontSize: 16 }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Icon name="shield-account" size={40} color={theme.colors.primary} />
          </View>
          <Title style={[styles.title, { color: theme.colors.onBackground }]}>
            Privacy & Security
          </Title>
          <Paragraph style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Control your privacy and security settings
          </Paragraph>
        </View>

        {/* Data Protection Card */}
        <Card style={styles.card} mode="elevated" elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon name="lock" size={24} color={theme.colors.primary} />
              <Title style={[styles.cardTitle, { color: theme.colors.onBackground }]}>
                Data Protection
              </Title>
            </View>
            
            <List.Item
              title="How We Protect Your Data"
              description="End-to-end encryption and secure servers"
              left={props => <List.Icon {...props} icon="shield-lock" color={theme.colors.primary} />}
              onPress={() => handleOpenURL('https://chumbaconnect.com/data-protection')}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Information We Collect"
              description="View what data we collect and why"
              left={props => <List.Icon {...props} icon="database" color={theme.colors.primary} />}
              onPress={() => handleOpenURL('https://chumbaconnect.com/data-collection')}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Data Sharing Policy"
              description="How and when we share your information"
              left={props => <List.Icon {...props} icon="account-group" color={theme.colors.primary} />}
              onPress={() => handleOpenURL('https://chumbaconnect.com/data-sharing')}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          </Card.Content>
        </Card>

        {/* Account Security Card */}
        <Card style={styles.card} mode="elevated" elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon name="security" size={24} color={theme.colors.primary} />
              <Title style={[styles.cardTitle, { color: theme.colors.onBackground }]}>
                Account Security
              </Title>
            </View>
            
            <List.Item
              title="Two-Factor Authentication"
              description="Add extra security to your account"
              left={props => <List.Icon {...props} icon="two-factor-authentication" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={toggleTwoFactorAuth}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            
            <List.Item
              title="Marketing Emails"
              description="Receive promotional offers and updates"
              left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={marketingEmails}
                  onValueChange={toggleMarketingEmails}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          </Card.Content>
        </Card>

        {/* Safety Tips Card */}
        <Card style={styles.card} mode="elevated" elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon name="safe-square" size={24} color={theme.colors.primary} />
              <Title style={[styles.cardTitle, { color: theme.colors.onBackground }]}>
                Safety Tips
              </Title>
            </View>
            
            {safetyTips.map((tip, index) => (
              <View key={index}>
                <List.Item
                  title={tip}
                  titleNumberOfLines={2}
                  left={props => (
                    <List.Icon {...props} icon="check-circle" color={theme.colors.primary} />
                  )}
                  style={styles.listItem}
                  titleStyle={{ color: theme.colors.onSurface }}
                />
                {index < safetyTips.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Legal & Support Card */}
        <Card style={styles.card} mode="elevated" elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon name="gavel" size={24} color={theme.colors.primary} />
              <Title style={[styles.cardTitle, { color: theme.colors.onBackground }]}>
                Legal & Support
              </Title>
            </View>
            
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
              onPress={() => handleOpenURL('https://chumbaconnect.com/privacy')}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document-outline" color={theme.colors.primary} />}
              onPress={() => handleOpenURL('https://chumbaconnect.com/terms')}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Contact Privacy Team"
              description="privacy@chumbaconnect.com"
              left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
              onPress={() => Linking.openURL('mailto:privacy@chumbaconnect.com')}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          </Card.Content>
        </Card>

        {/* Footer Information */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            Your privacy and security are our top priority. All data is encrypted and protected.
          </Text>
          <Text style={[styles.footerDate, { color: theme.colors.onSurfaceVariant }]}>
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Empty space at bottom for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '600',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  divider: {
    marginVertical: 4,
  },
  footer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerDate: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default PrivacySecurityScreen;