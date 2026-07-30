import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";

/**
 * Settings screen with profile info and sign-out.
 */
export default function SettingsScreen(): React.JSX.Element {
  const router = useRouter();

  const handleSignOut = (): void => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <View style={styles.container} testID="settings-screen">
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.profileEmail}>dev@example.com</Text>
        <Text style={styles.profileId}>ID: fake-user-001</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Text style={styles.sectionContent}>
          Manage your subscription through the app store
        </Text>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        testID="sign-out-button"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  profileSection: { marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  sectionContent: { fontSize: 14, color: "#666" },
  profileEmail: { fontSize: 16, color: "#333", marginBottom: 4 },
  profileId: { fontSize: 12, color: "#999" },
  signOutButton: {
    backgroundColor: "#d32f2f",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
  },
  signOutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
