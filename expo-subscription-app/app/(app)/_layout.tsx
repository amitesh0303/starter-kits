import { Stack } from "expo-router";
import React from "react";

export default function AppLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: true }} />;
}
