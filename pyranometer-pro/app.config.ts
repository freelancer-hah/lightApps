import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Pyranometer Pro",
  slug: "pyranometer-pro",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  icon: "./assets/icon.png",
  scheme: "pyranometerpro",
  // Compatible with Expo Go SDK 54 on both iOS (iPhone) and Android!
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission: "Pyranometer Pro uses the camera to estimate light levels and solar irradiance."
      }
    ]
  ],
  ios: {
    bundleIdentifier: "com.yourcompany.pyranometerpro",
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription:
        "Pyranometer Pro uses camera exposure and ambient lighting data to estimate solar irradiance."
    }
  },
  android: {
    package: "com.yourcompany.pyranometerpro",
    permissions: ["android.permission.CAMERA"]
  },
  extra: {
    eas: {
      projectId: "a1d7a2fe-32c5-48b6-ba90-5c799f05e606"
    }
  }
});


