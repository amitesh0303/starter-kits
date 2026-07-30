import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { createFakeAuthAdapter } from "@/adapters/auth-adapter";
import { createFakeTokenStore } from "@/storage/secure-store";

type ScreenState = "idle" | "loading" | "error";

const tokenStore = createFakeTokenStore();
const authAdapter = createFakeAuthAdapter(tokenStore);

export default function SignIn(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<ScreenState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (): Promise<void> => {
    setState("loading");
    setErrorMessage(null);

    try {
      await authAdapter.signIn(email, password);
      router.replace("/(app)");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Sign in failed. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Welcome to Expo Subscription App</Text>

      {state === "error" && errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />

      {state === "loading" ? (
        <ActivityIndicator size="large" color="#1976d2" testID="loading" />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          testID="sign-in-button"
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      )}

      {state === "error" && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setState("idle")}
          testID="retry-button"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    padding: 8,
  },
  retryText: {
    color: "#1976d2",
    fontSize: 14,
  },
});
