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
import { Picker } from "@react-native-picker/picker";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url } from "./utils/contants";

export default function EmployeeSignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("")
  const [profession, setProfession] = useState("");
  const [address, setAddress] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 🔍 Validate Email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔍 Validate Password
  const isValidPassword = (password) => password.length >= 6;

  // ✅ Handle Signup
  const handleSignup = async () => {
    // if (!username || !email || !password || !confirmPassword || !profession || !address) {
    //   setModalMessage("Please fill in all fields.");
    //   setModalVisible(true);
    //   return;
    // }

    if (!isValidEmail(email)) {
      setModalMessage("Invalid Email. Please enter a valid email address.");
      setModalVisible(true);
      return;
    }

    // if (!isValidPassword(password)) {
    //   setModalMessage("Weak Password. Must be at least 6 characters long.");
    //   setModalVisible(true);
    //   return;
    // }

    // if (password !== confirmPassword) {
    //   setModalMessage("Password Mismatch. Both passwords must be the same.");
    //   setModalVisible(true);
    //   return;
    // }

    try {
      const id = await AsyncStorage.getItem('userId');
      console.log("id",id)
      // ✅ Store user data in AsyncStorage
      const userData = {userId:id, firstname:username, secondaryemail:email, professions:profession, address,phone:phone };
      console.log("api calling")
      const response = await fetch(`${api_url}/auth/employee-register`,
         // Change to your machine's IP
        {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
      body:JSON.stringify(userData)
     });
     console.log("api called")
      // await AsyncStorage.setItem("employeeData", JSON.stringify(userData));

      setModalMessage("Signup Successful!");
      setModalVisible(true);
      await AsyncStorage.setItem("loggedInEmployee", JSON.stringify(userData));
      setTimeout(() => {
        setModalVisible(false);
        navigation.replace("EmployeeDashboard", userData);
      }, 2000);
    } catch (error) {
      setModalMessage("Error! Failed to store data.");
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
        <Text style={styles.header}>Employee Signup</Text>

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

        {/* <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#A855F7" /> */}
          {/* <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#A855F7" />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#888"
          />
        </View> */}

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profession}
            onValueChange={(itemValue) => setProfession(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Your Profession" value="" />
            <Picker.Item label="Electrician" value="Electrician" />
            <Picker.Item label="Plumber" value="Plumber" />
            <Picker.Item label="Carpenter" value="Carpenter" />
             <Picker.Item label="Mechanic" value="Mechanic" />
              <Picker.Item label="Caretaker" value="Caretaker" />
               <Picker.Item label="BikeRental" value="BikeRental" />
                <Picker.Item label="PestControl" value="PestControl" />
                 <Picker.Item label="Homemaids" value="Homemaids" />
                  <Picker.Item label="Paintings" value="Paintings" />
                   <Picker.Item label="Clinic" value="Clinic" />
                    <Picker.Item label="HomeShifters" value="HomeShifters" />
          </Picker>
        </View>
        <View style={styles.inputContainer}>
          <Feather name="map-pin" size={20} color="#A855F7" />
          <TextInput
            placeholder="phone"
            style={styles.input}
            value={phone}
            onChangeText={(text) => setPhone(text)}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.inputContainer}>
          <Feather name="map-pin" size={20} color="#A855F7" />
          <TextInput
            placeholder="Address"
            style={styles.input}
            value={address}
            onChangeText={(text) => setAddress(text.slice(0, 100))}
            placeholderTextColor="#888"
          />
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
  pickerContainer: { backgroundColor: "#F3E8FF", borderRadius: 10, marginBottom: 15 },
  picker: { width: "100%", height: 50 },
  signupButton: { backgroundColor: "#A855F7", paddingVertical: 14, width: "100%", borderRadius: 12, alignItems: "center", marginTop: 15 },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  // ✅ Popup Modal Styles
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: 250, backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
  modalText: { fontSize: 16, color: "#333", marginBottom: 10, textAlign: "center" },
  modalButton: { backgroundColor: "#A855F7", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5 },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
