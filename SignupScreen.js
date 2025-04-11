import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url } from "./utils/contants";

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 🔍 Validate Email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔍 Validate Password
  const isValidPassword = (password) => password.length >= 6;

  // ✅ Handle Signup
  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setModalMessage("Please fill in all fields.");
      setModalVisible(true);
      return;
    }

    if (!isValidEmail(email)) {
      setModalMessage("Invalid Email. Please enter a valid email address.");
      setModalVisible(true);
      return;
    }

    if (!isValidPassword(password)) {
      setModalMessage("Weak Password. Must be at least 6 characters long.");
      setModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalMessage("Password Mismatch. Both passwords must be the same.");
      setModalVisible(true);
      return;
    }

    try {
      // 🚀 Send Signup Request to Backend
      const response = await fetch(`${api_url}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setModalMessage("Signup Successful!");
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          navigation.replace("Login", { username }); // Navigate to Home
        }, 2000);
      } else {
        setModalMessage(data.error || "Signup Failed");
        console.log(data)
        setModalVisible(true);
      }
    } catch (error) {
      setModalMessage("Network Error. Please try again later.");
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#E9D5FF", "#ffffff"]} style={styles.gradient} />

      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="black" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.header}>Signup</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#A855F7" />
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#A855F7" />
          <TextInput
            placeholder="Email ID"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#888"
          />
        </View>

        {/* Password Input with Eye Icon */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#A855F7" />
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input with Eye Icon */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#A855F7" />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Popup Modal for Messages */}
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
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  card: { width: "85%", backgroundColor: "#FFF", padding: 20, borderRadius: 20, elevation: 5 },
  header: { fontSize: 24, fontWeight: "bold", color: "#A855F7", marginBottom: 20, textAlign: "center" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3E8FF", padding: 12, borderRadius: 10, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  signupButton: { backgroundColor: "#A855F7", paddingVertical: 14, width: "100%", borderRadius: 12, alignItems: "center", marginTop: 15 },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  // ✅ Popup Modal Styles
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: 250, backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
  modalText: { fontSize: 16, color: "#333", marginBottom: 10, textAlign: "center" },
  modalButton: { backgroundColor: "#A855F7", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5 },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
