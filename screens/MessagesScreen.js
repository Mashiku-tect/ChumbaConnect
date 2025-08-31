import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Avatar, IconButton, Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: '1',
      userId: 'user1',
      name: 'John Doe',
      lastMessage: 'Thanks for your interest in my property. How can I help you?',
      timestamp: '10:30 AM',
      unreadCount: 2,
      avatar: 'https://i.pravatar.cc/150?img=5',
      isOnline: true
    },
    {
      id: '2',
      userId: 'user2',
      name: 'Sarah Johnson',
      lastMessage: 'I would like to schedule a viewing for tomorrow.',
      timestamp: 'Yesterday',
      unreadCount: 0,
      avatar: 'https://i.pravatar.cc/150?img=1',
      isOnline: false
    },
    {
      id: '3',
      userId: 'user3',
      name: 'Michael Smith',
      lastMessage: 'Is the apartment still available?',
      timestamp: 'Monday',
      unreadCount: 5,
      avatar: 'https://i.pravatar.cc/150?img=8',
      isOnline: true
    },
    {
      id: '4',
      userId: 'user4',
      name: 'Emily Wilson',
      lastMessage: 'Could you send me more pictures?',
      timestamp: 'Last week',
      unreadCount: 0,
      avatar: 'https://i.pravatar.cc/150?img=11',
      isOnline: false
    },
    {
      id: '5',
      userId: 'user5',
      name: 'David Brown',
      lastMessage: 'What are the nearby amenities?',
      timestamp: '2 weeks ago',
      unreadCount: 0,
      avatar: 'https://i.pravatar.cc/150?img=15',
      isOnline: false
    },
  ]);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample users for search (in a real app, this would come from your backend)
  const allUsers = [
    {
      id: 'user6',
      name: 'Lisa Anderson',
      avatar: 'https://i.pravatar.cc/150?img=22',
      isOnline: true,
      isLandlord: true
    },
    {
      id: 'user7',
      name: 'Robert Taylor',
      avatar: 'https://i.pravatar.cc/150?img=32',
      isOnline: false,
      isLandlord: false
    },
    {
      id: 'user8',
      name: 'Maria Garcia',
      avatar: 'https://i.pravatar.cc/150?img=44',
      isOnline: true,
      isLandlord: true
    },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Filter users based on search query
    const filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filteredUsers);
  };

  const startNewConversation = (user) => {
    // Create a new conversation object
    const newConversation = {
      id: Date.now().toString(),
      userId: user.id,
      name: user.name,
      lastMessage: '',
      timestamp: 'Now',
      unreadCount: 0,
      avatar: user.avatar,
      isOnline: user.isOnline
    };
    
    // Add to conversations (in a real app, this would be saved to your backend)
    setConversations(prev => [newConversation, ...prev]);
    
    // Navigate to chat screen
    navigation.navigate('Chat', { 
      landlord: { 
        id: user.id,
        name: user.name,
        phone: '', // You would get this from your user data
        avatar: user.avatar
      } 
    });
    
    // Reset search
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Chat', { 
        landlord: { 
          id: item.userId,
          name: item.name,
          phone: '', // You would get this from your user data
          avatar: item.avatar
        } 
      })}
    >
      <Card style={styles.conversationCard}>
        <Card.Content style={styles.conversationContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Image 
              size={56} 
              source={{ uri: item.avatar }} 
              style={styles.avatar}
            />
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.conversationDetails}>
            <View style={styles.conversationHeader}>
              <Text style={styles.conversationName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'Start a conversation...'}
            </Text>
          </View>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity onPress={() => startNewConversation(item)}>
      <Card style={styles.searchResultCard}>
        <Card.Content style={styles.searchResultContent}>
          <Avatar.Image 
            size={48} 
            source={{ uri: item.avatar }} 
            style={styles.searchAvatar}
          />
          
          <View style={styles.searchResultDetails}>
            <Text style={styles.searchResultName}>{item.name}</Text>
            <Text style={styles.searchResultStatus}>
              {item.isLandlord ? 'Landlord' : 'Tenant'} • {item.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          <Button 
            mode="outlined" 
            style={styles.messageButton}
            onPress={() => startNewConversation(item)}
          >
            Message
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <IconButton
          icon="dots-vertical"
          size={24}
          onPress={() => console.log("Open options")}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
        />
      </View>

      {/* Search Results or Conversation List */}
      {isSearching ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#bdc3c7" />
              <Text style={styles.emptyStateTitle}>No users found</Text>
              <Text style={styles.emptyStateText}>
                Try searching with a different name
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyStateTitle}>No conversations yet</Text>
              <Text style={styles.emptyStateText}>
                Start a conversation by searching for a user
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    borderRadius: 10,
    elevation: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  conversationCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 1,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    backgroundColor: '#f0f2f5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  lastMessage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchResultCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 1,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchAvatar: {
    backgroundColor: '#f0f2f5',
    marginRight: 15,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  searchResultStatus: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  messageButton: {
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});