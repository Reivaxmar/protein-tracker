# Deployment Guide

This document describes how to deploy the Protein Tracker app across different platforms.

## Overview

The Protein Tracker app has **two separate deployment workflows**:

1. **Web Deployment** → GitHub Pages (automatic via GitHub Actions)
2. **Native Apps (iOS/Android)** → App Stores + EAS Update for OTA updates

## Web Deployment (GitHub Pages)

### Automatic Deployment

The web version deploys automatically to GitHub Pages when changes are pushed to the `main` branch.

**Workflow:** `.github/workflows/deploy.yml`

1. **Checkout** the repository
2. **Install** dependencies (`npm install`)
3. **Build** for web (`npx expo export --platform web`)
4. **Fix paths** for GitHub Pages using `fix-gh-pages-paths.js`
5. **Deploy** to GitHub Pages

**Live URL:** https://reivaxmar.github.io/protein-tracker

### Manual Web Deployment

To manually deploy the web version:

```bash
# Build the web version
npx expo export --platform web

# Fix paths for GitHub Pages
node fix-gh-pages-paths.js

# Deploy (requires gh-pages branch setup)
# The GitHub Actions workflow handles this automatically
```

### Important Notes

- The app uses a custom `basePath` in `app.config.js` (`/protein-tracker`) to match the GitHub Pages URL structure
- The `fix-gh-pages-paths.js` script converts absolute paths to relative paths for proper GitHub Pages operation
- Web deployment does **not** use EAS Update (it's a direct static build)

## Native App Deployment (iOS/Android)

Native app deployment involves two stages:

### 1. Initial App Store Release (Full Build)

For the first release or when native code changes are made:

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS project (first time only)
eas project:init

# Configure app.config.js with your project ID
# Update the updates.url field or remove it for auto-configuration

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Or build for both platforms
eas build --platform all --profile production
```

After the build completes:
1. Download the build artifacts from the Expo dashboard
2. Submit to Apple App Store / Google Play Store
3. Wait for app review and approval

### 2. Over-The-Air (OTA) Updates via EAS Update

For **JavaScript and asset changes only** (no native code changes):

```bash
# Publish an update to the production channel
eas update --branch production --message "Fix login bug"

# Or publish to preview channel for testing
eas update --branch preview --message "Testing new feature"
```

**Update Flow:**
1. User opens the app
2. App checks for updates (in `app/_layout.tsx`)
3. If available, downloads the update
4. Reloads the app with the new version

### What Can Be Updated OTA

✅ **OTA Updates (no rebuild required):**
- JavaScript code changes
- React components modifications
- UI/UX changes (styles, layouts)
- Business logic updates
- Asset updates (images, fonts)
- Bug fixes in JS code
- Feature additions (if no native code needed)

❌ **Requires Full Rebuild:**
- Native code changes
- New native modules/packages
- Permission changes in `app.config.js`
- Plugin configuration changes
- Expo SDK version updates
- App icon or splash screen changes
- Changes to `runtimeVersion` policy

## Build Profiles (eas.json)

The project uses three build profiles:

### Development
```bash
eas build --platform all --profile development
```
- Development client enabled
- Internal distribution
- For testing during development

### Preview
```bash
eas build --platform all --profile preview
```
- Internal distribution
- Uses `preview` update channel
- For testing before production release

### Production
```bash
eas build --platform all --profile production
```
- Production-ready build
- Uses `production` update channel
- For App Store / Google Play submission

## Update Channels

The app supports multiple update channels for phased rollouts:

- **production**: Live app updates for production builds
- **preview**: Testing updates before production release

Configure channels in `eas.json` under each build profile.

## Deployment Checklist

### Before Web Deployment
- [ ] Test the app locally with `npm start` and press `w` for web
- [ ] Ensure all links and navigation work correctly
- [ ] Verify the `basePath` in `app.config.js` matches the repository name
- [ ] Merge changes to `main` branch (triggers automatic deployment)

### Before Native App Store Release
- [ ] Update version in `app.config.js` (e.g., "1.0.0" → "1.1.0")
- [ ] Test on both iOS and Android devices
- [ ] Review all native permissions in `app.config.js`
- [ ] Update app store screenshots and descriptions if needed
- [ ] Create a full build with `eas build`
- [ ] Test the build thoroughly before submission
- [ ] Submit to App Store / Google Play
- [ ] Update release notes

### Before OTA Update
- [ ] Verify changes are JS/asset only (no native code)
- [ ] Test changes locally with `npm start`
- [ ] Consider publishing to `preview` channel first
- [ ] Publish update with descriptive message
- [ ] Monitor update adoption in Expo dashboard
- [ ] Be ready to rollback if issues arise

## Rollback Procedures

### Web Deployment
- Revert the commit in the `main` branch
- GitHub Actions will automatically redeploy the previous version

### OTA Update
```bash
# Rollback to a previous update
eas update --branch production --message "Rollback to previous version" --republish
```

### Native App
- Cannot be rolled back instantly
- Must submit a new version to app stores
- Consider using OTA update to fix critical issues if possible

## Monitoring

### Web Deployment
- Check GitHub Actions workflow runs: https://github.com/Reivaxmar/protein-tracker/actions
- View live site: https://reivaxmar.github.io/protein-tracker

### Native App Updates
- View update deployments in Expo dashboard: https://expo.dev
- Monitor update adoption rates
- Check for error reports
- Review user feedback in app stores

## Troubleshooting

### Web Deployment Fails
1. Check GitHub Actions logs for errors
2. Verify `fix-gh-pages-paths.js` runs successfully
3. Test local build: `npx expo export --platform web`
4. Ensure `basePath` is correctly configured

### EAS Build Fails
1. Check Expo dashboard for build logs
2. Verify EAS CLI is up to date: `npm install -g eas-cli@latest`
3. Ensure all dependencies are properly installed
4. Check `app.config.js` for configuration errors

### OTA Update Not Appearing
1. Verify app is a production build (not development)
2. Check `runtimeVersion` matches the build
3. Ensure project ID in `updates.url` is correct
4. Check Expo dashboard for update status
5. Wait a few minutes - updates may take time to propagate

## Additional Resources

- [EAS Setup Guide](./EAS_SETUP.md) - Detailed EAS Update configuration
- [Expo Web Documentation](https://docs.expo.dev/distribution/publishing-websites/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
