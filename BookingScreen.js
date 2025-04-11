import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function BookingScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load Bookings from AsyncStorage
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const storedBookings = await AsyncStorage.getItem("bookings");
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    setRefreshing(false);
  };

  // Pull-to-refresh function
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Cancel a Booking with Animation
  const handleCancelBooking = async (index) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          // Animate fade-out before removing
          bookings[index].fadeAnim.setValue(1);
          Animated.timing(bookings[index].fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            const updatedBookings = bookings.filter((_, i) => i !== index);
            setBookings(updatedBookings);
            AsyncStorage.setItem("bookings", JSON.stringify(updatedBookings));
          });
        },
      },
    ]);
  };

  // Render Each Booking
  const renderBooking = ({ item, index }) => {
    if (!item.fadeAnim) {
      item.fadeAnim = new Animated.Value(1); // Initialize animation
    }

    return (
      <Animated.View style={[styles.bookingCard, { opacity: item.fadeAnim }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Ionicons
            name={item.status === "Cancelled" ? "close-circle" : "checkmark-circle"}
            size={24}
            color={item.status === "Cancelled" ? "red" : "#A855F7"}
          />
        </View>
        <Text style={styles.details}>📅 Date: {item.date}</Text>
        <Text style={styles.details}>🔢 OTP: {item.otp}</Text>
        <Text style={[styles.status, item.status === "Cancelled" ? styles.cancelled : styles.confirmed]}>
          Status: {item.status}
        </Text>
        {item.status !== "Cancelled" && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelBooking(index)}>
            <Text style={styles.cancelText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Text style={styles.noBookings}>No bookings available.</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#A855F7"]} />}
        />
      )}
    </View>
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#A855F7",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "white", marginLeft: 10 },
  bookingCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#A855F7",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  details: { fontSize: 14, color: "#666", marginTop: 5 },
  status: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
  confirmed: { color: "#A855F7" },
  cancelled: { color: "red" },
  cancelButton: { marginTop: 10, backgroundColor: "red", padding: 12, borderRadius: 5, alignItems: "center" },
  cancelText: { color: "white", fontWeight: "bold", fontSize: 14 },
  noBookings: { textAlign: "center", fontSize: 16, color: "#777", marginTop: 30 },
});

