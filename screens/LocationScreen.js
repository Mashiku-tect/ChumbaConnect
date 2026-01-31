import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";

export default function LocationScreen() {
  const [address, setAddress] = useState(null);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Permission needed to access location");
        return;
      }

      // Get coordinates
      const location = await Location.getCurrentPositionAsync({});
      console.log("📍 GPS:", location);

      const { latitude, longitude } = location.coords;

      // Reverse geocode
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

     // console.log("📍 Reverse Geocode:", geocode);

      setAddress(geocode[0]);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={getLocation}>
        <Text style={styles.btnText}>Get My Location</Text>
      </TouchableOpacity>

      {address && (
        <View style={styles.result}>
          <Text style={styles.text}>City: {address.city}</Text>
          <Text style={styles.text}>Region: {address.region}</Text>
          <Text style={styles.text}>Street: {address.street}</Text>
          <Text style={styles.text}>District: {address.district}</Text>
          <Text style={styles.text}>Country: {address.isoCountryCode}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  btn: {
    padding: 15,
    backgroundColor: "black",
    borderRadius: 8,
  },
  btnText: { color: "white", fontSize: 18 },
  result: { marginTop: 25 },
  text: { fontSize: 16, marginVertical: 4 },
});
