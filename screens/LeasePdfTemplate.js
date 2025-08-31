// components/LeasePdfTemplate.js
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { Page, Document, StyleSheet as PdfStyles } from '@react-pdf/renderer';

// Create styles for PDF
const styles = PdfStyles.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    borderBottom: '1pt solid #e0e0e0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    width: '40%',
  },
  value: {
    fontSize: 12,
    color: '#2c3e50',
    width: '60%',
    fontWeight: 'normal',
  },
  signatureArea: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTop: '1pt solid #000',
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#95a5a6',
  },
});

const LeasePdfTemplate = ({ leaseData, room, request }) => {
  const currentDate = new Date().toLocaleDateString();
  const endDate = calculateEndDate(leaseData.leaseStartDate, leaseData.leaseDuration);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>LEASE AGREEMENT</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties to this Agreement</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Landlord:</Text>
            <Text style={styles.value}>ChumbaConnect Properties</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tenant:</Text>
            <Text style={styles.value}>{leaseData.tenantName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Property Address:</Text>
            <Text style={styles.value}>{leaseData.propertyAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lease Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lease Start Date:</Text>
            <Text style={styles.value}>{leaseData.leaseStartDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lease End Date:</Text>
            <Text style={styles.value}>{endDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lease Duration:</Text>
            <Text style={styles.value}>{leaseData.leaseDuration}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent:</Text>
            <Text style={styles.value}>{leaseData.rentAmount} Tsh</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Security Deposit:</Text>
            <Text style={styles.value}>{leaseData.securityDeposit} Tsh</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total First Payment:</Text>
            <Text style={styles.value}>
              {(
                parseInt(leaseData.rentAmount.replace(/,/g, '')) + 
                parseInt(leaseData.securityDeposit.replace(/,/g, ''))
              ).toLocaleString()} Tsh
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Due Date:</Text>
            <Text style={styles.value}>{leaseData.paymentDueDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Late Fee:</Text>
            <Text style={styles.value}>{leaseData.lateFee} Tsh</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Utilities Included:</Text>
            <Text style={styles.value}>{leaseData.utilitiesIncluded ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pets Allowed:</Text>
            <Text style={styles.value}>{leaseData.petsAllowed ? 'Yes' : 'No'}</Text>
          </View>
          {leaseData.additionalTerms && (
            <View style={styles.row}>
              <Text style={styles.label}>Additional Terms:</Text>
              <Text style={styles.value}>{leaseData.additionalTerms}</Text>
            </View>
          )}
        </View>

        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <Text style={styles.value}>Landlord Signature</Text>
            <Text style={styles.label}>Date: {currentDate}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.value}>Tenant Signature</Text>
            <Text style={styles.label}>Date: ________________</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated via ChumbaConnect on {currentDate} • This is a legally binding document
        </Text>
      </Page>
    </Document>
  );
};

// Helper function to calculate end date
const calculateEndDate = (startDate, duration) => {
  const start = new Date(startDate);
  const durationMatch = duration.match(/(\d+)\s+months?/i);
  
  if (durationMatch && durationMatch[1]) {
    const months = parseInt(durationMatch[1]);
    const endDate = new Date(start);
    endDate.setMonth(start.getMonth() + months);
    return endDate.toISOString().split('T')[0];
  }
  
  return 'Invalid duration';
};

export default LeasePdfTemplate;