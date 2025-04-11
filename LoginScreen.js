






import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url } from "./utils/contants";

export default function LoginScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // ✅ Initialize Animated Value
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // ✅ Apply Fade-In Animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
  
    setIsLoading(true); // Start loading
  
    try {
      // Send the username and password to the backend for validation
      const response = await fetch(`${api_url}/auth/login`,  // Change to your machine's IP
         {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        Alert.alert("Error", data.message || "Something went wrong.");
        return;
      }
      console.log(data)
  
      // On successful login, save the token
      const { userId,token } = data;  // Assuming the backend returns a token
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', userId);
  
      Alert.alert("Success", "Login successful!");
      navigation.replace("Home", { username }); // ✅ Redirect to Home
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={["#E9D5FF", "#ffffff"]} style={styles.gradient} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.header}>Login</Text>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#A855F7" />
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#A855F7" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons name={secureText ? "eye-off" : "eye"} size={20} color="#A855F7" />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <Text style={styles.subtitle}>
          Don't have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Signup")}>
            Sign up
          </Text>
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  gradient: { ...StyleSheet.absoluteFillObject },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  card: { width: "85%", backgroundColor: "#FFF", padding: 25, borderRadius: 20, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", color: "#A855F7", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F3E8FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  loginButton: {
    backgroundColor: "#A855F7",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: { color: "white", fontSize: 16, fontWeight: "500" },
  subtitle: { marginTop: 20, color: "#666", fontSize: 14 },
  link: { color: "#A855F7", fontWeight: "500" },
});