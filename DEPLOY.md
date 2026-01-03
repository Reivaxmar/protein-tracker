# Deployment Guide

This guide explains how to deploy the Protein Tracker app to web, Android, and iOS platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Web Deployment (GitHub Pages)](#web-deployment-github-pages)
- [Android Deployment](#android-deployment)
- [iOS Deployment](#ios-deployment)
- [Environment Variables](#environment-variables)

## Prerequisites

Before deploying the app, ensure you have:

1. **Node.js** (v20 or higher) and npm installed
2. **Expo CLI** installed globally:
   ```bash
   npm install -g expo-cli
   ```
3. **EAS CLI** installed globally (for mobile builds):
   ```bash
   npm install -g eas-cli
   ```
4. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
5. All dependencies installed:
   ```bash
   npm install
   ```

## Web Deployment (GitHub Pages)

The app is configured to automatically deploy to GitHub Pages when code is pushed to the `main` branch.

### Automatic Deployment

The deployment is handled by the GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **GitHub Actions will automatically**:
   - Install dependencies
   - Build the web version using `npx expo export --platform web`
   - Fix paths for GitHub Pages subdirectory
   - Deploy to GitHub Pages

3. **Access your app** at:
   ```
   https://reivaxmar.github.io/protein-tracker
   ```

### Manual Web Deployment

If you need to deploy manually:

1. **Build the web version**:
   ```bash
   npx expo export --platform web
   ```

2. **Fix paths for GitHub Pages** (if deploying to a subdirectory):
   ```bash
   node fix-gh-pages-paths.js
   ```

3. **Deploy the `dist` folder** to your web hosting service

### Web Deployment Configuration

The web deployment is configured in `app.config.js`:

```javascript
web: {
  favicon: "./assets/favicon.png",
  bundler: "metro",
  output: "static"
}
```

And in `package.json`:

```json
{
  "homepage": "https://reivaxmar.github.io/protein-tracker"
}
```

## Android Deployment

To deploy the app to Android devices and the Google Play Store, use Expo Application Services (EAS Build).

### Setup for Android

1. **Login to Expo**:
   ```bash
   eas login
   ```

2. **Configure your project**:
   ```bash
   eas build:configure
   ```
   
   This creates an `eas.json` file. For Android, use this configuration:
   
   ```json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "apk"
         }
       },
       "preview": {
         "android": {
           "buildType": "apk"
         }
       },
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       }
     }
   }
   ```

### Building for Android

1. **Build APK for testing** (doesn't require Google Play account):
   ```bash
   eas build --platform android --profile preview
   ```

2. **Build AAB for Google Play Store**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Download the build** when complete:
   - The EAS CLI will provide a download link
   - Or visit https://expo.dev and navigate to your project builds

### Submitting to Google Play Store

1. **Create a Google Play Developer account** ($25 one-time fee)

2. **Create an app** in the Google Play Console

3. **Use EAS Submit**:
   ```bash
   eas submit --platform android
   ```
   
   Or manually upload the AAB file to Google Play Console.

4. **Complete the store listing**:
   - App name, description, screenshots
   - Privacy policy
   - Content rating
   - Pricing and distribution

### Installing APK on Android Device

For testing without Google Play:

1. **Transfer the APK** to your Android device
2. **Enable "Install from Unknown Sources"** in device settings
3. **Open and install** the APK file

## iOS Deployment

To deploy the app to iOS devices and the App Store, use EAS Build with an Apple Developer account.

### Prerequisites for iOS

1. **Apple Developer Account** ($99/year)
2. **Enrolled in the Apple Developer Program**

### Setup for iOS

1. **Login to Expo**:
   ```bash
   eas login
   ```

2. **Configure your project** (if not done already):
   ```bash
   eas build:configure
   ```

3. **Update `app.config.js`** with your bundle identifier:
   ```javascript
   ios: {
     supportsTablet: true,
     bundleIdentifier: "com.yourcompany.proteintracker"
   }
   ```

### Building for iOS

1. **Build for internal testing** (iOS Simulator):
   ```bash
   eas build --platform ios --profile development
   ```

2. **Build for TestFlight/App Store**:
   ```bash
   eas build --platform ios --profile production
   ```

3. **EAS will handle**:
   - Creating necessary provisioning profiles
   - Signing the app with your Apple Developer credentials
   - Building the IPA file

### Submitting to App Store

1. **Use EAS Submit**:
   ```bash
   eas submit --platform ios
   ```

2. **Or manually via Xcode**:
   - Download the IPA file
   - Use Xcode's Application Loader or Transporter app
   - Upload to App Store Connect

3. **Complete the App Store listing**:
   - App name, description, keywords
   - Screenshots (multiple sizes required)
   - Privacy policy
   - App Store categories
   - Pricing and availability

4. **Submit for review**:
   - Apple typically reviews apps within 24-48 hours
   - Address any feedback from the review team

### Testing on iOS Device

For internal testing before App Store submission:

1. **Use TestFlight**:
   ```bash
   eas build --platform ios --profile preview
   eas submit --platform ios --profile preview
   ```

2. **Invite testers** through App Store Connect

3. **Testers install** via TestFlight app on their iOS devices

## Environment Variables

If your app requires environment variables (API keys, etc.):

1. **Create a `.env` file** (don't commit to git):
   ```
   API_KEY=your_api_key_here
   ```

2. **Use `eas.json` to set environment variables**:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "API_KEY": "production_key"
         }
       }
     }
   }
   ```

3. **Or use EAS Secrets**:
   ```bash
   eas secret:create --name API_KEY --value your_api_key
   ```

## Build Profiles Explained

- **development**: For development builds with debugging enabled
- **preview**: For testing builds (APK for Android, TestFlight for iOS)
- **production**: For store submissions (AAB for Google Play, IPA for App Store)

## Common Commands Summary

### Web
```bash
# Build web
npx expo export --platform web

# Run web locally
npm run web
```

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Both Platforms
```bash
# Build for both
eas build --platform all --profile production

# Submit to both stores
eas submit --platform all
```

## Troubleshooting

### Camera Permissions on Mobile

The app requires camera permissions for barcode scanning. Ensure the permissions are properly configured in `app.config.js`:

```javascript
plugins: [
  [
    "expo-camera",
    {
      cameraPermission: "Allow Protein Tracker to access camera to scan barcodes."
    }
  ]
]
```

### Build Failures

- **Check logs**: EAS provides detailed build logs
- **Dependencies**: Ensure all dependencies are compatible with the Expo SDK version
- **Clear cache**: Try `eas build --platform [platform] --clear-cache`

### Web Routing Issues

If the app doesn't work correctly on GitHub Pages:

- Verify the `basePath` in `app.config.js` matches your repository name
- Ensure `fix-gh-pages-paths.js` is properly fixing asset paths

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [Expo Application Services](https://expo.dev/eas)

## Support

For issues or questions:
- Check the [Expo Forums](https://forums.expo.dev/)
- Review the [GitHub Issues](https://github.com/Reivaxmar/protein-tracker/issues)
- Consult the [React Native documentation](https://reactnative.dev/)
