import React, { useEffect, useContext } from "react";
import * as Location from "expo-location";
import axios from "axios";
import BASE_URL from "./Config";
import { LocationContext } from "../context/LocationContext";

export default function LocationHandler({ userToken }) {
  const { setLocation } = useContext(LocationContext);

  useEffect(() => {
    if (!userToken) return;

    const sendLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        const place = geo[0];

        const payload = {
          latitude,
          longitude,
          street: place.street || null,
          district: place.district || null,
          region: place.region || null,
          city: place.city || null,
        };

        // store in context
        setLocation(payload);

        // send to backend
        // await axios.post(`${BASE_URL}/api/getallproperties`, payload, {
        //   headers: { Authorization: `Bearer ${userToken}` },
        // });

        // console.log("✔ Location sent to backend & stored in context");
      } catch (err) {
        console.log("❌ Error getting location:", err);
      }
    };

    sendLocation();
  }, [userToken]);

  return null; // nothing renders
}
