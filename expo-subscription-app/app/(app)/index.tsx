import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Feature, Entitlement } from "@/domain/entities";
import { partitionFeatures } from "@/domain/policies";

type DashboardState = "loading" | "empty" | "ready" | "offline" | "error";

const DEMO_FEATURES: Feature[] = [
  {
    id: "feat-1",
    name: "Basic Analytics",
    description: "View basic app usage stats",
    isPremium: false,
  },
  {
    id: "feat-2",
    name: "Advanced Reports",
    description: "Detailed analytics and custom reports",
    isPremium: true,
  },
  {
    id: "feat-3",
    name: "Priority Support",
    description: "Get priority customer support",
    isPremium: true,
  },
  {
    id: "feat-4",
    name: "Export Data",
    description: "Export your data in multiple formats",
    isPremium: true,
  },
];

export default function Dashboard(): React.JSX.Element {
  const router = useRouter();
  const [screenState, setScreenState] = useState<DashboardState>("loading");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [entitlements] = useState<Entitlement[]>([]);

  const loadData = useCallback(async (): Promise<void> => {
    setScreenState("loading");
    try {
      // In real app, fetch from Supabase + SQLite cache
      await new Promise((r) => setTimeout(r, 100));
      setFeatures(DEMO_FEATURES);
      setScreenState(DEMO_FEATURES.length === 0 ? "empty" : "ready");
    } catch {
      setScreenState("error");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (screenState === "loading") {
    return (
      <View style={styles.center} testID="loading-state">
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.stateText}>Loading features...</Text>
      </View>
    );
  }

  if (screenState === "error") {
    return (
      <View style={styles.center} testID="error-state">
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screenState === "offline") {
    return (
      <View style={styles.center} testID="offline-state">
        <Text style={styles.offlineTitle}>You are offline</Text>
        <Text style={styles.stateText}>Showing cached data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screenState === "empty") {
    return (
      <View style={styles.center} testID="empty-state">
        <Text style={styles.emptyTitle}>No features available</Text>
        <Text style={styles.stateText}>Check back later</Text>
      </View>
    );
  }

  const { accessible, locked } = partitionFeatures(features, entitlements);

  return (
    <View style={styles.container} testID="dashboard">
      <FlatList
        data={[...accessible, ...locked]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isLocked = locked.includes(item);
          return (
            <TouchableOpacity
              style={[styles.featureCard, isLocked && styles.lockedCard]}
              onPress={() => {
                if (isLocked) {
                  router.push("/(app)/purchase");
                } else {
                  router.push("/(app)/premium");
                }
              }}
            >
              <Text style={styles.featureName}>{item.name}</Text>
              <Text style={styles.featureDesc}>{item.description}</Text>
              {isLocked && <Text style={styles.lockBadge}>Premium</Text>}
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Your Features</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/settings")}>
              <Text style={styles.settingsLink}>Settings</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {locked.length > 0 && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push("/(app)/purchase")}
        >
          <Text style={styles.upgradeText}>
            Unlock {locked.length} Premium Feature{locked.length > 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Expose state setter for testing
export { DEMO_FEATURES };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  settingsLink: { color: "#1976d2", fontSize: 14 },
  featureCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  lockedCard: { opacity: 0.7 },
  featureName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  featureDesc: { fontSize: 14, color: "#666" },
  lockBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#f3e5f5",
    color: "#7b1fa2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  stateText: { fontSize: 14, color: "#666", marginTop: 8 },
  errorTitle: { fontSize: 18, fontWeight: "600", color: "#d32f2f" },
  offlineTitle: { fontSize: 18, fontWeight: "600", color: "#f57c00" },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#666" },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#1976d2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  upgradeButton: {
    backgroundColor: "#7b1fa2",
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  upgradeText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
