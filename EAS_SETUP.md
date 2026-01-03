# EAS Update Setup Guide

This document provides instructions for setting up and using EAS Update for over-the-air (OTA) updates in the Protein Tracker app.

## Prerequisites

Before you can publish OTA updates, you need to:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Create an Expo account** (if you don't have one):
   - Visit https://expo.dev
   - Sign up for a free account

3. **Login to EAS CLI**:
   ```bash
   eas login
   ```

## Initial Configuration

### 1. Update the Project ID

The `app.config.js` file contains a placeholder for the project ID. You need to update it with your actual Expo project ID:

1. Run `eas project:init` to create/link your project
2. Find your project ID in the Expo dashboard or by running `eas project:info`
3. Update `app.config.js`:
   ```javascript
   updates: {
     url: "https://u.expo.dev/YOUR_PROJECT_ID"  // Replace with actual project ID
   }
   ```

Alternatively, you can remove the `updates.url` field and let EAS automatically configure it during the build process.

### 2. Build Your App

Before you can use OTA updates, you need to create an initial build of your app:

#### For iOS:
```bash
eas build --platform ios --profile production
```

#### For Android:
```bash
eas build --platform android --profile production
```

#### For Both Platforms:
```bash
eas build --platform all --profile production
```

## Publishing Updates

Once your app is built and distributed, you can publish OTA updates:

### Production Updates
```bash
eas update --branch production --message "Fix for login bug"
```

### Preview Updates (for testing)
```bash
eas update --branch preview --message "Testing new feature"
```

## How It Works

1. **On App Launch**: The app checks for updates when it starts (only in production builds)
2. **Download**: If an update is available, it's downloaded in the background
3. **Apply**: The update is applied automatically, and the app reloads
4. **Seamless**: Users get the latest version without going to the app store

## Update Behavior

- **Development Mode**: Updates are NOT checked in development mode (`expo start`)
- **Production Builds**: Updates are checked every time the app launches
- **Silent Updates**: The update process happens silently without user interaction
- **Error Handling**: If update check fails, the app continues to work normally

## What Can Be Updated OTA

✅ **Can be updated OTA:**
- JavaScript code changes
- React components
- Business logic
- Styles and layouts
- Assets (images, fonts)
- Configuration that doesn't affect native code

❌ **Cannot be updated OTA (requires new build):**
- Native code changes
- New native modules or packages
- Changes to `app.config.js` that affect native configuration
- Permission changes
- Plugin configuration changes
- Expo SDK version updates
- App icon or splash screen

## Rollback

If you need to rollback to a previous version:

```bash
eas update --branch production --message "Rollback to previous version" --republish
```

## Monitoring Updates

You can monitor your updates in the Expo dashboard:
1. Go to https://expo.dev
2. Select your project
3. Navigate to "Updates" section
4. View deployment history, adoption rates, and errors

## Best Practices

1. **Test Before Publishing**: Always test updates in preview channel before production
2. **Meaningful Messages**: Use descriptive messages when publishing updates
3. **Monitor Adoption**: Check the Expo dashboard to see how many users have the update
4. **Gradual Rollout**: Consider using branches to gradually roll out updates
5. **Version Tracking**: Keep track of which features require new builds vs OTA updates

## Troubleshooting

### Updates Not Appearing

1. Verify the app is a production build (not development)
2. Check that the `runtimeVersion` in `app.config.js` matches your build
3. Ensure the project ID in `updates.url` is correct
4. Check the Expo dashboard for update status

### Build Errors

1. Make sure EAS CLI is up to date: `npm install -g eas-cli@latest`
2. Check that all native dependencies are properly configured
3. Review the build logs in the Expo dashboard

### Runtime Errors After Update

1. Check the Expo dashboard for error reports
2. Roll back to the previous version if necessary
3. Test the update locally before publishing

## Additional Resources

- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Runtime Version Policies](https://docs.expo.dev/eas-update/runtime-versions/)
