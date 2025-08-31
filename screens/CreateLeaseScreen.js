import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Divider, IconButton, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function CreateLeaseScreen({ route, navigation }) {
  const { request, room } = route.params;
  
  const [leaseData, setLeaseData] = useState({
    tenantName: request.tenantName,
    propertyAddress: room.location,
    rentAmount: room.price.replace(' Tsh', ''),
    securityDeposit: Math.round(parseInt(room.price.replace(/,/g, '')) * 1.5).toString(),
    leaseStartDate: request.moveInDate,
    leaseDuration: request.duration,
    paymentDueDate: '1st of each month',
    lateFee: '10,000',
    utilitiesIncluded: false,
    petsAllowed: false,
    additionalTerms: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updateLeaseData = (field, value) => {
    setLeaseData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEndDate = () => {
    const startDate = new Date(leaseData.leaseStartDate);
    const durationMatch = leaseData.leaseDuration.match(/(\d+)\s+months?/i);
    
    if (durationMatch && durationMatch[1]) {
      const months = parseInt(durationMatch[1]);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + months);
      return endDate.toISOString().split('T')[0];
    }
    
    return 'Invalid duration';
  };

  const generateHtmlContent = () => {
    const endDate = calculateEndDate();
    const totalFirstPayment = (
      parseInt(leaseData.rentAmount.replace(/,/g, '')) + 
      parseInt(leaseData.securityDeposit.replace(/,/g, ''))
    ).toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lease Agreement - ${leaseData.tenantName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 30px; 
            color: #2c3e50;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            border-bottom: 1px solid #e0e0e0; 
            padding-bottom: 8px; 
            margin-bottom: 15px; 
            color: #2c3e50; 
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px; 
          }
          .label { 
            font-size: 14px; 
            color: #7f8c8d; 
            width: 40%; 
            font-weight: 500;
          }
          .value { 
            font-size: 14px; 
            color: #2c3e50; 
            width: 60%; 
            font-weight: normal; 
          }
          .signature-area { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 80px; 
          }
          .signature-box { 
            width: 45%; 
            border-top: 1px solid #000; 
            padding-top: 15px; 
            text-align: center;
          }
          .footer { 
            text-align: center; 
            font-size: 11px; 
            color: #95a5a6; 
            margin-top: 50px;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
          .important { 
            background-color: #fff3cd; 
            padding: 15px; 
            border-radius: 5px; 
            border-left: 4px solid #ffc107;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">LEASE AGREEMENT</div>
        
        <div class="important">
          This Lease Agreement is made on ${new Date().toLocaleDateString()} between:<br>
          <strong>LANDLORD:</strong> ChumbaConnect Properties<br>
          <strong>TENANT:</strong> ${leaseData.tenantName}
        </div>
        
        <div class="section">
          <div class="section-title">Property Information</div>
          <div class="row">
            <div class="label">Property Address:</div>
            <div class="value">${leaseData.propertyAddress}</div>
          </div>
          <div class="row">
            <div class="label">Property Type:</div>
            <div class="value">${room.title}</div>
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
            <div class="value">${leaseData.leaseDuration}</div>
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
            <div class="label">Total First Payment:</div>
            <div class="value"><strong>${totalFirstPayment} Tsh</strong></div>
          </div>
          <div class="row">
            <div class="label">Payment Due Date:</div>
            <div class="value">${leaseData.paymentDueDate}</div>
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
              <div class="label">ChumbaConnect Properties</div>
              <div class="label">Date: ${new Date().toLocaleDateString()}</div>
              <div class="label" style="margin-top: 40px;">_________________________</div>
              <div class="label">Signature</div>
            </div>
            <div class="signature-box">
              <div class="value"><strong>TENANT</strong></div>
              <div class="label">${leaseData.tenantName}</div>
              <div class="label">Date: ________________</div>
              <div class="label" style="margin-top: 40px;">_________________________</div>
              <div class="label">Signature</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>Generated via ChumbaConnect</strong><br>
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

  const sendForESignature = () => {
    Alert.alert(
      'Send for E-Signature',
      `Send this lease agreement to ${request.tenantName} for electronic signature?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Generate & Send',
          onPress: async () => {
            setIsGenerating(true);
            try {
              await generateLeasePDF();
              Alert.alert(
                'Sent Successfully',
                `The lease agreement has been sent to ${request.tenantName}. You will be notified when they sign it.`
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to send agreement: ' + error.message);
            } finally {
              setIsGenerating(false);
            }
          }
        }
      ]
    );
  };

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
                <Text style={styles.overviewValue}>{leaseData.leaseDuration}</Text>
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
          />
          
          <TextInput
            label="Property Address *"
            value={leaseData.propertyAddress}
            onChangeText={(value) => updateLeaseData('propertyAddress', value)}
            style={styles.input}
            mode="outlined"
            multiline
          />
          
          <View style={styles.row}>
            <TextInput
              label="Monthly Rent (Tsh) *"
              value={leaseData.rentAmount}
              onChangeText={(value) => updateLeaseData('rentAmount', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
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
              onChangeText={(value) => updateLeaseData('leaseStartDate', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />
            <TextInput
              label="Lease End Date"
              value={calculateEndDate()}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              editable={false}
            />
          </View>
          
          <View style={styles.row}>
            <TextInput
              label="Payment Due Date *"
              value={leaseData.paymentDueDate}
              onChangeText={(value) => updateLeaseData('paymentDueDate', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
            />
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
            <Text style={styles.summaryLabel}>Total First Payment:</Text>
            <Text style={styles.summaryValue}>
              {(
                parseInt(leaseData.rentAmount.replace(/,/g, '')) + 
                parseInt(leaseData.securityDeposit.replace(/,/g, ''))
              ).toLocaleString()} Tsh
            </Text>
          </View>
          
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
          onPress={generateLeasePDF}
          style={[styles.button, styles.generateButton]}
          loading={isGenerating}
          disabled={isGenerating}
          contentStyle={styles.buttonContent}
          icon="file-document"
        >
          {isGenerating ? 'Generating...' : 'Generate Agreement'}
        </Button>
        
        <Button
          mode="contained"
          onPress={sendForESignature}
          style={[styles.button, styles.signButton]}
          contentStyle={styles.buttonContent}
          icon="pen"
        >
          Send for E-Signature
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