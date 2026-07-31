import { Stack, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { fakeTokenStore } from "@/storage/secure-store";

const tokenStore = fakeTokenStore;

/**
 * App group layout with auth guard.
 * Checks SecureStore for a session token and redirects to sign-in if absent.
 * This prevents unauthenticated access via deep links or direct navigation.
 */
export default function AppLayout(): React.JSX.Element {
  const [authState, setAuthState] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const token = await tokenStore.getSessionToken();
        setAuthState(token ? "authenticated" : "unauthenticated");
      } catch {
        setAuthState("unauthenticated");
      }
    };
    checkAuth();
  }, []);

  if (authState === "loading") {
    return (
      <View style={styles.center} testID="app-layout-loading">
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (authState === "unauthenticated") {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="premium" options={{ title: "Premium" }} />
      <Stack.Screen name="purchase" options={{ title: "Upgrade" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

/** @internal Exported for testing auth guard behavior */
export { tokenStore as __testTokenStore };

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
