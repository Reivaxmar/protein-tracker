export default {
  expo: {
    name: "Protein Tracker",
    slug: "protein-tracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "proteintracker",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["CAMERA"]
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      output: "static"
    },
    plugins: [
      "expo-router",
      [
        "expo-barcode-scanner",
        {
          cameraPermission:
            "Allow Protein Tracker to access camera to scan barcodes."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow Protein Tracker to access camera to scan barcodes."
        }
      ]
    ],
    extra: {
      router: {
        basePath: "/protein-tracker" // <--- critical: must match repo name
      }
    }
  }
};
