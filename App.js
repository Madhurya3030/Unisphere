// App.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "react-native-gesture-handler";

// Import screens
import HomeScreen from "./HomeScreen";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";
import ServiceDetailScreen from "./ServiceDetailScreen";
import TrackingScreen from "./TrackingScreen";
import ChatScreen from "./ChatScreen";
import StartScreen from "./StartScreen";
import EmployeeLoginScreen from "./EmployeeLoginScreen";
import EmployeeSignupScreen from "./EmployeeSignupScreen";
import BookingScreen from "./BookingScreen";
import ProfileScreen from "./ProfileScreen";
import EmployeeDashboard from "./EmployeeDashboard";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  // Function to update location
  const updateLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Allow location access to enable live tracking"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Retrieve user ID from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.warn("User ID not found");
        return;
      }

      // Send location to backend
      await axios.put(`http://localhost:3000/users/${userId}/location`, {
        latitude,
        longitude,
      });

      console.log("Location updated:", latitude, longitude);
    } catch (error) {
      console.error("Error updating location:", error.message);
    }
  };

  useEffect(() => {
    // Check login status and set userType
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const employeeData = await AsyncStorage.getItem("loggedInEmployee");

        if (employeeData) {
          setUserType("employee");
        } else if (userToken) {
          setUserType("customer");
        } else {
          setUserType(null);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();

    // Start location updates if userType is customer or employee
    if (userType) {
      updateLocation();
      const interval = setInterval(updateLocation, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [userType]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="StartScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="StartScreen" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="MyBookings" component={BookingScreen} />
        <Stack.Screen name="MyProfile" component={ProfileScreen} />
        <Stack.Screen name="EmployeeLogin" component={EmployeeLoginScreen} />
        <Stack.Screen name="EmployeeSignup" component={EmployeeSignupScreen} />
        <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
