import { Stack } from "expo-router";
import React from "react";

/**
 * App group layout with auth guard.
 * In production, this would check auth state and redirect to sign-in if unauthenticated.
 */
export default function AppLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="premium" options={{ title: "Premium" }} />
      <Stack.Screen name="purchase" options={{ title: "Upgrade" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
