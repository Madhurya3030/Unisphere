import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart } from "react-native-chart-kit";

const ProfileScreen = ({ route, navigation }) => {
  // Initialize profile state
  const [profile, setProfile] = useState({
    name: "",
    contact: "",
    dateOfBirth: "",
    experience: "",
    skills: "",
    profilePic: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Load profile data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem("userProfile");
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error("Failed to load profile data", error);
      }
    };
    loadProfile();
  }, []);

  // Save profile data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveProfile = async () => {
      try {
        await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      } catch (error) {
        console.error("Failed to save profile data", error);
      }
    };
    saveProfile();
  }, [profile]);

  // Handle image selection
  const pickImage = async (fromCamera) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.cancelled && result.assets) {
      setProfile({ ...profile, profilePic: result.assets[0].uri });
    }
    setModalVisible(false);
  };

  // Handle save action
  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Profile Updated", "Your profile has been successfully saved!", [
      { text: "OK" },
    ]);
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      profile.name,
      profile.contact,
      profile.dateOfBirth,
      profile.experience,
      profile.skills,
      profile.profilePic,
    ];
    const completedFields = fields.filter((field) => field !== "" && field !== null).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  // Data for the pie chart
  const pieChartData = [
    {
      name: "Completed",
      population: calculateCompletion(),
      color: "#A855F7",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Remaining",
      population: 100 - calculateCompletion(),
      color: "#E5E7EB",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* 🖼️ Profile Picture */}
      <TouchableOpacity onPress={() => isEditing && setModalVisible(true)}>
        <Image
          source={profile.profilePic ? { uri: profile.profilePic } : require("./assets/user.png")}
          style={styles.userImage}
        />
      </TouchableOpacity>
      {isEditing && <Text style={styles.changePicText}>Tap to change profile picture</Text>}

      {/* 📊 Pie Chart for Profile Completion */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Profile Completion</Text>
        <PieChart
          data={pieChartData}
          width={200}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* 📝 User Details */}
      <TextInput
        style={[styles.input, !isEditing && styles.disabledInput]}
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
        editable={isEditing}
        placeholder="Full Name"
      />
      <TextInput
        style={[styles.input, !isEditing && styles.disabledInput]}
        value={profile.contact}
        onChangeText={(text) => setProfile({ ...profile, contact: text })}
        editable={isEditing}
        keyboardType="email-address"
        placeholder="Email or Phone"
      />
      <TextInput
        style={[styles.input, !isEditing && styles.disabledInput]}
        value={profile.dateOfBirth}
        onChangeText={(text) => setProfile({ ...profile, dateOfBirth: text })}
        editable={isEditing}
        placeholder="Date of Birth (DD/MM/YYYY)"
      />
      <TextInput
        style={[styles.input, !isEditing && styles.disabledInput]}
        value={profile.experience}
        onChangeText={(text) => setProfile({ ...profile, experience: text })}
        editable={isEditing}
        placeholder="Years of Experience"
      />
      <TextInput
        style={[styles.input, !isEditing && styles.disabledInput]}
        value={profile.skills}
        onChangeText={(text) => setProfile({ ...profile, skills: text })}
        editable={isEditing}
        placeholder="Skills (e.g., Plumbing, Electrical)"
      />

      {/* 🎛️ Action Buttons */}
      {isEditing ? (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* 📷 Modal for Image Selection */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Image</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => pickImage(false)}>
              <Text style={styles.modalButtonText}>Select from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => pickImage(true)}>
              <Text style={styles.modalButtonText}>Take a New Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// 🎨 **Styling for UI**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A855F7",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#A855F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePicText: {
    textAlign: "center",
    fontSize: 14,
    color: "#A855F7",
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A855F7",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledInput: {
    backgroundColor: "#E5E7EB",
  },
  editButton: {
    backgroundColor: "#A855F7",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#A855F7",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    backgroundColor: "#A855F7",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalCancel: {
    marginTop: 5,
    padding: 12,
    width: "90%",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF0000",
  },
});

export default ProfileScreen;