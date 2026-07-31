import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Expo Subscription App",
  slug: "expo-subscription-app",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "exposubscription",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.example.exposubscriptionapp",
  },
  android: {
    package: "com.example.exposubscriptionapp",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-sqlite",
    [
      "@sentry/react-native/expo",
      {
        organization: "example",
        project: "expo-subscription-app",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
