import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

export default function ChatScreen({ route }) {
  const navigation = useNavigation();

  // Ensure route.params exists, provide a default fallback
  const service = route?.params?.service || { name: "Service Provider" };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(null); // For voice messages

  // Function to send a message and receive an automated reply
  const sendMessage = () => {
    if (message.trim()) {
      const userMessage = { id: Date.now().toString(), text: message, sender: "user", type: "text" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage("");

      // Simulate a service provider response after 1 second
      setTimeout(() => {
        const botReply = generateServiceReply(message, service.name);
        const serviceReply = { id: Date.now().toString(), text: botReply, sender: "service", type: "text" };
        setMessages((prevMessages) => [...prevMessages, serviceReply]);
      }, 1000);
    }
  };

  // Function to generate responses based on user input
  const generateServiceReply = (userText, serviceName) => {
    userText = userText.toLowerCase();

    if (userText.includes("price") || userText.includes("cost")) {
      return `The cost of ${serviceName} varies based on work. Would you like an estimate? 😊`;
    } else if (userText.includes("available") || userText.includes("timing")) {
      return `We are available 24/7 for ${serviceName}. Want to book? 📅`;
    } else if (userText.includes("experience")) {
      return `Our professionals are highly experienced in ${serviceName}. Need reviews? ⭐`;
    } else if (userText.includes("book") || userText.includes("appointment")) {
      return `You can book a ${serviceName} service anytime. Please provide your preferred date. 📅`;
    } else if (userText.includes("hello") || userText.includes("hi")) {
      return `Hello! How can we assist you with ${serviceName} today? 😊`;
    } else if (userText.includes("bye") || userText.includes("thank you")) {
      return `You're welcome! Let us know if you need ${serviceName} in the future. 🌟`;
    } else {
      return `We're happy to assist you with ${serviceName}. How can we help? 😊`;
    }
  };

  // Function to pick an image or video
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets) {
      const mediaMessage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        sender: "user",
        type: result.assets[0].type === "image" ? "image" : "video",
      };
      setMessages((prevMessages) => [...prevMessages, mediaMessage]);
    }
  };

  // Function to pick a document
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*", // Allow all file types
    });

    if (!result.cancelled) {
      const documentMessage = {
        id: Date.now().toString(),
        uri: result.uri,
        name: result.name,
        sender: "user",
        type: "document",
      };
      setMessages((prevMessages) => [...prevMessages, documentMessage]);
    }
  };

  // Function to start recording a voice message
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Function to stop recording and send the voice message
  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const voiceMessage = {
        id: Date.now().toString(),
        uri: uri,
        sender: "user",
        type: "voice",
      };
      setMessages((prevMessages) => [...prevMessages, voiceMessage]);
      setRecording(null);
    }
  };

  // Render different types of messages
  const renderMessage = ({ item }) => {
    if (item.type === "text") {
      return (
        <View
          style={[
            styles.message,
            item.sender === "user" ? styles.userMessage : styles.serviceMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      );
    } else if (item.type === "image") {
      return (
        <View
          style={[
            styles.message,
            item.sender === "user" ? styles.userMessage : styles.serviceMessage,
          ]}
        >
          <Image source={{ uri: item.uri }} style={styles.media} />
        </View>
      );
    } else if (item.type === "video") {
      return (
        <View
          style={[
            styles.message,
            item.sender === "user" ? styles.userMessage : styles.serviceMessage,
          ]}
        >
          <Video source={{ uri: item.uri }} style={styles.media} />
        </View>
      );
    } else if (item.type === "document") {
      return (
        <View
          style={[
            styles.message,
            item.sender === "user" ? styles.userMessage : styles.serviceMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.name}</Text>
        </View>
      );
    } else if (item.type === "voice") {
      return (
        <View
          style={[
            styles.message,
            item.sender === "user" ? styles.userMessage : styles.serviceMessage,
          ]}
        >
          <TouchableOpacity onPress={() => playVoiceMessage(item.uri)}>
            <Ionicons name="volume-high" size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Function to play a voice message
  const playVoiceMessage = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chat with {service.name}</Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input Container with Media Options */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickMedia} style={styles.iconButton}>
          <Ionicons name="image" size={24} color="#A855F7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickDocument} style={styles.iconButton}>
          <Ionicons name="document" size={24} color="#A855F7" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.iconButton}
        >
          <Ionicons name={recording ? "stop" : "mic"} size={24} color="#A855F7" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A855F7",
    padding: 16,
    paddingTop: 44,
  },
  backButton: { marginRight: 10 },
  headerText: { fontSize: 20, fontWeight: "bold", color: "white" },
  messagesContainer: { padding: 16 },
  message: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "75%",
  },
  userMessage: { backgroundColor: "#A855F7", alignSelf: "flex-end" },
  serviceMessage: { backgroundColor: "#5B21B6", alignSelf: "flex-start" },
  messageText: { color: "white", fontSize: 16 },
  media: { width: 200, height: 150, borderRadius: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#F3F4F6",
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
    color: "#333",
    marginHorizontal: 8,
  },
  iconButton: { padding: 8 },
  sendButton: { backgroundColor: "#A855F7", padding: 12, borderRadius: 8 },
});