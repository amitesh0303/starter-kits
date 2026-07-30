import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  createFakePurchaseAdapter,
  PurchaseOffering,
} from "@/adapters/purchase-adapter";

type PurchaseState = "loading" | "ready" | "purchasing" | "error" | "success";

const purchaseAdapter = createFakePurchaseAdapter("fake-user-001");

export default function PurchaseScreen(): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<PurchaseState>("loading");
  const [offerings, setOfferings] = useState<PurchaseOffering[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const offers = await purchaseAdapter.getOfferings();
        setOfferings(offers);
        setState("ready");
      } catch {
        setState("error");
        setErrorMessage("Failed to load offerings");
      }
    };
    load();
  }, []);

  const handlePurchase = async (offeringId: string): Promise<void> => {
    setState("purchasing");
    try {
      await purchaseAdapter.purchase(offeringId);
      setState("success");
      Alert.alert("Success", "Purchase completed!", [
        { text: "OK", onPress: () => router.replace("/(app)/premium") },
      ]);
    } catch {
      setState("error");
      setErrorMessage("Purchase failed. Please try again.");
    }
  };

  const handleRestore = async (): Promise<void> => {
    setState("purchasing");
    try {
      const restored = await purchaseAdapter.restorePurchases();
      if (restored.length > 0) {
        setState("success");
        Alert.alert("Restored", `${restored.length} purchase(s) restored!`);
      } else {
        setState("ready");
        Alert.alert("No Purchases", "No previous purchases found.");
      }
    } catch {
      setState("error");
      setErrorMessage("Restore failed. Please try again.");
    }
  };

  if (state === "loading") {
    return (
      <View style={styles.center} testID="purchase-loading">
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (state === "error") {
    return (
      <View style={styles.center} testID="purchase-error">
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setState("loading")}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === "purchasing") {
    return (
      <View style={styles.center} testID="purchase-processing">
        <ActivityIndicator size="large" color="#7b1fa2" />
        <Text style={styles.processingText}>Processing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="purchase-screen">
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.subtitle}>
        Unlock all features with a subscription
      </Text>

      {offerings.map((offering) => (
        <TouchableOpacity
          key={offering.id}
          style={styles.offeringCard}
          onPress={() => handlePurchase(offering.id)}
          testID={`offering-${offering.id}`}
        >
          <Text style={styles.offeringName}>{offering.name}</Text>
          <Text style={styles.offeringPrice}>{offering.priceString}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        testID="restore-button"
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  offeringCard: {
    backgroundColor: "#f3e5f5",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offeringName: { fontSize: 16, fontWeight: "600" },
  offeringPrice: { fontSize: 16, color: "#7b1fa2", fontWeight: "700" },
  restoreButton: {
    marginTop: 24,
    padding: 14,
    alignItems: "center",
  },
  restoreText: { color: "#1976d2", fontSize: 14 },
  errorText: { color: "#d32f2f", fontSize: 16, marginBottom: 16 },
  retryButton: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  processingText: { marginTop: 12, fontSize: 14, color: "#666" },
});
