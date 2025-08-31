import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Avatar, IconButton, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ route, navigation }) {
  const { landlord } = route.params;
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      sender: 'landlord', 
      text: 'Hello! Thanks for your interest in my property. How can I help you?', 
      time: '10:30 AM',
      read: true
    },
    { 
      id: '2', 
      sender: 'tenant', 
      text: 'Hi! I saw your apartment listing and would like to schedule a viewing.', 
      time: '10:32 AM',
      read: true
    },
    { 
      id: '3', 
      sender: 'landlord', 
      text: 'Sure! What day works best for you? I\'m available tomorrow afternoon or Friday morning.', 
      time: '10:33 AM',
      read: true
    },
    { 
      id: '4', 
      sender: 'tenant', 
      text: 'Tomorrow afternoon works for me. Is 2 PM okay?', 
      time: '10:35 AM',
      read: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = { 
      id: Date.now().toString(), 
      sender: 'tenant', 
      text: newMessage, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate landlord reply after 2 seconds
    setTimeout(() => {
      const reply = { 
        id: Date.now().toString() + 'reply', 
        sender: 'landlord', 
        text: 'Thanks for your message. I\'ll get back to you shortly.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'tenant' ? styles.tenantContainer : styles.landlordContainer
      ]}
    >
      {item.sender === 'landlord' && (
        <Avatar.Image 
          size={32} 
          source={{ uri: 'https://i.pravatar.cc/150?img=5' }} 
          style={styles.avatar}
        />
      )}
      
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBubble,
            item.sender === 'tenant' ? styles.tenantBubble : styles.landlordBubble
          ]}
        >
          <Text style={[
            styles.messageText,
            item.sender === 'tenant' ? styles.tenantText : styles.landlordText
          ]}>
            {item.text}
          </Text>
        </View>
        
        <View style={[
          styles.messageMeta,
          item.sender === 'tenant' ? styles.tenantMeta : styles.landlordMeta
        ]}>
          <Text style={styles.timeText}>{item.time}</Text>
          {item.sender === 'tenant' && (
            <Ionicons 
              name={item.read ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={item.read ? "#007AFF" : "#999"} 
              style={styles.readIcon}
            />
          )}
        </View>
      </View>

      {item.sender === 'tenant' && (
        <Avatar.Image 
          size={32} 
          source={{ uri: 'https://i.pravatar.cc/150?img=1' }} 
          style={styles.avatar}
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <Card style={styles.header}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Avatar.Image 
              size={40} 
              source={{ uri: 'https://i.pravatar.cc/150?img=5' }} 
              style={styles.headerAvatar}
            />
            <View>
              <Text style={styles.headerName}>{landlord.name}</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <IconButton
              icon="phone"
              size={20}
              onPress={() => console.log("Call landlord")}
            />
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => console.log("Open menu")}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            mode="flat"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.input}
            multiline
            maxLength={500}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            right={
              <TextInput.Icon 
                icon="paperclip" 
                onPress={() => console.log("Attach file")}
              />
            }
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? '#007AFF' : '#ccc' }
            ]}
            disabled={!newMessage.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    marginTop: 30,
  },
  header: {
    borderRadius: 0,
    elevation: 3,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    marginHorizontal: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerStatus: {
    fontSize: 12,
    color: '#2ecc71',
  },
  headerRight: {
    flexDirection: 'row',
  },
  messages: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  tenantContainer: {
    justifyContent: 'flex-end',
  },
  landlordContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
  },
  messageContent: {
    maxWidth: '70%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  tenantBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  landlordBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  tenantText: {
    color: '#fff',
  },
  landlordText: {
    color: '#2c3e50',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tenantMeta: {
    justifyContent: 'flex-end',
  },
  landlordMeta: {
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 25,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});