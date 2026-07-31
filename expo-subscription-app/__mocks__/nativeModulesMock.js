const NativeModules = {
  UIManager: {
    getViewManagerConfig: jest.fn(),
    getConstantsForViewManager: jest.fn(),
    hasViewManagerConfig: jest.fn(() => false),
  },
  PlatformConstants: {
    forceTouchAvailable: false,
  },
  NativeUnimoduleProxy: {
    viewManagersNames: [],
    viewManagersMetadata: {},
    modulesConstants: {
      mockDefinition: {
        ExponentConstants: {
          experienceUrl: { mock: "" },
        },
      },
    },
    exportedMethods: {},
  },
  Linking: {
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
  },
};

module.exports = NativeModules;
module.exports.default = NativeModules;
