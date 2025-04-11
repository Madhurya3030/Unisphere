import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function TrackingScreen({ route, navigation }) {
  const { service } = route.params;
  const [status, setStatus] = useState("Confirmed");
  const [otp, setOtp] = useState("");

  // 🔹 Generate OTP
  useEffect(() => {
    const generateOtp = () => {
      let newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtp(newOtp);
    };
    generateOtp();
  }, []);

  // 🔹 Simulate Service Status Updates
  useEffect(() => {
    const statuses = ["Confirmed", "On the way", "Arrived", "In progress", "Completed"];
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++;
        setStatus(statuses[currentIndex]);
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 Save Booking to AsyncStorage
  const saveBooking = async () => {
    try {
      const existingBookings = await AsyncStorage.getItem("bookings");
      let bookings = existingBookings ? JSON.parse(existingBookings) : [];
      
      const newBooking = {
        serviceName: service.name,
        date: new Date().toLocaleDateString(),
        otp,
        status: "Confirmed",
      };

      bookings.push(newBooking);
      await AsyncStorage.setItem("bookings", JSON.stringify(bookings));

      Alert.alert("Success", "Your service has been booked!", [
        { text: "OK", onPress: () => navigation.navigate("MyBookings") }
      ]);
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Track Service</Text>
      </View>

      {/* 🔢 OTP Display */}
      <View style={styles.otpContainer}>
        <Text style={styles.otpLabel}>Your OTP</Text>
        <Text style={styles.otpValue}>{otp}</Text>
        <Text style={styles.otpHint}>Share this OTP with the service provider</Text>
      </View>

      {/* 🚀 Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status</Text>
        <View style={styles.statusBox}>
          <Ionicons name={status === "Completed" ? "checkmark-circle" : "time"} size={24} color={status === "Completed" ? "#4CAF50" : "#A855F7"} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* 📋 Service Details */}
      <View style={styles.details}>
        <Text style={styles.detailsTitle}>Service Details</Text>
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Service</Text>
          <Text style={styles.detailsValue}>{service.name}</Text>
        </View>
      </View>

      {/* ✅ Book Service Button */}
      <TouchableOpacity style={styles.bookButton} onPress={navigation.navigate("MapViewScreen")}>
        <Text style={styles.bookButtonText}>Book Service</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  header: { backgroundColor: "#A855F7", padding: 16, paddingTop: 44, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },
  otpContainer: { backgroundColor: "#F3F4F6", borderRadius: 8, padding: 16, alignItems: "center", marginVertical: 16 },
  otpLabel: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  otpValue: { fontSize: 32, fontWeight: "bold", color: "#A855F7", letterSpacing: 8, marginBottom: 8 },
  otpHint: { color: "#666", fontSize: 12 },
  statusContainer: { marginBottom: 16 },
  statusLabel: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  statusBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 8, padding: 16 },
  statusText: { marginLeft: 8, fontSize: 16, fontWeight: "500" },
  details: { backgroundColor: "#F3F4F6", borderRadius: 8, padding: 16 },
  detailsTitle: { fontSize: 16, fontWeight: "500", marginBottom: 16 },
  detailsItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  detailsLabel: { color: "#666" },
  detailsValue: { fontWeight: "500" },
  bookButton: { backgroundColor: "#A855F7", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
  bookButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});


