import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { getConfig } from "@/adapters/config";
export default function RootLayout(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => { const h = async () => { try { getConfig(); } finally { setIsReady(true); } }; h(); }, []);
  if (!isReady) return <View style={styles.loading}><ActivityIndicator size="large" color="#1976d2" /></View>;
  return (<><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(auth)" /><Stack.Screen name="(app)" /></Stack><StatusBar style="auto" /></>);
}
const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" } });
