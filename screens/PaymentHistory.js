import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  
  ToastAndroid,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Searchbar,
  Menu,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

import BASE_URL from './Config';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import api from '../api/api';

export default function PaymentHistoryScreen({ route, navigation }) {
  const { propertyId, propertyTitle, tenant, tenantId, TenantFullName } = route.params;

  //  Normalize values
  const resolvedTenantId = tenant?.UserId || tenantId;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [menuVisible, setMenuVisible] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // ==============================
  // Fetch payment history
  // ==============================
  const fetchPaymentHistory = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');

      const response = await api.get(
        `/api/payments/property/${propertyId}/tenant/${resolvedTenantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(response.data)) {
        setPayments(response.data);
      }
    } catch (error) {
      //console.error('Error fetching payment history:', error);
      setError('Failed to load payment history. Please try again.');
      let errormessage;
      
            // Network error (no internet, server down, timeout)
            if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
              errormessage = 'Unable to connect. Please check your internet connection or try again later.';
            }
      
            // Server did not respond (request sent, no response)
            else if (error.request && !error.response) {
              errormessage = 'Server is not responding. Please try again later.';
            }
      
            // Backend responded with an error
            else if (error.response) {
              errormessage =
                error.response.data?.message || // safe access
                "Something went wrong on the server.";
            }
      
            // Unknown error
            else {
              errormessage = 'Something went wrong. Please try again.';
            }
      
            // Show toast
            if (Platform.OS === 'android') {
              ToastAndroid.showWithGravity(
                errormessage,
                ToastAndroid.LONG,
                ToastAndroid.CENTER
              );
            } else {
              Toast.show({
                type: 'error',
                text1:'Error',
                text2: errormessage
              });
            }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [propertyId, resolvedTenantId]);

   // Refresh when screen is focused
    useFocusEffect(
      useCallback(() => {
        fetchPaymentHistory();
      }, [])
    );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  // ==============================
  // Formatters
  // ==============================
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('TZS', 'Tsh');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ==============================
  // Filter + Sort
  // ==============================
  const filteredPayments = payments.filter((p) => {
    return (
      p.OrderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Phone.includes(searchQuery) ||
      p.Amount.includes?.(searchQuery)
    );
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'amount-high') return parseFloat(b.Amount) - parseFloat(a.Amount);
    if (sortBy === 'amount-low') return parseFloat(a.Amount) - parseFloat(b.Amount);
    if (sortBy === 'due-date') return new Date(a.DueDate) - new Date(b.DueDate);
    return 0;
  });

  // ==============================
  // PDF Generator (UNCHANGED)
  // ==============================
  const generatePDF = async () => {
    try {
      setGeneratingPdf(true);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background: #f2f2f2; }
                .status-completed { color: green; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Payment History - ${propertyTitle || 'ChumbaConnect Property'}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>

            <table>
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Payment Date</th>
                        <th>Status</th>
                        <th>Channel</th>
                        <th>Phone</th>
                        <th>Duration</th>
                    </tr>
                </thead>
               <tbody>
  ${(Array.isArray(payments) ? payments : [])
    .map(p => `
      <tr>
        <td>${p?.OrderReference ?? 'N/A'}</td>
        <td>${p?.Amount != null ? formatPrice(p.Amount) : '0'}</td>
        <td>${p?.DueDate ? formatDate(p.DueDate) : 'N/A'}</td>
        <td>${p?.createdAt ? formatDate(p.createdAt) : 'N/A'}</td>
        <td class="status-completed">${p?.Status ?? 'Unknown'}</td>
        <td>${p?.Channel ?? 'N/A'}</td>
        <td>${p?.Phone ?? 'N/A'}</td>
        <td>${p?.PaymentDuration != null ? `${p.PaymentDuration} months` : 'N/A'}</td>
      </tr>
    `)
    .join('')}
</tbody>

            </table>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        const pdfName = `PaymentHistory_${propertyTitle.replace(/\s+/g, '_')}.pdf`;
        const newUri = `${FileSystem.documentDirectory}${pdfName}`;

        await FileSystem.moveAsync({ from: uri, to: newUri });
        await Sharing.shareAsync(newUri);
      }

      Alert.alert('Success', 'PDF report generated!');
    } catch (error) {
     // console.error(error);
      Alert.alert('Error', 'Failed to generate PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // ==============================
  // TABLE COMPONENT
  // ==============================
  const PaymentTable = ({ payments }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* HEADER */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeader, { minWidth: 150 }]}>Reference</Text>
          <Text style={[styles.tableHeader, { minWidth: 120 }]}>Amount</Text>
          <Text style={[styles.tableHeader, { minWidth: 120 }]}>Due Date</Text>
          <Text style={[styles.tableHeader, { minWidth: 120 }]}>Paid Date</Text>
          <Text style={[styles.tableHeader, { minWidth: 100 }]}>Status</Text>
          <Text style={[styles.tableHeader, { minWidth: 120 }]}>Channel</Text>
          <Text style={[styles.tableHeader, { minWidth: 120 }]}>Phone</Text>
          <Text style={[styles.tableHeader, { minWidth: 120 }]}>Duration</Text>
        </View>

        {/* ROWS */}
       {Array.isArray(payments) && payments.map(p => (
  <View key={p?.PaymentId ?? Math.random()} style={styles.tableRow}>
    <Text style={[styles.tableCell, { minWidth: 150 }]}>{p?.OrderReference ?? 'N/A'}</Text>
    <Text style={[styles.tableCell, { minWidth: 120 }]}>{p?.Amount != null ? formatPrice(p.Amount) : '0'}</Text>
    <Text style={[styles.tableCell, { minWidth: 120 }]}>{p?.DueDate ? formatDate(p.DueDate) : 'N/A'}</Text>
    <Text style={[styles.tableCell, { minWidth: 120 }]}>{p?.createdAt ? formatDate(p.createdAt) : 'N/A'}</Text>
    <Text style={[styles.tableCell, { minWidth: 100, color: 'green' }]}>{p?.Status ?? 'Unknown'}</Text>
    <Text style={[styles.tableCell, { minWidth: 120 }]}>{p?.Channel ?? 'N/A'}</Text>
    <Text style={[styles.tableCell, { minWidth: 120 }]}>{p?.Phone ?? 'N/A'}</Text>
    <Text style={[styles.tableCell, { minWidth: 120 }]}>{p?.PaymentDuration != null ? `${p.PaymentDuration} months` : 'N/A'}</Text>
  </View>
))}

      </View>
    </ScrollView>
  );

  // ==============================
  // SUMMARY CALCULATIONS
  // ==============================
  const totalPayments = payments.length || 0;
 const totalAmount = Array.isArray(payments) 
  ? payments.reduce((sum, p) => sum + parseFloat(p?.Amount ?? 0) || 0, 0)
  : 0;


  // ==============================
  // LOADING UI
  // ==============================
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
         <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#800080" />
          <Text>Loading payment history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==============================
  // MAIN RENDER
  // ==============================
  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Payment History</Text>
            <Text style={styles.headerSubtitle}>{propertyTitle || 'ChumbaConnect Property'}</Text>
            <Text style={styles.tenantName}>
              Tenant:{" "}
              {
                tenant?.FirstName && tenant?.LastName
                  ? `${tenant.FirstName} ${tenant.LastName}`
                  : TenantFullName
              }
            </Text>
          </View>
        </View>

        {/* SUMMARY ROW - Reduced height */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalPayments || 0}</Text>
            <Text style={styles.summaryLabel}>Payments</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{formatPrice(totalAmount?? 0)}</Text>
            <Text style={styles.summaryLabel}>Total Amount</Text>
          </View>

          <View style={styles.summaryCard}>
            <Button
              mode="contained"
              onPress={generatePDF}
              loading={generatingPdf}
              icon="file-download"
              compact
              style={styles.pdfButton}
              labelStyle={styles.pdfButtonLabel}
            >
              PDF
            </Button>
          </View>
        </ScrollView>

        {/* SEARCH + SORT - Sort button positioned on right */}
        <View style={styles.controlsContainer}>
          <View style={styles.searchSortRow}>
            <Searchbar
              placeholder="Search payments by phone,amount or order reference"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton 
                  icon="sort" 
                  size={24} 
                  onPress={() => setMenuVisible(true)}
                  style={styles.sortButton}
                />
              }
            >
              <Menu.Item onPress={() => { setSortBy('newest'); setMenuVisible(false); }} title="Newest" />
              <Menu.Item onPress={() => { setSortBy('oldest'); setMenuVisible(false); }} title="Oldest" />
              <Menu.Item onPress={() => { setSortBy('amount-high'); setMenuVisible(false); }} title="Amount High → Low" />
              <Menu.Item onPress={() => { setSortBy('amount-low'); setMenuVisible(false); }} title="Amount Low → High" />
              <Menu.Item onPress={() => { setSortBy('due-date'); setMenuVisible(false); }} title="Due Date" />
            </Menu>
          </View>
        </View>

        {/* TABLE */}
        {sortedPayments.length > 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <PaymentTable payments={sortedPayments} />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text>No payments found</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==============================
// STYLES
// ==============================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS==='ios' ? 45:15, // Reduced from 45 since SafeAreaView handles status bar
    paddingBottom: 12, // Reduced padding
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
   
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2c3e50' 
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: '#007AFF' 
  },
  tenantName: { 
    fontSize: 13, 
    color: '#666' 
  },

  // Summary cards (more compact)
  summaryContainer: { 
    paddingVertical: 8, // Reduced padding
    paddingLeft: 10,
    maxHeight: 70, // Added max height constraint
  },
  summaryCard: {
    backgroundColor: '#fff',
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    elevation: 1,
    justifyContent: 'center',
    height: 50, // Fixed height
  },
  summaryNumber: { 
    fontSize: 14, // Slightly smaller
    fontWeight: 'bold', 
    color: '#2c3e50',
    marginBottom: 2, // Reduced spacing
  },
  summaryLabel: { 
    fontSize: 10, // Smaller font
    color: '#555',
  },
  pdfButton: {
    height: 32, // Smaller button
  },
  pdfButtonLabel: {
    fontSize: 12,
  },

  // Controls container
  controlsContainer: { 
    paddingHorizontal: 10, 
    paddingTop: 5,
    paddingBottom: 5,
  },
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: { 
    borderRadius: 10, 
    marginBottom: 10,
    flex: 1,
    marginRight: 8, // Space between search and sort
  },
  sortButton: {
    marginBottom: 10,
    marginLeft: 'auto', // Push to right
  },

  // Table Styles
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e9edf5',
    paddingVertical: 8,
    borderRadius: 6,
  },
  tableHeader: { 
    fontWeight: 'bold', 
    color: '#34495e', 
    paddingHorizontal: 6, 
    fontSize: 13 
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: { 
    color: '#444', 
    fontSize: 13, 
    paddingHorizontal: 6 
  },

  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});