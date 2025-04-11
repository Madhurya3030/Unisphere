import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const Stack = createStackNavigator();

const Bubble = ({ size, top, left, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, [scale, delay]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: top,
          left: left,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const StartScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(0.5)).current; // Start with a small size

  const startAnimations = useCallback(() => {
    Animated.spring(logoScale, { toValue: 1, tension: 260, friction: 20, useNativeDriver: true }).start();
    Animated.timing(contentOpacity, { toValue: 1, duration: 600, delay: 600, useNativeDriver: true }).start();
    Animated.timing(contentTranslateY, { toValue: 0, duration: 600, delay: 600, useNativeDriver: true }).start();
    Animated.timing(buttonOpacity, { toValue: 1, duration: 600, delay: 900, useNativeDriver: true }).start();
    Animated.timing(buttonTranslateY, { toValue: 0, duration: 600, delay: 900, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(logoPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Zoom in animation
    Animated.timing(imageScale, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to login page after animation completes
      navigation.navigate('Login');
    });
  }, []);

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.innerContainer}>
        <Bubble size={60} top={40} left={20} delay={300} />
        <Bubble size={40} top={height * 0.3} left={width * 0.8} delay={500} />
        <Bubble size={50} top={height * 0.7} left={30} delay={700} />
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
          <Image source={require('./assets/unilogo.jpg')} style={styles.image} />
        </Animated.View>
        <Animated.View style={[styles.footerContainer, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          <Text style={styles.subtitle}>A smarter way to get services instantly...</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 16 },
  innerContainer: { width: width * 0.9, height: height * 0.9, backgroundColor: '#A855F7', borderRadius: 30, alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' },
  bubble: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  imageContainer: { alignItems: 'center', justifyContent: 'center' },
  image: { width: 200, height: 200, borderRadius: 100 },
  footerContainer: { position: 'absolute', bottom: 40 },
  subtitle: { color: '#F3E8FF', fontSize: 16, textAlign: 'center', maxWidth: 300 },
});

export default StartScreen;

