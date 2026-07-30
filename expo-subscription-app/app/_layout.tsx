import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SentryErrorBoundary } from "@/adapters/sentry-boundary";
import { getConfig } from "@/adapters/config";

/**
 * Root layout with Sentry error boundary, config hydration, and auth state.
 * Deep-link cold start waits for auth hydration before navigating.
 */
export default function RootLayout(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Hydrate config and auth on cold start
    const hydrate = async (): Promise<void> => {
      try {
        getConfig();
      } finally {
        setIsReady(true);
      }
    };
    hydrate();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <SentryErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="deep-link" />
      </Stack>
      <StatusBar style="auto" />
    </SentryErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
