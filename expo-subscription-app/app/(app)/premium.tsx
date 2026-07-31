import { View, Text, StyleSheet } from "react-native";
import React from "react";

/**
 * Premium feature screen - shows content only accessible with active entitlement.
 */
export default function PremiumScreen(): React.JSX.Element {
  return (
    <View style={styles.container} testID="premium-screen">
      <Text style={styles.title}>Premium Features</Text>
      <Text style={styles.content}>
        You have access to all premium features including advanced reports,
        priority support, and data export.
      </Text>
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>Advanced Analytics Dashboard</Text>
        <Text style={styles.featureItem}>Custom Report Builder</Text>
        <Text style={styles.featureItem}>Priority Support Chat</Text>
        <Text style={styles.featureItem}>Multi-format Data Export</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 14,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f3e5f5",
    borderRadius: 8,
    overflow: "hidden",
  },
});
