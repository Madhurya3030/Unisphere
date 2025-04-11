"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  Animated,
} from "react-native"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"

const { height, width } = Dimensions.get("window")

const services = [
  { id: "1", name: "Clinics", icon: "medkit" },
  { id: "2", name: "Physiotherapist", icon: "medical" },
  { id: "3", name: "Care Taker", icon: "heart" },
  { id: "4", name: "Home Maids", icon: "home" },
  { id: "5", name: "Electrician", icon: "flash" },
  { id: "6", name: "Plumber", icon: "water" },
  { id: "7", name: "Home Shifters", icon: "car" },
  { id: "8", name: "Painting", icon: "color-palette" },
  { id: "9", name: "Saloons", icon: "cut" },
  { id: "10", name: "Pest Control", icon: "bug" },
  { id: "11", name: "Mechanic", icon: "construct" },
  { id: "12", name: "Bike Rental", icon: "bicycle" },
]

const serviceImages = [
  require("./assets/1.jpg"),
  require("./assets/4.webp"),
  require("./assets/home2.jpg"),
  require("./assets/5..png"),
  require("./assets/shift.webp"),
]

export default function HomeScreen({ route, navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const scrollViewRef = useRef()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [username, setUsername] = useState("User") // Default to "User"
  const [location, setLocation] = useState("Fetching location...")
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(width)).current // Start off-screen to the right

  // Update username when route.params changes
  useEffect(() => {
    if (route.params?.username) {
      setUsername(route.params.username) // Set username from route.params
    }
  }, [route.params?.username])

  // Fetch location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLocation("Location permission denied")
        return
      }

      const locationData = await Location.getCurrentPositionAsync({})
      const reverseGeocode = await Location.reverseGeocodeAsync(locationData.coords)

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0]
        setLocation(`${address.city}, ${address.region}, ${address.country}`)
      } else {
        setLocation("Location not found")
      }
    })()
  }, [])

  // Auto-slide images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === serviceImages.length - 1 ? 0 : prevIndex + 1
        scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true })
        return nextIndex
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Slide menu animation
  useEffect(() => {
    if (isMenuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in from the right
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: width, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isMenuVisible])

  // Filter services based on search query
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Render service item
  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => navigation.navigate("ServiceDetail", { service: item })}
    >
      <View style={styles.serviceIcon}>
        <Ionicons name={item.icon} size={32} color="#A855F7" />
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
    </TouchableOpacity>
  )

  // Handle logout
 const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          setIsMenuVisible(false);
          await AsyncStorage.removeItem("userToken"); // Clear user session
          Alert.alert("Logged Out", "You have been successfully logged out.");
          navigation.replace("Login"); // Redirect to Login screen
        },
      },
    ],
    { cancelable: false }
  );
};


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hi, {username}</Text> {/* Display dynamic username */}
          <Text style={styles.location}>
            <Ionicons name="location" size={16} color="white" /> {location}
          </Text>
          <Text style={styles.title}>Uni-Sphere</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Image source={require("./assets/profile.png")} style={styles.profilePic} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal visible={isMenuVisible} transparent={true} animationType="none">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Profile Section */}
            <View style={styles.menuHeader}>
              <Image
                source={require("./assets/profile.png")}
                style={styles.menuProfilePic}
              />
              <Text style={styles.menuUsername}>{username}</Text> {/* Display dynamic username */}
            </View>

            {/* Menu Items */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Home")}
            >
              <Ionicons name="home" size={22} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("MyProfile")}
            >
              <Ionicons name="person" size={22} color="#16A34A" style={styles.menuIcon} />
              <Text style={styles.menuText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("MyBookings")}
            >
              <Ionicons name="calendar" size={22} color="#FACC15" style={styles.menuIcon} />
              <Text style={styles.menuText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("EmployeeLogin")}
            >
              <Ionicons name="briefcase" size={22} color="#D946EF" style={styles.menuIcon} />
              <Text style={styles.menuText}>Add My Profession</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={22} color="#DC2626" style={styles.menuIcon} />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Image Slider */}
      <View style={styles.sliderWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.sliderContainer}
        >
        
          {serviceImages.map((image, index) => (
            <View key={index} style={styles.slideWrapper}>
              <Image source={image} style={styles.slideImage} resizeMode="cover" />
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {serviceImages.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, { backgroundColor: currentIndex === index ? "#A855F7" : "#C4C4C4" }]}
            />
          ))}
        </View>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.servicesList}
        scrollEnabled={false}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: height * 0.02,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#A855F7",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  location: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderColor: "white",
    borderWidth: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: height * 0.015,
    borderWidth: 2,
    borderColor: "black",
  },
  searchInput: {
    flex: 1,
    height: height * 0.05,
    marginLeft: 8,
    fontSize: height * 0.02,
  },
  sliderWrapper: {
    alignItems: "center",
    marginTop: 10,
  },
  sliderContainer: {
    width: width,
    height: height * 0.35,
  },
  slideWrapper: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  slideImage: {
    width: width * 0.85,
    height: height * 0.28,
    borderRadius: 20,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: height * 0.02,
  },
  serviceItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: height * 0.03,
    margin: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    height: height * 0.15,
  },
  serviceName: {
    marginTop: 5,
  },
  serviceIcon: {
    marginBottom: 5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    elevation: 5,
  },
  menuHeader: {
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 15,
  },
  menuProfilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  menuUsername: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
})