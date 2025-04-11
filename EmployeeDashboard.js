import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function EmployeeDashboard({ navigation }) { 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const employeeData = await AsyncStorage.getItem("loggedInEmployee");
        if (employeeData) {
          setUser(JSON.parse(employeeData));
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </TouchableOpacity>

      <Image source={{ uri: "https://randomuser.me/api/portraits/men/50.jpg" }} style={styles.avatar} />
      <Text style={styles.name}>{user.username}</Text>
      <Text style={styles.info}>Profession: {user.profession}</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Text style={styles.info}>Address: {user.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, color: "#555" },
});
