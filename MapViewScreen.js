import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

// Update the API endpoint as needed
const API_URL = 'https://your-backend-api.com'; // Replace with your actual backend URL

const MapViewScreen = ({ userId }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Decode Polyline from Google Maps API
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  // Fetch route dynamically when location changes
  const fetchRoute = async (originLat, originLng) => {
    if (!originLat || !originLng || !destination) return;
    
    const apiKey = ''; // Replace with your API key
    const origin = `${originLat},${originLng}`;
    const dest = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Fetch source and destination coordinates from the backend
  const fetchCoordinates = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/coordinates`);
      const data = await response.json();
      if (data.source && data.destination) {
        setDestination(data.destination);
      } else {
        Alert.alert('Error', 'Failed to fetch coordinates');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  // Get real-time user location updates
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }

      // Fetch user coordinates initially
      fetchCoordinates();

      // Watch for location updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update if moved by 10 meters
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          fetchRoute(latitude, longitude); // Fetch route dynamically
        }
      );

      return () => locationSubscription.remove(); // Cleanup on unmount
    })();
  }, [userId]); // Trigger fetch when userId changes

  if (!destination) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                latitude: 13.0,
                longitude: 77.6,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }
        }
        showsUserLocation={true}
        followsUserLocation={true}
        showsTraffic={true}
      >
        {/* Destination Marker */}
        <Marker coordinate={destination} title="Destination" />

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapViewScreen;
