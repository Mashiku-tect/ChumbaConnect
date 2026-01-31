import React, { useState,useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert,ActivityIndicator } from 'react-native';
import { Text, Card, Button, TextInput, Divider, IconButton, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

//import BASE_URL from './Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import api from '../api/api';

export default function CreateLeaseScreen({ route, navigation }) {
  const { request, room } = route.params;
  //console.log('room param in create lease',room)
  //console.log("Request Data",route.params);

  const [landlorddata,setLandlordData]=useState(null);
  const [loading,setLoading]=useState(false);
  
  useEffect(() => {
    const fetchLandlordData = async () => {
      if (!room?.id) {
        console.warn("No room ID found in route params");
        return;
      }

      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("userToken");
        const response = await api.get(
          `/api/getlandlorddata/${room.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLandlordData(response.data.landlord);
        //console.log("Landlord data:", response.data.landlord);
      } catch (error) {
        //console.log("Error fetching landlord data:", error?.response?.data || error);
      } finally {
        setLoading(false);
      }
    };
    fetchLandlordData();
  }, [room?.id]); 

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate payment due date based on paid rent period
  const calculatePaymentDueDate = (startDate, durationMonths) => {
    const start = new Date(startDate);
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + parseInt(durationMonths || '0'));
    return dueDate.toISOString().split('T')[0];
  };

  const [leaseData, setLeaseData] = useState({
    tenantName: request?.User?.FirstName?? 'chumbaconnect'+" "+request?.User?.LastName?? 'user',
    propertyAddress: request?.Property?.Location?? 'N/A',
    rentAmount:parseInt(request?.Property?.PricePerMonth?? 0),
    securityDeposit: Math.round(parseInt(request?.Property?.PricePerMonth?? 0) * 1.5).toString(),
    leaseStartDate: getTodayDate(), // Set to today's date
    leaseDuration: request?.Duration?.toString() ?? '12',
    paymentDueDate: '',
    lateFee: '10000',
    utilitiesIncluded: false,
    petsAllowed: false,
    additionalTerms: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Update payment due date when lease duration changes
  useEffect(() => {
    if (leaseData.leaseStartDate && leaseData.leaseDuration) {
      const dueDate = calculatePaymentDueDate(leaseData.leaseStartDate, leaseData.leaseDuration);
      setLeaseData(prev => ({ ...prev, paymentDueDate: dueDate }));
    }
  }, [leaseData.leaseStartDate, leaseData.leaseDuration]);

  const updateLeaseData = (field, value) => {
    setLeaseData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEndDate = () => {
    const startDate = new Date(leaseData.leaseStartDate);
    if (!leaseData.leaseStartDate || isNaN(startDate)) return 'Invalid start date';
    
    const durationMonths = parseInt(leaseData.leaseDuration || '0');
    if (isNaN(durationMonths)) return 'Invalid duration';
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    return endDate.toISOString().split('T')[0];
  };

  const generateHtmlContent = () => {
    const endDate = calculateEndDate();
    const landlordName = landlorddata ? `${landlorddata.FirstName} ${landlorddata.LastName}` : 'ChumbaConnect Properties';
    const landlordEmail = landlorddata?.Email || 'N/A';
    const landlordPhone = landlorddata?.PhoneNumber || 'N/A';
    
    const rent = parseInt(leaseData.rentAmount || "0");
    const duration = parseInt(leaseData.leaseDuration || "0");
    const deposit = parseInt(leaseData.securityDeposit || "0");
    const totalFirstPayment = (rent * duration + deposit).toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lease Agreement - ${leaseData.tenantName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            line-height: 1.5;
            color: #333;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            color: #2c3e50;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 10px;
          }
          .moto {
            text-align: center;
            font-size: 10px;
            color: #800080;
            font-style: italic;
            margin-bottom: 15px;
          }
          .section { 
            margin-bottom: 15px; 
          }
          .section-title { 
            font-size: 14px; 
            font-weight: bold; 
            border-bottom: 1px solid #e0e0e0; 
            padding-bottom: 5px; 
            margin-bottom: 10px; 
            color: #2c3e50; 
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
          }
          .label { 
            font-size: 11px; 
            color: #7f8c8d; 
            width: 40%; 
            font-weight: 500;
          }
          .value { 
            font-size: 11px; 
            color: #2c3e50; 
            width: 60%; 
            font-weight: normal; 
          }
          .signature-area { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 40px; 
          }
          .signature-box { 
            width: 45%; 
            border-top: 1px solid #000; 
            padding-top: 10px; 
            text-align: center;
          }
          .footer { 
            text-align: center; 
            font-size: 9px; 
            color: #95a5a6; 
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .important { 
            background-color: #fff3cd; 
            padding: 10px; 
            border-radius: 5px; 
            border-left: 4px solid #ffc107;
            margin: 10px 0;
            font-size: 11px;
          }
          .parties-info {
            margin-bottom: 15px;
          }
          .party-details {
            font-size: 11px;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">LEASE AGREEMENT</div>
        <div class="moto">ChumbaConnect - We Connect You</div>
        
        <div class="important">
          This Lease Agreement is made on ${new Date().toLocaleDateString()} between the parties below:
        </div>
        
        <div class="parties-info">
          <div class="section-title">Parties to this Agreement</div>
          <div class="party-details">
            <strong>LANDLORD:</strong> ${landlordName}<br>
            Email: ${landlordEmail} | Phone: ${landlordPhone}
          </div>
          <div class="party-details">
            <strong>TENANT:</strong> ${leaseData.tenantName}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Property Information</div>
          <div class="row">
            <div class="label">Property Address:</div>
            <div class="value">${leaseData.propertyAddress}</div>
          </div>
          <div class="row">
            <div class="label">Property Type:</div>
            <div class="value">${request.Property.RoomType}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Lease Term</div>
          <div class="row">
            <div class="label">Lease Start Date:</div>
            <div class="value">${leaseData.leaseStartDate}</div>
          </div>
          <div class="row">
            <div class="label">Lease End Date:</div>
            <div class="value">${endDate}</div>
          </div>
          <div class="row">
            <div class="label">Lease Duration:</div>
            <div class="value">${leaseData.leaseDuration} months</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Financial Terms</div>
          <div class="row">
            <div class="label">Monthly Rent Amount:</div>
            <div class="value">${leaseData.rentAmount} Tsh</div>
          </div>
          <div class="row">
            <div class="label">Security Deposit:</div>
            <div class="value">${leaseData.securityDeposit} Tsh</div>
          </div>
         
          <div class="row">
            <div class="label">Payment Due Date:</div>
            <div class="value">When The Previous  Paid Rent Is expiring</div>
          </div>
          <div class="row">
            <div class="label">Late Payment Fee:</div>
            <div class="value">${leaseData.lateFee} Tsh</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Additional Terms & Conditions</div>
          <div class="row">
            <div class="label">Utilities Included in Rent:</div>
            <div class="value">${leaseData.utilitiesIncluded ? 'Yes' : 'No'}</div>
          </div>
          <div class="row">
            <div class="label">Pets Allowed:</div>
            <div class="value">${leaseData.petsAllowed ? 'Yes' : 'No'}</div>
          </div>
          ${leaseData.additionalTerms ? `
          <div class="row">
            <div class="label">Additional Terms:</div>
            <div class="value">${leaseData.additionalTerms}</div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Signatures</div>
          <div class="signature-area">
            <div class="signature-box">
              <div class="value"><strong>LANDLORD</strong></div>
              <div class="label">${landlordName}</div>
              <div class="label">Date: ${new Date().toLocaleDateString()}</div>
              <div class="label" style="margin-top: 20px;">_________________________</div>
              <div class="label">Signature</div>
            </div>
            <div class="signature-box">
              <div class="value"><strong>TENANT</strong></div>
              <div class="label">${leaseData.tenantName}</div>
              <div class="label">Date: ________________</div>
              <div class="label" style="margin-top: 20px;">_________________________</div>
              <div class="label">Signature</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>Generated via ChumbaConnect - We Connect You</strong><br>
          ${new Date().toLocaleDateString()} • This is a legally binding document when signed by both parties
        </div>
      </body>
      </html>
    `;
  };

  const generateLeasePDF = async () => {
    setIsGenerating(true);
    
    try {
      const htmlContent = generateHtmlContent();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      setIsGenerating(false);
      
      Alert.alert(
        'Lease Agreement Generated',
        'The lease agreement has been created successfully.',
        [
          {
            text: 'View Agreement',
            onPress: () => Print.printAsync({ uri })
          },
          {
            text: 'Share Agreement',
            onPress: () => sharePDF(uri)
          },
          {
            text: 'Done',
            style: 'cancel',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      setIsGenerating(false);
      Alert.alert('Error', 'Failed to generate PDF: ' + error.message);
    }
  };

  const handleApproveAndGenerate = async () => {
    try {
      const res = await api.put(`/api/rental-requests/leaseupdate/${request.RentalRequestId}`);
      
        await generateLeasePDF();
      
    } catch (error) {
      console.error('Lease Generation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to Generate Lease');
    }
  };

  const sharePDF = async (uri) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Lease Agreement',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          'PDF Ready',
          'The lease agreement has been saved. You can find it in your documents folder.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#800080" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Create Lease Agreement</Text>
        <View style={{ width: 24 }} />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Lease Overview</Text>
          
          <View style={styles.leaseOverview}>
            <View style={styles.overviewItem}>
              <Ionicons name="person" size={20} color="#007AFF" />
              <View style={styles.overviewText}>
                <Text style={styles.overviewLabel}>Tenant</Text>
                <Text style={styles.overviewValue}>{leaseData.tenantName}</Text>
              </View>
            </View>
            
            <View style={styles.overviewItem}>
              <Ionicons name="home" size={20} color="#007AFF" />
              <View style={styles.overviewText}>
                <Text style={styles.overviewLabel}>Property</Text>
                <Text style={styles.overviewValue}>{room.title}</Text>
              </View>
            </View>
            
            <View style={styles.overviewItem}>
              <Ionicons name="cash" size={20} color="#007AFF" />
              <View style={styles.overviewText}>
                <Text style={styles.overviewLabel}>Rent</Text>
                <Text style={styles.overviewValue}>{leaseData.rentAmount} Tsh/month</Text>
              </View>
            </View>
            
            <View style={styles.overviewItem}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <View style={styles.overviewText}>
                <Text style={styles.overviewLabel}>Duration</Text>
                <Text style={styles.overviewValue}>{leaseData.leaseDuration} Months</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Lease Terms</Text>
          
          <TextInput
            label="Tenant Full Name *"
            value={leaseData.tenantName}
            onChangeText={(value) => updateLeaseData('tenantName', value)}
            style={styles.input}
            mode="outlined"
            editable={false} // Made uneditable
          />
          
          <TextInput
            label="Property Address *"
            value={leaseData.propertyAddress}
            onChangeText={(value) => updateLeaseData('propertyAddress', value)}
            style={styles.input}
            mode="outlined"
            multiline
            editable={false} // Made uneditable
          />
          
          <View style={styles.row}>
            <TextInput
              label="Monthly Rent (Tsh) *"
              value={leaseData.rentAmount.toString()}
              onChangeText={(value) => updateLeaseData('rentAmount', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
              editable={false} // Made uneditable
            />
            <TextInput
              label="Security Deposit (Tsh) *"
              value={leaseData.securityDeposit}
              onChangeText={(value) => updateLeaseData('securityDeposit', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.row}>
            <TextInput
              label="Lease Start Date *"
              value={leaseData.leaseStartDate}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              editable={false} // Made uneditable
            />
            <TextInput
              label="Lease End Date"
              value={calculateEndDate()}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              editable={false} // Made uneditable
            />
          </View>
          
          <View style={styles.row}>
            <TextInput
              label="Lease Duration (Months) *"
              value={leaseData.leaseDuration}
              onChangeText={(value) => updateLeaseData('leaseDuration', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
            />
            <TextInput
              label="Payment Due Date"
              value={leaseData.paymentDueDate}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              editable={false} // Auto-calculated and uneditable
            />
          </View>
          
          <View style={styles.row}>
            <TextInput
              label="Late Fee (Tsh)"
              value={leaseData.lateFee}
              onChangeText={(value) => updateLeaseData('lateFee', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Utilities Included in Rent</Text>
              <Switch
                value={leaseData.utilitiesIncluded}
                onValueChange={(value) => updateLeaseData('utilitiesIncluded', value)}
                color="#007AFF"
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Pets Allowed</Text>
              <Switch
                value={leaseData.petsAllowed}
                onValueChange={(value) => updateLeaseData('petsAllowed', value)}
                color="#007AFF"
              />
            </View>
          </View>
          
          <TextInput
            label="Additional Terms & Conditions"
            value={leaseData.additionalTerms}
            onChangeText={(value) => updateLeaseData('additionalTerms', value)}
            style={[styles.input, styles.textArea]}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Enter any additional terms or special conditions..."
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Lease Summary</Text>
          
          
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Monthly Rent:</Text>
            <Text style={styles.summaryValue}>{leaseData.rentAmount} Tsh</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Security Deposit:</Text>
            <Text style={styles.summaryValue}>{leaseData.securityDeposit} Tsh</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Lease Period:</Text>
            <Text style={styles.summaryValue}>
              {leaseData.leaseStartDate} to {calculateEndDate()}
            </Text>
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
          onPress={handleApproveAndGenerate}
          style={[styles.button, styles.generateButton]}
          loading={isGenerating}
          disabled={isGenerating}
          contentStyle={styles.buttonContent}
          icon="file-document"
        >
          {isGenerating ? 'Generating...' : 'Generate Agreement'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  leaseOverview: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 15,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewText: {
    marginLeft: 12,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#e0e0e0',
  },
  switchContainer: {
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    margin: 5,
    borderRadius: 8,
    minWidth: '45%',
  },
  cancelButton: {
    borderColor: '#e74c3c',
  },
  generateButton: {
    backgroundColor: '#007AFF',
  },
  signButton: {
    backgroundColor: '#2ecc71',
  },
  buttonContent: {
    height: 50,
  },
});