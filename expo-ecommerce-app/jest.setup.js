// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-sqlite
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    runSync: jest.fn(),
  })),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  Stack: ({ children }) => children || null,
  Tabs: ({ children }) => children || null,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
  Link: ({ children }) => children,
}));
// Add Screen as property of Stack/Tabs
const { Stack, Tabs } = require("expo-router");
Stack.Screen = () => null;
Tabs.Screen = () => null;

// Mock expo-status-bar
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
  createURL: jest.fn((path) => "expocommerce://"+path),
  parse: jest.fn(),
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      scheme: "expocommerce",
    },
  },
}));
