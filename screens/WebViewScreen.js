// WebViewScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar } from 'react-native-paper';

export default function WebViewScreen({ route, navigation }) {
  const { html, title } = route.params;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title || 'Receipt'} />
      </Appbar.Header>
      <WebView
        originWhitelist={['*']}
        source={{ html: html }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});