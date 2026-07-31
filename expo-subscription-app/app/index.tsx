import { Redirect } from "expo-router";
import React from "react";

/**
 * Entry point: redirects to sign-in by default.
 * In a real app, this would check auth state and redirect accordingly.
 */
export default function Index(): React.JSX.Element {
  return <Redirect href="/(auth)/sign-in" />;
}
