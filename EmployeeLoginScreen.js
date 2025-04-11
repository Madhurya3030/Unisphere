import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmployeeLoginScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ Check if user is already logged in
  // useEffect(() => {
  //   const checkLoginStatus = async () => {
  //     const loggedInUser = await AsyncStorage.getItem("loggedInEmployee");
  //     if (loggedInUser) {
  //       navigation.replace("EmployeeDashboard"); // Skip login & go directly to dashboard
  //     }
  //   };
  //   checkLoginStatus();
  // }, []);

  // ✅ Handle Login
  const handleLogin = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("employeeData");

      if (!storedUser) {
        setModalMessage("No registered user found.");
        setModalVisible(true);
        return;
      }

      const { username: storedUsername, password: storedPassword } = JSON.parse(storedUser);

      if (username === storedUsername && password === storedPassword) {
        // ✅ Save login status in AsyncStorage
        await AsyncStorage.setItem("loggedInEmployee", JSON.stringify({ username }));

        setModalMessage("Login successful!");
        setModalVisible(true);

        setTimeout(() => {
          setModalVisible(false);
          navigation.replace("EmployeeDashboard");
        }, 2000);
      } else {
        setModalMessage("Invalid username or password.");
        setModalVisible(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve user data.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#E9D5FF", "#ffffff"]} style={styles.gradient} />

      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </TouchableOpacity>

      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.header}>Employee Login</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#A855F7" />
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#A855F7" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("EmployeeSignup")}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ✅ Popup Modal for Error Messages */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  gradient: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    width: "85%",
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  header: { fontSize: 24, fontWeight: "bold", color: "#A855F7", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F3E8FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#A855F7",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  loginButton: {
    backgroundColor: "#A855F7",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  signupContainer: { flexDirection: "row", marginTop: 15 },
  signupText: { fontSize: 14, color: "#333" },
  signupLink: { fontSize: 14, color: "#A855F7", fontWeight: "bold" },

  // ✅ Popup Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 250,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalText: { fontSize: 16, color: "#333", marginBottom: 10, textAlign: "center" },
  modalButton: { backgroundColor: "#A855F7", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5 },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
