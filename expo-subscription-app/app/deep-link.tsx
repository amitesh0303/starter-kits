import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { fakeTokenStore } from "@/storage/secure-store";

const tokenStore = fakeTokenStore;

/**
 * Deep-link destination handler.
 *
 * Handles exposubscription://premium and similar deep links.
 * - Cold start: waits for auth hydration, then navigates
 * - Warm start: push/replace only the destination without resetting navigation
 * - Auth check: redirects to sign-in if no valid session exists
 */
export default function DeepLinkScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ destination?: string }>();
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    const handleDeepLink = async (): Promise<void> => {
      // Simulate auth hydration wait (cold start)
      await new Promise((r) => setTimeout(r, 50));
      setHydrating(false);

      // Verify authentication before routing to protected screens
      const token = await tokenStore.getSessionToken();
      if (!token) {
        router.replace("/(auth)/sign-in");
        return;
      }

      const destination = params.destination ?? "premium";

      // Navigate to appropriate destination without resetting navigation
      switch (destination) {
        case "premium":
          router.replace("/(app)/premium");
          break;
        case "purchase":
          router.replace("/(app)/purchase");
          break;
        case "settings":
          router.replace("/(app)/settings");
          break;
        default:
          router.replace("/(app)");
          break;
      }
    };

    handleDeepLink();
  }, [params.destination, router]);

  if (hydrating) {
    return (
      <View style={styles.container} testID="deep-link-hydrating">
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="deep-link-redirecting">
      <Text style={styles.text}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: { marginTop: 12, fontSize: 14, color: "#666" },
});
